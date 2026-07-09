defmodule Afnic do
  @filename System.get_env("HOME") <> "/.afnic-api"

  def get_token() do
    {login, password} =
      case File.open(@filename, [:read, :utf8]) do
        {:ok, handle} ->
          {String.trim(IO.read(handle, :line)), String.trim(IO.read(handle, :line))}

        {:error, reason} ->
          raise "Boom #{@filename}: #{reason}"
      end

    url = "https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token"

    body =
      {:form,
       [
         client_id: "registrars-api-client",
         username: login,
         password: password,
         grant_type: "password"
       ]}

    headers = [{"Accept", "application/json"}]
    result = HTTPoison.post!(url, body, headers, [])

    case result do
      %HTTPoison.Response{status_code: 200, body: body} ->
        response = Jason.decode!(body)
        response["access_token"]

      other ->
        raise "Boom (#{inspect(other)})"
    end
  end

  def get_headers() do
    token = get_token()

    [
      {"Accept", "application/json"},
      {"Content-Type", "application/json"},
      {"Extensions", "FRNIC_V2, SECDNS_V1_1"},
      {"Authorization", "Bearer #{token}"}
    ]
  end
end
