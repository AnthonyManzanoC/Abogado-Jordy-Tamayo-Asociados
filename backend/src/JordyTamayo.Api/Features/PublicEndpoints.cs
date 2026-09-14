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
        group.MapPost("/leads", async (CreateLeadRequest request, ContentRepository repository, LeadNotificationService notifications, HttpContext context) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length < 2 ||
                string.IsNullOrWhiteSpace(request.Whatsapp) || string.IsNullOrWhiteSpace(request.Message))
                return Results.ValidationProblem(new Dictionary<string, string[]> { ["form"] = ["Nombre, WhatsApp y descripción del caso son obligatorios."] });

            var lead = await repository.CreateLeadAsync(request);
            await notifications.NotifyLeadCreatedAsync(lead, context.Request, context.RequestAborted);
            var trackingUrl = notifications.BuildTrackingUrl(context.Request, lead.TrackingToken);
            return Results.Created($"/api/public/requests/{lead.TrackingToken}", new CreateLeadResponse(
                lead.Id,
                lead.TrackingToken,
                trackingUrl,
                lead.Status,
                lead.PaymentStatus,
                "Consulta recibida correctamente. Guarde el enlace de seguimiento."));
        });

        group.MapGet("/requests/{trackingToken}", async (string trackingToken, ContentRepository repository) =>
        {
            var lead = await repository.GetLeadByTrackingTokenAsync(trackingToken);
            return lead is null ? Results.NotFound() : Results.Ok(ToTrackingResponse(lead));
        });

        group.MapPost("/requests/{trackingToken}/payment-proof", async (string trackingToken, IFormFile file, ContentRepository repository, LeadNotificationService notifications, HttpContext context) =>
        {
            var lead = await repository.GetLeadByTrackingTokenAsync(trackingToken);
            if (lead is null) return Results.NotFound();
            if (!lead.ConsultationType.Contains("virtual", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest(new { message = "Esta solicitud no requiere comprobante de transferencia." });
            if (file.Length == 0 || file.Length > 8 * 1024 * 1024)
                return Results.BadRequest(new { message = "El comprobante debe pesar menos de 8 MB." });
            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest(new { message = "Suba una imagen o PDF del comprobante." });

            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream, context.RequestAborted);
            var id = await repository.SaveAssetAsync(Path.GetFileName(file.FileName), file.ContentType, stream.ToArray());
            var updated = await repository.SetPaymentProofAsync(trackingToken, $"/api/media/{id}");
            if (updated is null) return Results.NotFound();
            await notifications.NotifyPaymentProofUploadedAsync(updated, context.Request, context.RequestAborted);
            return Results.Ok(ToTrackingResponse(updated));
        }).DisableAntiforgery();

        app.MapGet("/api/media/{id:guid}", async (Guid id, ContentRepository repository) =>
        {
            var asset = await repository.GetAssetAsync(id);
            return asset is null ? Results.NotFound() : Results.File(asset.Value.Content, asset.Value.ContentType, fileDownloadName: null, enableRangeProcessing: true);
        });
        return app;
    }

    private static LeadTrackingResponse ToTrackingResponse(Lead lead) => new(
        lead.Id,
        lead.TrackingToken,
        lead.Name,
        lead.LegalArea,
        lead.ConsultationType,
        lead.PreferredDate,
        lead.Status,
        lead.AppointmentStatus,
        lead.PaymentStatus,
        lead.PaymentProofUrl,
        lead.PublicNotes,
        lead.CreatedAt,
        lead.UpdatedAt);
}
