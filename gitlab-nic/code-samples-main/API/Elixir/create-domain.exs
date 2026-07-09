url = "https://api-sandbox.nic.fr/v1/domains"
contact = "CTC65093"

if length(System.argv()) != 1 do
  raise "Boom Usage is only one parameter, the domain name"
end

domain = List.first(System.argv())

body =
  Jason.encode!(%{
    name: domain,
    authorizationInformation: "Vachement1234sur",
    registrantClientId: contact,
    contacts: [
      %{
        clientId: contact,
        role: "ADMINISTRATIVE"
      },
      %{
        clientId: contact,
        role: "TECHNICAL"
      }
    ]
  })

result = HTTPoison.post!(url, body, Afnic.get_headers(), [])

response =
  case result do
    %HTTPoison.Response{status_code: 201, body: body} ->
      Jason.decode!(body)

    other ->
      raise "Boom (#{inspect(other)})"
  end

IO.puts("#{domain} created on #{response["creationDate"]}")
