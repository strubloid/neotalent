defmodule CalorieTrackerApiWeb.FoodController do
  use CalorieTrackerApiWeb, :controller

  alias CalorieTrackerApi.Searches
  alias CalorieTrackerApi.Services.OpenAIService

  require Logger

  def analyze(conn, %{"food" => food_input} = params) do
    session_id = get_or_create_session_id(conn)
    ip_address = get_client_ip(conn)

    with {:ok, validation} <- validate_food_input(food_input),
         {:ok, analysis_result} <- OpenAIService.analyze_food(validation.sanitized_food),
         {:ok, saved_search} <- save_search_result(analysis_result, session_id, ip_address) do

      conn
      |> put_session(:session_id, session_id)
      |> json(%{
        success: true,
        data: format_analysis_response(analysis_result),
        search_id: saved_search.id,
        session_id: session_id,
        timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
      })
    else
      {:error, :validation, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          error: "Validation failed",
          details: errors
        })

      {:error, reason} ->
        Logger.error("Food analysis failed: #{inspect(reason)}")

        conn
        |> put_status(:service_unavailable)
        |> json(%{
          error: "Service temporarily unavailable",
          message: get_user_friendly_error(reason)
        })
    end
  end

  def analyze(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{
      error: "Missing required parameter",
      details: "Food input is required"
    })
  end

  def get_search(conn, %{"id" => search_id}) do
    session_id = get_session(conn, :session_id)

    try do
      search = Searches.get_food_search!(search_id)

      # Verify the search belongs to this session
      if search.session_id == session_id do
        conn
        |> json(%{
          success: true,
          data: format_search_response(search)
        })
      else
        conn
        |> put_status(:not_found)
        |> json(%{error: "Search not found"})
      end
    rescue
      Ecto.NoResultsError ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Search not found"})
    end
  end

  def get_history(conn, params) do
    session_id = get_or_create_session_id(conn)
    page = Map.get(params, "page", "1") |> String.to_integer()
    per_page = min(Map.get(params, "per_page", "20") |> String.to_integer(), 50)

    searches = Searches.list_searches_for_session(session_id, page: page, per_page: per_page)
    stats = Searches.get_session_stats(session_id)

    conn
    |> json(%{
      success: true,
      data: %{
        searches: Enum.map(searches, &format_search_summary/1),
        pagination: %{
          page: page,
          per_page: per_page,
          total_searches: stats.total_searches
        },
        stats: stats
      }
    })
  end

  def get_breadcrumbs(conn, _params) do
    session_id = get_session(conn, :session_id)

    if session_id do
      recent_searches = Searches.get_recent_searches(session_id, 5)

      conn
      |> json(%{
        success: true,
        data: Enum.map(recent_searches, &format_breadcrumb/1)
      })
    else
      conn
      |> json(%{
        success: true,
        data: []
      })
    end
  end

  # Private functions

  defp get_or_create_session_id(conn) do
    case get_session(conn, :session_id) do
      nil -> UUID.uuid4()
      session_id -> session_id
    end
  end

  defp get_client_ip(conn) do
    case Plug.Conn.get_req_header(conn, "x-forwarded-for") do
      [ip | _] -> ip
      [] -> conn.remote_ip |> :inet.ntoa() |> to_string()
    end
  end

  defp validate_food_input(food_input) when is_binary(food_input) do
    trimmed = String.trim(food_input)

    cond do
      trimmed == "" ->
        {:error, :validation, "Food input cannot be empty"}

      String.length(trimmed) > 500 ->
        {:error, :validation, "Food input must be less than 500 characters"}

      true ->
        sanitized = sanitize_input(trimmed)
        {:ok, %{original: trimmed, sanitized_food: sanitized}}
    end
  end

  defp validate_food_input(_), do: {:error, :validation, "Food input must be a string"}

  defp sanitize_input(input) do
    input
    |> String.replace(~r/[<>]/, "")
    |> String.trim()
  end

  defp save_search_result(analysis_result, session_id, ip_address) do
    attrs = %{
      session_id: session_id,
      query: analysis_result.query,
      total_calories: analysis_result.total_calories,
      serving_size: analysis_result.serving_size,
      confidence: analysis_result.confidence,
      breakdown: analysis_result.breakdown,
      macros: analysis_result.macros,
      ai_response: analysis_result.ai_response,
      ip_address: ip_address
    }

    Searches.create_food_search(attrs)
  end

  defp format_analysis_response(result) do
    %{
      query: result.query,
      totalCalories: result.total_calories,
      servingSize: result.serving_size,
      breakdown: result.breakdown,
      macros: result.macros,
      confidence: result.confidence
    }
  end

  defp format_search_response(search) do
    %{
      id: search.id,
      query: search.query,
      totalCalories: search.total_calories,
      servingSize: search.serving_size,
      breakdown: search.breakdown,
      macros: search.macros,
      confidence: search.confidence,
      timestamp: search.inserted_at |> DateTime.to_iso8601()
    }
  end

  defp format_search_summary(search) do
    %{
      id: search.id,
      query: search.query,
      totalCalories: search.total_calories,
      confidence: search.confidence,
      timestamp: search.inserted_at |> DateTime.to_iso8601()
    }
  end

  defp format_breadcrumb(search) do
    %{
      id: search.id,
      query: String.slice(search.query, 0, 50) <> if(String.length(search.query) > 50, "...", ""),
      totalCalories: search.total_calories,
      timestamp: search.inserted_at |> DateTime.to_iso8601()
    }
  end

  defp get_user_friendly_error("Invalid API key"), do: "AI service not properly configured"
  defp get_user_friendly_error("Rate limit exceeded"), do: "Too many requests. Please try again later"
  defp get_user_friendly_error("OpenAI service unavailable"), do: "AI service temporarily unavailable"
  defp get_user_friendly_error("Network error occurred"), do: "Network error. Please check your connection"
  defp get_user_friendly_error(_), do: "An unexpected error occurred. Please try again"
end
