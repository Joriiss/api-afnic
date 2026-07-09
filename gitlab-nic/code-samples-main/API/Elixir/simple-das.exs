# DAS (Domain Availability Service). The minimum version.

list = Jason.encode!(%{names: System.argv()})
url = "https://api-sandbox.nic.fr/v1/domains/check"
result = HTTPoison.post!(url, list, Afnic.get_headers(), [])

responses =
  case result do
    %HTTPoison.Response{status_code: 200, body: body} ->
      response = Jason.decode!(body)
      response["response"]

    other ->
      raise "Boom (#{inspect(other)})"
  end

Enum.each(responses, fn j ->
  avail =
    if j["available"] do
      "available"
    else
      "NOT available (#{j["reason"]})"
    end

  IO.puts("#{j["name"]}: #{avail}")
end)
