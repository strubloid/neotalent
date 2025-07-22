defmodule CalorieTrackerApi.Repo do
  use Ecto.Repo,
    otp_app: :calorie_tracker_api,
    adapter: Ecto.Adapters.Postgres
end
