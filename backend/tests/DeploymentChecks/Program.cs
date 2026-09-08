using JordyTamayo.Api.Infrastructure;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

// Evaluate the real production policy without starting the API or touching PostgreSQL.
var configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("api-settings.json")
    .Build();
var builder = new CorsPolicyBuilder();
SiteCors.Configure(builder, configuration);
var policy = builder.Build();
var service = new CorsService(Options.Create(new CorsOptions()), NullLoggerFactory.Instance);
var cases = new (string Origin, bool Allowed)[]
{
    ("https://abogado-jordy-tamayo-asociados.vercel.app", true),
    ("http://localhost:3002", true),
    ("http://127.0.0.1:3002", true),
    ("https://unrelated.vercel.app", false),
    ("https://abogado-jordy-tamayo-asociados.vercel.app.attacker.example", false),
    ("null", false),
};

foreach (var (origin, allowed) in cases)
{
    var context = new DefaultHttpContext();
    context.Request.Method = "OPTIONS";
    context.Request.Headers.Origin = origin;
    context.Request.Headers.AccessControlRequestMethod = "POST";
    context.Request.Headers.AccessControlRequestHeaders = "authorization,content-type";
    var result = service.EvaluatePolicy(context, policy);
    service.ApplyResult(result, context.Response);
    if (result.IsOriginAllowed != allowed ||
        (allowed && (context.Response.Headers.AccessControlAllowOrigin != origin ||
                     !result.AllowedMethods.Contains("POST") ||
                     !result.AllowedHeaders.Contains("authorization"))))
        throw new InvalidOperationException($"CORS check failed for {origin}.");
    Console.WriteLine($"PASS: {origin} => {(allowed ? "allowed" : "denied")}");
}

var customConfiguration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Cors:AllowedOrigins:0"] = "https://custom.example/",
}).Build();
var customBuilder = new CorsPolicyBuilder();
SiteCors.Configure(customBuilder, customConfiguration);
if (!customBuilder.Build().IsOriginAllowed("https://custom.example"))
    throw new InvalidOperationException("Configurable origin normalization failed.");
Console.WriteLine("PASS: configurable origins; no database access.");
