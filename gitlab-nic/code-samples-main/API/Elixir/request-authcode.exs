# Requests an authorization code. 

url = "https://api-sandbox.nic.fr/v1/registrar/authorization-code-requests"

if length(System.argv()) < 1 do
  raise "Boom Usage: program domain-name"
end

client = "CTC71772"
domain = String.trim(List.first(System.argv()))

args =
  Jason.encode!(%{
    domainName: domain,
    registrantClientId: client,
    justification: "Parce que c'est mon PROOOOJET !"
  })

result = HTTPoison.post!(url, args, Afnic.get_headers(), [])

case result do
  %HTTPoison.Response{status_code: 201, body: body} ->
    response = Jason.decode!(body)
    IO.puts("Code for #{domain} requested, operation ID is #{response["repositoryObjectId"]}")

  %HTTPoison.Response{status_code: 400, body: body} ->
    response = Jason.decode!(body)
    IO.puts("Code not requested because #{List.first(response["errors"])["message"]}")

  other ->
    raise "Boom (#{inspect(other)})"
end
