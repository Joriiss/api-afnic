# List all my domains. Warning: it will get only the first N domains
# (N is currently 20), if you want all of them, you need to retrieve
# page by page. See list-domains-paginated.exs to see how.

url = "https://api-sandbox.nic.fr/v1/domains"
result = HTTPoison.get!(url, Afnic.get_headers(), [])

responses =
  case result do
    %HTTPoison.Response{status_code: 200, body: body} ->
      response = Jason.decode!(body)
      response["content"]

    other ->
      raise "Boom (#{inspect(other)})"
  end

Enum.each(responses, fn j -> IO.puts(j["name"]) end)
