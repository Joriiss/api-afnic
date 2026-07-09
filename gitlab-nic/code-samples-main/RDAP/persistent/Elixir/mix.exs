defmodule FindRdap.MixProject do
  use Mix.Project

  def project do
    [
      app: :find_rdap,
      version: "0.1.0",
      elixir: "~> 1.12",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  defp deps do
    [
      # https://hexdocs.pm/httpoison/
      {:httpoison, "~> 1.8"},
      # https://hexdocs.pm/jason/
      {:jason, "~> 1.2"},
      {:timex, "~> 3.7"}
    ]
  end
end
