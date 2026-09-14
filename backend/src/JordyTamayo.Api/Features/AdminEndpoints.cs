using JordyTamayo.Api.Domain;
using JordyTamayo.Api.Infrastructure;

namespace JordyTamayo.Api.Features;

public static class AdminEndpoints
{
    private static readonly HashSet<string> LeadStatuses = ["Nuevo", "Pago pendiente", "Comprobante recibido", "Contactado", "Agendado", "Atendido", "Cerrado", "Archivado"];

    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization();
        group.MapGet("/dashboard", async (ContentRepository repository) => Results.Ok(await repository.GetDashboardAsync()));
        group.MapGet("/profile", async (ContentRepository repository) => Results.Ok(await repository.GetProfileAsync()));
        group.MapPut("/profile", async (SiteProfile profile, ContentRepository repository) => Results.Ok(await repository.UpdateProfileAsync(profile)));

        group.MapGet("/notifications", async (ContentRepository repository) => ToNotificationResponse(await repository.GetNotificationSettingsAsync()));
        group.MapPut("/notifications", async (UpdateNotificationSettingsRequest request, ContentRepository repository) =>
        {
            if (string.IsNullOrWhiteSpace(request.AdminEmail) || string.IsNullOrWhiteSpace(request.SenderEmail))
                return Results.BadRequest(new { message = "Correo del admin y remitente son obligatorios." });

            var saved = await repository.UpdateNotificationSettingsAsync(request);
            return Results.Ok(ToNotificationResponse(saved));
        });
        group.MapPost("/notifications/test", async (TestNotificationRequest request, LeadNotificationService notifications, HttpContext context) =>
        {
            var result = await notifications.SendTestAsync(request.Email, context.Request, context.RequestAborted);
            return result.Delivered
                ? Results.Ok(new { message = "Correo de prueba enviado correctamente." })
                : Results.BadRequest(new { message = result.ErrorMessage });
        });

        group.MapGet("/services", async (ContentRepository repository) => Results.Ok(await repository.GetAllServicesAsync()));
        group.MapPost("/services", async (LegalService service, ContentRepository repository) => Results.Ok(await repository.SaveServiceAsync(Normalize(service))));
        group.MapPut("/services/{id:guid}", async (Guid id, LegalService service, ContentRepository repository) =>
        {
            service.Id = id;
            return Results.Ok(await repository.SaveServiceAsync(Normalize(service)));
        });
        group.MapDelete("/services/{id:guid}", async (Guid id, ContentRepository repository) =>
        {
            await repository.DeleteServiceAsync(id);
            return Results.NoContent();
        });

        group.MapGet("/media", async (ContentRepository repository) => Results.Ok(await repository.GetAllMediaAsync()));
        group.MapPost("/media", async (MediaPost post, ContentRepository repository) => Results.Ok(await repository.SaveMediaAsync(post)));
        group.MapPut("/media/{id:guid}", async (Guid id, MediaPost post, ContentRepository repository) =>
        {
            post.Id = id;
            return Results.Ok(await repository.SaveMediaAsync(post));
        });
        group.MapDelete("/media/{id:guid}", async (Guid id, ContentRepository repository) =>
        {
            await repository.DeleteMediaAsync(id);
            return Results.NoContent();
        });

        group.MapGet("/leads", async (string? status, ContentRepository repository) => Results.Ok(await repository.GetLeadsAsync(status)));
        group.MapPut("/leads/{id:guid}/status", async (Guid id, LeadStatusRequest request, ContentRepository repository, LeadNotificationService notifications, HttpContext context) =>
        {
            if (!LeadStatuses.Contains(request.Status)) return Results.BadRequest(new { message = "Estado inválido." });
            var lead = await repository.UpdateLeadStatusAsync(id, request.Status, request.PublicNotes);
            if (lead is null) return Results.NotFound();
            await notifications.NotifyLeadStatusChangedAsync(lead, context.Request, context.RequestAborted);
            return Results.Ok(lead);
        });

        group.MapPost("/upload", async (IFormFile file, ContentRepository repository) =>
        {
            if (file.Length == 0 || file.Length > 8 * 1024 * 1024) return Results.BadRequest(new { message = "La imagen debe pesar menos de 8 MB." });
            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) return Results.BadRequest(new { message = "Solo se aceptan imágenes." });
            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            var id = await repository.SaveAssetAsync(Path.GetFileName(file.FileName), file.ContentType, stream.ToArray());
            return Results.Ok(new { id, url = $"/api/media/{id}" });
        }).DisableAntiforgery();

        return app;
    }

    private static LegalService Normalize(LegalService service)
    {
        if (string.IsNullOrWhiteSpace(service.Slug))
            service.Slug = string.Join('-', service.Name.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
        return service;
    }

    private static NotificationSettingsResponse ToNotificationResponse(NotificationSettings settings) => new(
        settings.Enabled,
        settings.Provider,
        settings.AdminEmail,
        settings.SenderName,
        settings.SenderEmail,
        !string.IsNullOrWhiteSpace(settings.BrevoApiKey),
        settings.UpdatedAt);

    public sealed record LeadStatusRequest(string Status, string? PublicNotes);
}
