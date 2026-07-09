if FindRdap.verbose() do
  IO.puts(:stderr, "Starting")
end

HTTPoison.start()
expiration = FindRdap.get_expiration()

if FindRdap.verbose() do
  if expiration != nil do
    {:ok, e} = DateTime.from_unix(expiration)
    IO.puts(:stderr, "Expiration is #{DateTime.to_string(e)}")
  end
end

database =
  if expiration != nil and DateTime.to_unix(DateTime.utc_now()) < expiration do
    if FindRdap.verbose() do
      IO.puts(:stderr, "Using the cache #{FindRdap.local_file()}")
    end

    db = FindRdap.get_cache()

    if db == nil do
      if FindRdap.verbose() do
        IO.puts(:stderr, "Wrong expiration")
      end

      FindRdap.get_iana()
    else
      db
    end
  else
    if FindRdap.verbose() do
      IO.puts(:stderr, "No expiration known")
    end

    FindRdap.get_iana()
  end

if FindRdap.verbose() do
  IO.puts(:stderr, "#{database["description"]} published on #{database["publication"]}")
end

Enum.map(
  System.argv(),
  fn domain ->
    data =
      database
      |> FindRdap.get_server(domain)
      |> FindRdap.get_response(domain)
      |> Jason.decode!()

    IO.puts("#{data["handle"]}: #{inspect(data["status"])}")
  end
)
