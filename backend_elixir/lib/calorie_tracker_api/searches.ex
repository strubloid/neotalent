defmodule CalorieTrackerApi.Searches do
  @moduledoc """
  The Searches context for managing food search history.
  """

  import Ecto.Query, warn: false
  alias CalorieTrackerApi.Repo
  alias CalorieTrackerApi.Searches.FoodSearch

  @doc """
  Creates a food search record.
  """
  def create_food_search(attrs \\ %{}) do
    %FoodSearch{}
    |> FoodSearch.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets a single food search by id.
  """
  def get_food_search!(id), do: Repo.get!(FoodSearch, id)

  @doc """
  Gets recent searches for a session (for breadcrumb navigation).
  """
  def get_recent_searches(session_id, limit \\ 10) do
    FoodSearch
    |> where([s], s.session_id == ^session_id)
    |> order_by([s], desc: s.inserted_at)
    |> limit(^limit)
    |> Repo.all()
  end

  @doc """
  Gets search history with pagination.
  """
  def list_searches_for_session(session_id, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    offset = (page - 1) * per_page

    FoodSearch
    |> where([s], s.session_id == ^session_id)
    |> order_by([s], desc: s.inserted_at)
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
  end

  @doc """
  Gets search statistics for a session.
  """
  def get_session_stats(session_id) do
    query = from s in FoodSearch,
      where: s.session_id == ^session_id,
      select: %{
        total_searches: count(s.id),
        total_calories_analyzed: sum(s.total_calories),
        avg_calories: avg(s.total_calories),
        first_search: min(s.inserted_at),
        last_search: max(s.inserted_at)
      }

    Repo.one(query) || %{
      total_searches: 0,
      total_calories_analyzed: 0,
      avg_calories: 0,
      first_search: nil,
      last_search: nil
    }
  end

  @doc """
  Deletes old searches for cleanup (older than 30 days).
  """
  def cleanup_old_searches do
    thirty_days_ago = DateTime.utc_now() |> DateTime.add(-30, :day)

    from(s in FoodSearch, where: s.inserted_at < ^thirty_days_ago)
    |> Repo.delete_all()
  end
end
