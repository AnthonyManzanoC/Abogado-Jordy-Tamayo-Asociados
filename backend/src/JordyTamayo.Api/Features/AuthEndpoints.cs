using JordyTamayo.Api.Domain;
using JordyTamayo.Api.Infrastructure;

namespace JordyTamayo.Api.Features;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest request, ContentRepository repository, PasswordHasher hasher, JwtTokenService jwt) =>
        {
            var user = await repository.GetAdminAsync(request.Email);
            if (user is null || !hasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
                return Results.Json(new { message = "Credenciales incorrectas." }, statusCode: StatusCodes.Status401Unauthorized);
            return Results.Ok(jwt.Create(user));
        });
        return app;
    }
}
