if length(System.argv()) != 1 do
  raise "Boom Usage is nameserver name"
end

ns = String.trim(List.first(System.argv()))
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

Enum.each(responses, fn j ->
  domain = j["name"]
  args = Jason.encode!(%{name: domain, nameServersToAdd: [ns]})
  result = HTTPoison.patch!(url, args, Afnic.get_headers(), [])
  case result do
    %HTTPoison.Response{status_code: 200, body: body} ->
      Jason.decode!(body)
      IO.puts("#{domain} updated")
    %HTTPoison.Response{status_code: 404} ->
      IO.puts("#{domain} does not exist")
    %HTTPoison.Response{status_code: 400, body: body} ->
      response = Jason.decode!(body)
      IO.puts("#{domain} not updated because #{List.first(response["errors"])["message"]}")
    other ->
      raise "Boom (#{inspect(other)})"
  end
end)
