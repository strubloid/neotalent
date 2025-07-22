defmodule CalorieTrackerApiWeb.HealthController do
  use CalorieTrackerApiWeb, :controller

  def check(conn, _params) do
    conn
    |> json(%{
      status: "ok",
      service: "calorie_tracker_api",
      version: "1.0.0",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      database: check_database(),
      openai: check_openai_config()
    })
  end

  defp check_database do
    try do
      CalorieTrackerApi.Repo.query("SELECT 1")
      "connected"
    rescue
      _ -> "disconnected"
    end
  end

  defp check_openai_config do
    case Application.get_env(:calorie_tracker_api, :openai_api_key) || System.get_env("OPENAI_API_KEY") do
      nil -> "not_configured"
      key when is_binary(key) and byte_size(key) > 0 -> "configured"
      _ -> "invalid"
    end
  end
end
