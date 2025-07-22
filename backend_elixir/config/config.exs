import Config

# Database configuration
config :calorie_tracker_api, CalorieTrackerApi.Repo,
  username: System.get_env("DATABASE_USER") || "postgres",
  password: System.get_env("DATABASE_PASSWORD") || "postgres",
  hostname: System.get_env("DATABASE_HOST") || "localhost",
  database: System.get_env("DATABASE_NAME") || "calorie_tracker_api_dev",
  pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "10")

# Web configuration
config :calorie_tracker_api, CalorieTrackerApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "your_secret_key_base_here",
  check_origin: ["http://localhost:3000", "https://localhost:3000"],
  server: true

# OpenAI API configuration
config :calorie_tracker_api,
  openai_api_key: System.get_env("OPENAI_API_KEY")

# Session configuration
config :calorie_tracker_api, CalorieTrackerApiWeb.Endpoint,
  session_options: [
    store: :cookie,
    key: "_calorie_tracker_api_key",
    signing_salt: "your_signing_salt_here",
    same_site: "Lax"
  ]

# Logger configuration
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Phoenix configuration
config :phoenix, :json_library, Jason

# Ecto configuration
config :calorie_tracker_api,
  ecto_repos: [CalorieTrackerApi.Repo]

# Import environment specific config
import_config "#{config_env()}.exs"
