url = "https://api-sandbox.nic.fr/v1/domains/"

if length(System.argv()) < 2 do
  raise "Boom Usage is nameserver name, then the domain name(s)"
end

[ns | domains] = System.argv()
Enum.map(domains, fn domain ->
  args = Jason.encode!(%{name: domain, nameServersToAdd: [ns]})
  result = HTTPoison.patch!(url, args, Afnic.get_headers(), [])
  _response =
    case result do
      %HTTPoison.Response{status_code: 200, body: body} ->
	Jason.decode!(body)
	IO.puts("#{domain} updated")
      %HTTPoison.Response{status_code: 404, body: _body} ->
	IO.puts("#{domain} does not exist")
      %HTTPoison.Response{status_code: 400, body: body} ->
	response = Jason.decode!(body)
	IO.puts("#{domain} not updated because #{List.first(response["errors"])["message"]}")
      other ->
	raise "Boom (#{inspect(other)})"
    end
end)
