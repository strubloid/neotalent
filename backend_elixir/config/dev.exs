import Config

# Development configuration
config :calorie_tracker_api, CalorieTrackerApi.Repo,
  database: "calorie_tracker_api_dev",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :calorie_tracker_api, CalorieTrackerApiWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "development_secret_key_base_change_me_in_production",
  watchers: []

# Enable dev routes for dashboard and mailbox
config :calorie_tracker_api, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime
