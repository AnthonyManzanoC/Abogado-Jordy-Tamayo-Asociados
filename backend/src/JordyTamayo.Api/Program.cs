using System.Text;
using Dapper;
using JordyTamayo.Api.Features;
using JordyTamayo.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

EnvLoader.LoadFromWorkspace();
DefaultTypeMap.MatchNamesWithUnderscores = true;
SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

var builder = WebApplication.CreateBuilder(args);
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("Database")
    ?? throw new InvalidOperationException("DATABASE_URL no está configurada.");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException("JWT_SECRET no está configurado.");

builder.Services.AddOpenApi();
builder.Services.AddSingleton(new DatabaseOptions(ConnectionStringFactory.FromUrl(databaseUrl)));
builder.Services.AddSingleton(new JwtOptions(jwtSecret));
builder.Services.AddScoped<ContentRepository>();
builder.Services.AddHttpClient<LeadNotificationService>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    SiteCors.Configure(policy, builder.Configuration)));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "jordy-tamayo-api",
            ValidAudience = "jordy-tamayo-admin",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors();
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Unhandled API error processing {Method} {Path}", context.Request.Method, context.Request.Path);
        if (context.Response.HasStarted) throw;

        context.Response.Clear();
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new { message = "No fue posible procesar la solicitud. Inténtelo nuevamente o contacte al despacho por WhatsApp." });
    }
});
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", service = "Jordy Tamayo API" }));
app.MapPublicEndpoints();
app.MapAuthEndpoints();
app.MapAdminEndpoints();

await DatabaseInitializer.InitializeAsync(app.Services);

app.Run();

public partial class Program;
