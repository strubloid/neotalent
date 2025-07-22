defmodule CalorieTrackerApi.Repo.Migrations.CreateFoodSearches do
  use Ecto.Migration

  def change do
    create table(:food_searches, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :session_id, :string, null: false
      add :query, :string, null: false
      add :total_calories, :integer, null: false
      add :serving_size, :string
      add :confidence, :string
      add :breakdown, {:array, :map}, default: []
      add :macros, :map, default: %{}
      add :ai_response, :map
      add :ip_address, :string

      timestamps(type: :utc_datetime)
    end

    create index(:food_searches, [:session_id])
    create index(:food_searches, [:inserted_at])
    create index(:food_searches, [:session_id, :inserted_at])
  end
end
