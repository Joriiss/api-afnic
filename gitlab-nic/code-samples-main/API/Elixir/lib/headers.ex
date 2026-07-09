defmodule Headers do
  # https://hexdocs.pm/elixir/Agent.html
  use Agent

  def start_link do
    Agent.start_link(fn -> Afnic.get_headers() end, name: __MODULE__)
  end

  def get do
    Agent.get(__MODULE__, & &1)
  end
end
