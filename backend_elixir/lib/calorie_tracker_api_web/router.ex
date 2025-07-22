defmodule CalorieTrackerApiWeb.Router do
  use CalorieTrackerApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug CORSPlug, origin: ["http://localhost:3000", "https://localhost:3000"]
    plug :put_secure_browser_headers
  end

  pipeline :health_check do
    plug :accepts, ["json"]
  end

  scope "/health", CalorieTrackerApiWeb do
    pipe_through :health_check

    get "/", HealthController, :check
  end

  scope "/api", CalorieTrackerApiWeb do
    pipe_through :api

    # Food analysis endpoints
    post "/calories", FoodController, :analyze
    get "/searches/:id", FoodController, :get_search
    get "/history", FoodController, :get_history
    get "/breadcrumbs", FoodController, :get_breadcrumbs
  end

  # Enable dashboard in development
  if Application.compile_env(:calorie_tracker_api, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: CalorieTrackerApiWeb.Telemetry
    end
  end
end
