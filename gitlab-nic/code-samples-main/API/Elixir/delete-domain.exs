if length(System.argv()) != 1 do
  raise "Boom Usage is only one parameter, the domain name"
end

domain = String.trim(List.first(System.argv()))
encoded = URI.encode(domain)
url = "https://api-sandbox.nic.fr/v1/domains/#{encoded}"
result = HTTPoison.delete!(url, Afnic.get_headers(), [])

case result do
  %HTTPoison.Response{status_code: 200, body: body} ->
    Jason.decode!(body)
    
    other ->
    raise "Boom (#{inspect(other)})"
end

IO.puts("#{domain} deleted")
