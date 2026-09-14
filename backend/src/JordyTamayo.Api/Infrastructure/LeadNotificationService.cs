using System.Net.Http.Json;
using System.Text.Encodings.Web;
using System.Text.Json;
using JordyTamayo.Api.Domain;

namespace JordyTamayo.Api.Infrastructure;

public sealed class LeadNotificationService(
    ContentRepository repository,
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<LeadNotificationService> logger)
{
    private const string BrevoEndpoint = "https://api.brevo.com/v3/smtp/email";

    public string BuildTrackingUrl(HttpRequest request, string trackingToken)
    {
        var origin = request.Headers.Origin.FirstOrDefault();
        var configured = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? configuration["Frontend:PublicBaseUrl"];
        var baseUrl = !string.IsNullOrWhiteSpace(origin) ? origin : configured ?? "http://localhost:3002";
        return $"{baseUrl.TrimEnd('/')}/seguimiento/{Uri.EscapeDataString(trackingToken)}";
    }

    public async Task NotifyLeadCreatedAsync(Lead lead, HttpRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await GetRuntimeSettingsAsync();
        var trackingUrl = BuildTrackingUrl(request, lead.TrackingToken);
        var subject = $"Nueva solicitud legal: {lead.Name}";
        var html = LeadHtml("Nueva solicitud recibida", lead, trackingUrl, "Revise la solicitud en el panel administrativo y contacte al cliente.");
        var text = LeadText("Nueva solicitud recibida", lead, trackingUrl);

        await SendAndLogAsync(settings, lead.Id, "lead_created_admin", settings.AdminEmail, subject, html, text, cancellationToken);

        if (!string.IsNullOrWhiteSpace(lead.Email))
        {
            var clientSubject = "Recibimos su solicitud legal";
            var clientHtml = LeadHtml("Solicitud recibida", lead, trackingUrl, lead.ConsultationType.Contains("virtual", StringComparison.OrdinalIgnoreCase)
                ? "Su consulta virtual queda con pago pendiente. Puede subir el comprobante desde el enlace de seguimiento."
                : "Puede volver al enlace de seguimiento para revisar el estado.");
            var clientText = LeadText("Solicitud recibida", lead, trackingUrl);
            await SendAndLogAsync(settings, lead.Id, "lead_created_client", lead.Email, clientSubject, clientHtml, clientText, cancellationToken);
        }
    }

    public async Task NotifyPaymentProofUploadedAsync(Lead lead, HttpRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await GetRuntimeSettingsAsync();
        var trackingUrl = BuildTrackingUrl(request, lead.TrackingToken);
        var subject = $"Comprobante recibido: {lead.Name}";
        var html = LeadHtml("Comprobante por validar", lead, trackingUrl, "El cliente subió un comprobante para una consulta virtual. Revíselo desde el panel.");
        var text = LeadText("Comprobante por validar", lead, trackingUrl);
        await SendAndLogAsync(settings, lead.Id, "payment_proof_admin", settings.AdminEmail, subject, html, text, cancellationToken);
    }

    public async Task NotifyLeadStatusChangedAsync(Lead lead, HttpRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await GetRuntimeSettingsAsync();
        var trackingUrl = BuildTrackingUrl(request, lead.TrackingToken);
        var subject = $"Solicitud actualizada: {lead.Status}";
        var html = LeadHtml($"Estado actualizado a {Html(lead.Status)}", lead, trackingUrl, "El estado de la solicitud cambió en el panel administrativo.");
        var text = LeadText($"Estado actualizado a {lead.Status}", lead, trackingUrl);

        await SendAndLogAsync(settings, lead.Id, "lead_status_admin", settings.AdminEmail, subject, html, text, cancellationToken);

        if (!string.IsNullOrWhiteSpace(lead.Email))
        {
            await SendAndLogAsync(settings, lead.Id, "lead_status_client", lead.Email, subject, html, text, cancellationToken);
        }
    }

    public async Task<EmailDeliveryResult> SendTestAsync(string? toEmail, HttpRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await GetRuntimeSettingsAsync();
        var recipient = string.IsNullOrWhiteSpace(toEmail) ? settings.AdminEmail : toEmail.Trim();
        var url = BuildTrackingUrl(request, "demo");
        var result = await SendAsync(
            settings,
            recipient,
            "Prueba de correo Brevo",
            "<h1>Correo Brevo activo</h1><p>La web de Jordy Tamayo ya puede enviar notificaciones transaccionales.</p><p>Link de ejemplo: " + Html(url) + "</p>",
            $"Correo Brevo activo. Link de ejemplo: {url}",
            cancellationToken);

        await repository.SaveNotificationLogAsync(null, "test", recipient, result.Status, result.ProviderMessageId, result.ErrorMessage);
        return result;
    }

    private async Task<NotificationSettings> GetRuntimeSettingsAsync()
    {
        var settings = await repository.GetNotificationSettingsAsync();
        if (string.IsNullOrWhiteSpace(settings.BrevoApiKey))
        {
            settings.BrevoApiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY") ?? configuration["Brevo:ApiKey"] ?? "";
        }

        if (string.IsNullOrWhiteSpace(settings.AdminEmail))
        {
            settings.AdminEmail = Environment.GetEnvironmentVariable("BREVO_ADMIN_EMAIL") ?? configuration["Brevo:AdminEmail"] ?? "janthonymc09@gmail.com";
        }

        if (string.IsNullOrWhiteSpace(settings.SenderEmail))
        {
            settings.SenderEmail = Environment.GetEnvironmentVariable("BREVO_SENDER_EMAIL") ?? configuration["Brevo:SenderEmail"] ?? settings.AdminEmail;
        }

        return settings;
    }

    private async Task SendAndLogAsync(NotificationSettings settings, Guid? leadId, string kind, string recipient, string subject, string html, string text, CancellationToken cancellationToken)
    {
        var result = await SendAsync(settings, recipient, subject, html, text, cancellationToken);
        await repository.SaveNotificationLogAsync(leadId, kind, recipient, result.Status, result.ProviderMessageId, result.ErrorMessage);
    }

    private async Task<EmailDeliveryResult> SendAsync(NotificationSettings settings, string recipient, string subject, string html, string text, CancellationToken cancellationToken)
    {
        if (!settings.Enabled)
        {
            return EmailDeliveryResult.Skipped("Las notificaciones estan desactivadas.");
        }

        if (string.IsNullOrWhiteSpace(settings.BrevoApiKey))
        {
            return EmailDeliveryResult.Skipped("Falta configurar la API key de Brevo.");
        }

        if (string.IsNullOrWhiteSpace(recipient) || string.IsNullOrWhiteSpace(settings.SenderEmail))
        {
            return EmailDeliveryResult.Skipped("Falta correo de remitente o destinatario.");
        }

        try
        {
            using var message = new HttpRequestMessage(HttpMethod.Post, BrevoEndpoint);
            message.Headers.TryAddWithoutValidation("api-key", settings.BrevoApiKey);
            message.Content = JsonContent.Create(new
            {
                sender = new { name = settings.SenderName, email = settings.SenderEmail },
                to = new[] { new { email = recipient } },
                subject,
                htmlContent = html,
                textContent = text
            });

            using var response = await httpClient.SendAsync(message, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Brevo rejected notification with status {Status}: {Body}", response.StatusCode, body);
                return EmailDeliveryResult.Failed(body.Length > 350 ? body[..350] : body);
            }

            var messageId = "";
            try
            {
                using var json = JsonDocument.Parse(body);
                if (json.RootElement.TryGetProperty("messageId", out var value)) messageId = value.GetString() ?? "";
            }
            catch (JsonException)
            {
                messageId = "";
            }

            return EmailDeliveryResult.Sent(messageId);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "No fue posible enviar la notificacion por Brevo.");
            return EmailDeliveryResult.Failed(exception.Message);
        }
    }

    private static string LeadHtml(string title, Lead lead, string trackingUrl, string note)
    {
        return $$"""
            <html>
              <body style="font-family:Arial,sans-serif;background:#f4f0e8;color:#171512;padding:28px">
                <main style="max-width:640px;margin:auto;background:#fffaf2;border:1px solid #d9d0c2;border-radius:18px;padding:28px">
                  <p style="color:#9a6728;text-transform:uppercase;letter-spacing:.14em;font-size:12px;margin:0 0 12px">Jordy Tamayo & Asociados</p>
                  <h1 style="font-size:28px;line-height:1.1;margin:0 0 16px">{{title}}</h1>
                  <p style="line-height:1.6;color:#70685e">{{note}}</p>
                  <table style="width:100%;border-collapse:collapse;margin:22px 0">
                    <tr><td style="padding:10px 0;color:#70685e">Cliente</td><td style="padding:10px 0;font-weight:700">{{Html(lead.Name)}}</td></tr>
                    <tr><td style="padding:10px 0;color:#70685e">WhatsApp</td><td style="padding:10px 0">{{Html(lead.Whatsapp)}}</td></tr>
                    <tr><td style="padding:10px 0;color:#70685e">Area</td><td style="padding:10px 0">{{Html(lead.LegalArea)}}</td></tr>
                    <tr><td style="padding:10px 0;color:#70685e">Modalidad</td><td style="padding:10px 0">{{Html(lead.ConsultationType)}}</td></tr>
                    <tr><td style="padding:10px 0;color:#70685e">Estado</td><td style="padding:10px 0">{{Html(lead.Status)}}</td></tr>
                    <tr><td style="padding:10px 0;color:#70685e">Pago</td><td style="padding:10px 0">{{Html(lead.PaymentStatus)}}</td></tr>
                  </table>
                  <p style="line-height:1.6"><strong>Mensaje:</strong><br>{{Html(lead.Message)}}</p>
                  <p><a href="{{Html(trackingUrl)}}" style="display:inline-block;background:#171512;color:#fff;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:700">Ver seguimiento</a></p>
                </main>
              </body>
            </html>
            """;
    }

    private static string LeadText(string title, Lead lead, string trackingUrl)
    {
        return $"""
            {title}

            Cliente: {lead.Name}
            WhatsApp: {lead.Whatsapp}
            Area: {lead.LegalArea}
            Modalidad: {lead.ConsultationType}
            Estado: {lead.Status}
            Pago: {lead.PaymentStatus}
            Mensaje: {lead.Message}
            Seguimiento: {trackingUrl}
            """;
    }

    private static string Html(string value) => HtmlEncoder.Default.Encode(value);
}

public sealed record EmailDeliveryResult(string Status, string ProviderMessageId, string ErrorMessage)
{
    public bool Delivered => Status == "Enviado";
    public static EmailDeliveryResult Sent(string messageId) => new("Enviado", messageId, "");
    public static EmailDeliveryResult Skipped(string reason) => new("Omitido", "", reason);
    public static EmailDeliveryResult Failed(string reason) => new("Error", "", reason);
}
