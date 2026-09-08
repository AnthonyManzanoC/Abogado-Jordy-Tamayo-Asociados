using System.Net;
using Npgsql;

namespace JordyTamayo.Api.Infrastructure;

public static class EnvLoader
{
    public static void LoadFromWorkspace()
    {
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            var path = Path.Combine(current.FullName, ".env.local");
            if (File.Exists(path))
            {
                foreach (var rawLine in File.ReadAllLines(path))
                {
                    var line = rawLine.Trim();
                    if (line.Length == 0 || line.StartsWith('#')) continue;
                    var separator = line.IndexOf('=');
                    if (separator <= 0) continue;
                    var key = line[..separator].Trim();
                    var value = line[(separator + 1)..].Trim().Trim('"');
                    Environment.SetEnvironmentVariable(key, value);
                }
                return;
            }
            current = current.Parent;
        }
    }
}

public static class ConnectionStringFactory
{
    public static string FromUrl(string value)
    {
        if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)) return value;

        var uri = new Uri(value);
        var userInfo = uri.UserInfo.Split(':', 2);
        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = WebUtility.UrlDecode(userInfo[0]),
            Password = userInfo.Length > 1 ? WebUtility.UrlDecode(userInfo[1]) : "",
            SslMode = SslMode.Require,
            Pooling = true,
            MaxPoolSize = 10,
            Timeout = 15,
            CommandTimeout = 30
        }.ConnectionString;
    }
}

public sealed record DatabaseOptions(string ConnectionString);
public sealed record JwtOptions(string Secret);
