# List all my domains. 

defmodule Retrieval do
  @url "https://api-sandbox.nic.fr/v1/domains"
  # The maximum value, over 100, you'll get a 400 HTTP error.
  @page_size 100

  def get_next(page) do
    result = HTTPoison.get!(@url <> "?pageSize=#{@page_size}&page=#{page}", Headers.get(), [])

    content =
      case result do
        %HTTPoison.Response{status_code: 200, body: body} ->
          response = Jason.decode!(body)
          response["content"]

        other ->
          raise "Boom (#{inspect(other)})"
      end

    if length(content) > 0 do
      content ++ Retrieval.get_next(page + 1)
    else
      content
    end
  end
end

Headers.start_link()
responses = Retrieval.get_next(0)
Enum.each(responses, fn j -> IO.puts(j["name"]) end)
