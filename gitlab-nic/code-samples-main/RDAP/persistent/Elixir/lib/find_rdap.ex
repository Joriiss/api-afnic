defmodule FindRdap do
  @moduledoc """
  Implementation of RFC 9224
  """
  @iana_bootstrap "https://data.iana.org/rdap/dns.json"
  @local_file "./iana-rdap-bootstrap.json"
  @local_expiration_file "./iana-rdap-bootstrap.expires"
  @verbose true
  # Persistent HTTP connections
  @persistent true
  # Seconds
  @default_duration 86400

  def verbose do
    @verbose
  end

  def local_file do
    @local_file
  end

  def get_expiration do
    result = File.read(@local_expiration_file)

    case result do
      {:ok, value} ->
        try do
          # Convert from
          <<expire::unsigned-integer-size(32)>> = value
          # binary.  Can raise a MatchError for instance if the file
          # is corrupted
          expire
        rescue
          MatchError ->
            IO.puts(
              :stderr,
              "Warning, #{@local_expiration_file} exists, but the content is wrong. Ignoring it."
            )

            nil
        end

      # No problem if the file is missing
      {:error, :enoent} ->
        nil

      {:error, reason} ->
        IO.puts(
          :stderr,
          "Warning, cannot access #{@local_expiration_file} because \"#{inspect(reason)}\". Ignoring it."
        )

        nil
    end
  end

  def get_cache do
    result = File.read(@local_file)

    case result do
      {:ok, value} ->
        result = Jason.decode(value)

        case result do
          {:ok, map} ->
            map

          {:error, reason} ->
            IO.puts(:stderr, "JSON error in \"#{@local_file}\": #{reason}")
            nil
        end

      # No problem if the file is missing
      {:error, :enoent} ->
        nil

      {:error, reason} ->
        IO.puts(
          :stderr,
          "Warning, cannot access #{@local_file} because \"#{inspect(reason)}\". Ignoring it."
        )

        nil
    end
  end

  def store_cache(data, expiration) do
    if @verbose do
      IO.puts(:stderr, "Updating the cache")
    end

    result =
      File.write(
        @local_expiration_file,
        <<DateTime.to_unix(expiration)::unsigned-integer-size(32)>>,
        [:write]
      )

    case result do
      :ok ->
        nil

      {:error, reason} ->
        IO.puts(
          :stderr,
          "Cannot cache expiration in #{@local_expiration_file} because \"#{inspect(reason)}\"."
        )

        exit(:write_error)
    end

    result = File.write(@local_file, data, [:write])

    case result do
      :ok ->
        nil

      {:error, reason} ->
        IO.puts(:stderr, "Cannot cache data in #{@local_file} because \"#{inspect(reason)}\".")
        exit(:write_error)
    end
  end

  def default_expiration do
    DateTime.to_unix(DateTime.utc_now()) + @default_duration
  end

  def get_iana do
    if @verbose do
      IO.puts(:stderr, "Retrieving from #{@iana_bootstrap}")
    end

    # https://www.iana.org/assignments/rdap-dns/rdap-dns.xml
    result = HTTPoison.get(@iana_bootstrap)

    {expires, body} =
      case result do
        {:ok, %HTTPoison.Response{status_code: 200, body: body, headers: headers}} ->
          # RFC 9224, section 8 recommends using the HTTP Expires field.
          {Enum.find(headers, fn {name, _value} -> String.downcase(name) == "expires" end), body}

        {:ok, %HTTPoison.Response{status_code: status}} ->
          IO.puts(
            :stderr,
            "Cannot retrieve \"#{@iana_bootstrap}\": HTTP status code was #{status}"
          )

          exit(:http_error)

        {:error, %HTTPoison.Error{reason: reason}} ->
          IO.puts(:stderr, "Cannot retrieve \"#{@iana_bootstrap}\": #{reason}")
          exit(:network_error)

        problem ->
          IO.puts(
            :stderr,
            "Completely unespected problem retrieving \"#{@iana_bootstrap}\": #{problem}"
          )

          exit(:general_error)
      end

    # Even if Gettext is started via mix.exs, we need this for Timex
    Gettext.put_locale("en_US")

    limit =
      if expires == nil do
        default_expiration()
      else
        result = Timex.parse(elem(expires, 1), "{RFC1123}")

        case result do
          {:ok, expiration_datetime} ->
            expiration_datetime

          {:error, reason} ->
            IO.puts(
              :stderr,
              "Broken Expires field \"#{elem(expires, 1)}\" (because #{reason}), using the default instead"
            )

            default_expiration()
        end
      end

    result = Jason.decode(body)

    case result do
      {:ok, map} ->
        store_cache(body, limit)
        map

      {:error, reason} ->
        IO.puts(:stderr, "JSON error with \"#{@iana_bootstrap}\": #{reason}")
        exit(:json_error)
    end
  end

  def get_server(database, domain) do
    result =
      Enum.find(
        database["services"],
        fn service ->
          [suffixes, _server] = service

          result2 =
            Enum.find(
              suffixes,
              # At least in theory, the domains in the IANA bootstrap registry may not be TLDs.
              fn suffix -> String.ends_with?(String.downcase(domain), "." <> suffix) end
            )

          result2 != nil
        end
      )

    if result != nil do
      # We should be more careful, we can
      [_suffixes, server] = result
      # have several RDAP servers for a
      # domain, even if it is not the
      # case today.
      if @verbose do
        IO.puts(:stderr, "RDAP server for #{domain} is #{server}")
      end

      server
    else
      nil
    end
  end

  def get_response(server, domain) do
    url = "#{server}domain/#{domain}"

    options =
      if @persistent do
        []
      else
        [hackney: [pool: false]]
      end

    result = HTTPoison.get(url, [{"Accept", "application/json"}], options)

    if @verbose do
      IO.puts(:stderr, "Retrieving RDAP info at #{url}")
    end

    case result do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: status}} ->
        IO.puts(
          :stderr,
          "Cannot retrieve info about #{domain} at #{server}: HTTP status code was #{status}"
        )

        exit(:http_error)

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.puts(:stderr, "Cannot retrieve info about #{domain} at #{server}: #{reason}")
        exit(:network_error)

      problem ->
        IO.puts(
          :stderr,
          "Completely unexpected problem retrieving info about #{domain} at #{server}: #{problem}"
        )

        exit(:general_error)
    end
  end
end
