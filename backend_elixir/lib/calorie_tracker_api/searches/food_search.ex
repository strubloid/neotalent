defmodule CalorieTrackerApi.Searches.FoodSearch do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "food_searches" do
    field :session_id, :string
    field :query, :string
    field :total_calories, :integer
    field :serving_size, :string
    field :confidence, :string
    field :breakdown, {:array, :map}
    field :macros, :map
    field :ai_response, :map
    field :ip_address, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(food_search, attrs) do
    food_search
    |> cast(attrs, [:session_id, :query, :total_calories, :serving_size, :confidence, :breakdown, :macros, :ai_response, :ip_address])
    |> validate_required([:session_id, :query, :total_calories])
    |> validate_length(:query, min: 1, max: 500)
    |> validate_number(:total_calories, greater_than_or_equal_to: 0)
    |> validate_inclusion(:confidence, ["high", "medium", "low"])
  end
end
