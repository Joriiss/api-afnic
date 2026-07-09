# DAS (Domain Availability Service). 

list = Jason.encode!(%{names: System.argv()})
url = "https://api-sandbox.nic.fr/v1/domains/check"
result = HTTPoison.post!(url, list, Afnic.get_headers(), [])

responses =
  case result do
    %HTTPoison.Response{status_code: 200, body: body} ->
      Jason.decode!(body)

    other ->
      raise "Boom (#{inspect(other)})"
  end

extensions =
  responses["extensions"]["frnic"]["response"]
  |> Map.new(fn i ->
    {i["name"],
     %{"forbidden" => i["forbidden"], "reserved" => i["reserved"], "reason" => i["reason"]}}
  end)

Enum.each(responses["response"], fn j ->
  avail =
    if j["available"] do
      if extensions[j["name"]]["forbidden"] do
        "NOT available (forbidden)"
      else
        if extensions[j["name"]]["reserved"] do
          "available but #{extensions[j["name"]]["reason"]}"
        else
          "available"
        end
      end
    else
      "NOT available (#{j["reason"]})"
    end

  IO.puts("#{j["name"]}: #{avail}")
end)
