defmodule CalorieTrackerApi.Services.OpenAIService do
  @moduledoc """
  Service for interacting with OpenAI API to analyze food calories.
  """

  require Logger

  @openai_url "https://api.openai.com/v1/chat/completions"
  @model "gpt-3.5-turbo"
  @max_tokens 500
  @temperature 0.3

  def analyze_food(food_input) do
    case make_openai_request(food_input) do
      {:ok, response} -> parse_ai_response(response, food_input)
      {:error, reason} -> {:error, reason}
    end
  end

  defp make_openai_request(food_input) do
    headers = [
      {"Content-Type", "application/json"},
      {"Authorization", "Bearer #{get_api_key()}"}
    ]

    prompt = build_prompt(food_input)

    body = %{
      model: @model,
      messages: [
        %{
          role: "system",
          content: "You are a nutritionist AI that provides accurate calorie and nutritional information. Always respond with valid JSON only."
        },
        %{
          role: "user",
          content: prompt
        }
      ],
      max_tokens: @max_tokens,
      temperature: @temperature
    }

    case HTTPoison.post(@openai_url, Jason.encode!(body), headers) do
      {:ok, %HTTPoison.Response{status_code: 200, body: response_body}} ->
        case Jason.decode(response_body) do
          {:ok, decoded} -> {:ok, decoded}
          {:error, _} -> {:error, "Failed to parse OpenAI response"}
        end

      {:ok, %HTTPoison.Response{status_code: status_code, body: error_body}} ->
        Logger.error("OpenAI API error: #{status_code} - #{error_body}")
        {:error, handle_api_error(status_code, error_body)}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("HTTP request failed: #{inspect(reason)}")
        {:error, "Network error occurred"}
    end
  end

  defp build_prompt(food_input) do
    """
    Analyze the following food/meal and provide detailed nutritional information in JSON format:

    "#{String.trim(food_input)}"

    Please respond with ONLY a valid JSON object containing:
    - totalCalories (number): Total estimated calories
    - servingSize (string): Estimated serving size
    - breakdown (array): Array of food items with their individual calories
    - macros (object): Protein, carbs, fat in grams
    - confidence (string): How confident you are in this estimate (high/medium/low)

    Example format:
    {
      "totalCalories": 350,
      "servingSize": "1 medium apple with 2 tbsp peanut butter",
      "breakdown": [
        {"item": "Medium apple", "calories": 95},
        {"item": "2 tbsp peanut butter", "calories": 255}
      ],
      "macros": {
        "protein": 8,
        "carbs": 25,
        "fat": 16
      },
      "confidence": "high"
    }
    """
  end

  defp parse_ai_response(openai_response, original_query) do
    case get_in(openai_response, ["choices", Access.at(0), "message", "content"]) do
      nil ->
        {:error, "Invalid OpenAI response structure"}

      content ->
        case Jason.decode(content) do
          {:ok, nutrition_data} ->
            if valid_nutrition_data?(nutrition_data) do
              result = %{
                query: String.trim(original_query),
                total_calories: nutrition_data["totalCalories"],
                serving_size: nutrition_data["servingSize"],
                breakdown: nutrition_data["breakdown"] || [],
                macros: nutrition_data["macros"] || %{},
                confidence: nutrition_data["confidence"] || "medium",
                ai_response: nutrition_data
              }
              {:ok, result}
            else
              {:error, "Invalid nutrition data structure"}
            end

          {:error, _} ->
            {:error, "Failed to parse nutrition data from AI response"}
        end
    end
  end

  defp valid_nutrition_data?(data) do
    is_map(data) and
    is_number(data["totalCalories"]) and
    data["totalCalories"] >= 0 and
    is_binary(data["servingSize"]) and
    is_list(data["breakdown"]) and
    is_map(data["macros"])
  end

  defp handle_api_error(401, _), do: "Invalid API key"
  defp handle_api_error(429, _), do: "Rate limit exceeded"
  defp handle_api_error(503, _), do: "OpenAI service unavailable"
  defp handle_api_error(_, _), do: "OpenAI API error"

  defp get_api_key do
    Application.get_env(:calorie_tracker_api, :openai_api_key) ||
      System.get_env("OPENAI_API_KEY") ||
      raise "OpenAI API key not configured"
  end
end
