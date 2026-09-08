using JordyTamayo.Api.Domain;
using JordyTamayo.Api.Infrastructure;

namespace JordyTamayo.Api.Features;

public static class PublicEndpoints
{
    public static IEndpointRouteBuilder MapPublicEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/public");
        group.MapGet("/site", async (ContentRepository repository) => Results.Ok(await repository.GetPublicSiteAsync()));
        group.MapGet("/services/{slug}", async (string slug, ContentRepository repository) =>
        {
            var service = await repository.GetServiceBySlugAsync(slug);
            return service is null ? Results.NotFound() : Results.Ok(service);
        });
        group.MapPost("/leads", async (CreateLeadRequest request, ContentRepository repository) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length < 2 ||
                string.IsNullOrWhiteSpace(request.Whatsapp) || string.IsNullOrWhiteSpace(request.Message))
                return Results.ValidationProblem(new Dictionary<string, string[]> { ["form"] = ["Nombre, WhatsApp y descripción del caso son obligatorios."] });

            var lead = await repository.CreateLeadAsync(request);
            return Results.Created($"/api/admin/leads/{lead.Id}", new { lead.Id, message = "Consulta recibida correctamente." });
        });

        app.MapGet("/api/media/{id:guid}", async (Guid id, ContentRepository repository) =>
        {
            var asset = await repository.GetAssetAsync(id);
            return asset is null ? Results.NotFound() : Results.File(asset.Value.Content, asset.Value.ContentType, fileDownloadName: null, enableRangeProcessing: true);
        });
        return app;
    }
}
