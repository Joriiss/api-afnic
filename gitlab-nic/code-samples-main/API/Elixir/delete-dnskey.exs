# Delete a DNSSEC key.

# Example of use:
# mix run delete-dnskey.exs café.fr 52726 RSASHA256 SHA256 91E907DB04319EAE1BAF14CE3006D94C4C94618BC4BF4CD7FA36DCF15B8AA8C9

url = "https://api-sandbox.nic.fr/v1/domains/"

if length(System.argv()) != 5 do
  raise "Boom Usage is delete-dnskey domain tag algorithm digest-type digest"
end

[domain, tag_s, algorithm, digest_type, digest] = System.argv()
{tag, extra} = Integer.parse(tag_s)

if extra != "" do
  raise "Boom Wrong format for tag \"#{tag_s}\": \"#{extra}\""
end

args =
  Jason.encode!(%{
    name: domain,
    extensions: %{
      dnsSec: %{
        keysToRemove: [
          %{keyTag: tag, algorithm: algorithm, digestType: digest_type, digest: digest}
        ]
      }
    }
  })

IO.inspect(args)
result = HTTPoison.patch!(url, args, Afnic.get_headers(), [])

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
