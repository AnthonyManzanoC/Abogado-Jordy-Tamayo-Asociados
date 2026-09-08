using Microsoft.AspNetCore.Cors.Infrastructure;

namespace JordyTamayo.Api.Infrastructure;

public static class SiteCors
{
    public static void Configure(CorsPolicyBuilder policy, IConfiguration configuration)
    {
        var allowedOrigins = (configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
            .Select(origin => origin.Trim().TrimEnd('/'))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        policy.SetIsOriginAllowed(origin =>
                allowedOrigins.Contains(origin) ||
                (Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                 (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || uri.Host.Equals("127.0.0.1"))))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    }
}
