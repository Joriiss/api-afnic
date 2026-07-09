# Requests an authorization code. 

url = "https://api-sandbox.nic.fr/v1/registrar/authorization-code-requests"

if length(System.argv()) < 1 do
  raise "Boom Usage: program request-ID"
end

request = String.trim(List.first(System.argv()))
result = HTTPoison.get!(url <> "/" <> URI.encode(request), Afnic.get_headers(), [])

case result do
  %HTTPoison.Response{status_code: 200, body: body} ->
    response = Jason.decode!(body)
    IO.puts("State of #{request}: #{response["status"]} (last update #{response["updateDate"]})")

    if response["status"] == "ACCEPTED" do
      IO.puts("The authorization code for \"#{response["domainName"]}\" is #{response["code"]}")
    end

  %HTTPoison.Response{status_code: 400, body: body} ->
    response = Jason.decode!(body)
    IO.puts("No info for #{request} because #{List.first(response["errors"])["message"]}")

  other ->
    raise "Boom (#{inspect(other)})"
end
