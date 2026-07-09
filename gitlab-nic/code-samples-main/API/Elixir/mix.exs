defmodule Afnic.MixProject do
  use Mix.Project

  def project do
    [
      app: :afnic,
      version: "0.1.0",
      deps: deps()
    ]
  end

  defp deps do
    [
      {:httpoison, "~> 1.7"}, # https://hexdocs.pm/httpoison/
      {:jason, "~> 1.2"} # https://hexdocs.pm/jason/
    ]
  end
end
