defmodule CalorieTrackerApi.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CalorieTrackerApiWeb.Telemetry,
      CalorieTrackerApi.Repo,
      {DNSCluster, query: Application.get_env(:calorie_tracker_api, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CalorieTrackerApi.PubSub},
      CalorieTrackerApiWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: CalorieTrackerApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    CalorieTrackerApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
