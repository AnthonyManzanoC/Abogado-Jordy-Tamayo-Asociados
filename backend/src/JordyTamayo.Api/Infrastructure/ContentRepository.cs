using Dapper;
using JordyTamayo.Api.Domain;
using Npgsql;

namespace JordyTamayo.Api.Infrastructure;

public sealed class ContentRepository(DatabaseOptions options)
{
    private NpgsqlConnection CreateConnection() => new(options.ConnectionString);

    public async Task<PublicSiteResponse> GetPublicSiteAsync()
    {
        await using var connection = CreateConnection();
        var profile = await connection.QuerySingleAsync<SiteProfile>("SELECT * FROM site_profile WHERE id=1");
        var services = (await connection.QueryAsync<LegalService>("SELECT * FROM legal_services WHERE active=true ORDER BY display_order,name")).AsList();
        var media = (await connection.QueryAsync<MediaPost>("SELECT * FROM media_posts WHERE active=true ORDER BY display_order,created_at DESC")).AsList();
        return new PublicSiteResponse(profile, services, media);
    }

    public async Task<SiteProfile> GetProfileAsync()
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<SiteProfile>("SELECT * FROM site_profile WHERE id=1");
    }

    public async Task<SiteProfile?> GetServiceProfileAsync() => await GetProfileAsync();

    public async Task<LegalService?> GetServiceBySlugAsync(string slug)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<LegalService>("SELECT * FROM legal_services WHERE slug=@slug AND active=true", new { slug });
    }

    public async Task<IReadOnlyList<LegalService>> GetAllServicesAsync()
    {
        await using var connection = CreateConnection();
        return (await connection.QueryAsync<LegalService>("SELECT * FROM legal_services ORDER BY display_order,name")).AsList();
    }

    public async Task<IReadOnlyList<MediaPost>> GetAllMediaAsync()
    {
        await using var connection = CreateConnection();
        return (await connection.QueryAsync<MediaPost>("SELECT * FROM media_posts ORDER BY display_order,created_at DESC")).AsList();
    }

    public async Task<SiteProfile> UpdateProfileAsync(SiteProfile profile)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<SiteProfile>("""
            UPDATE site_profile SET
              brand_name=@BrandName, full_name=@FullName, credentials=@Credentials, eyebrow=@Eyebrow,
              hero_title=@HeroTitle, hero_accent=@HeroAccent, hero_description=@HeroDescription,
              bio_title=@BioTitle, bio_body=@BioBody, social_proof=@SocialProof,
              social_proof_label=@SocialProofLabel, metric_one_value=@MetricOneValue,
              metric_one_label=@MetricOneLabel, metric_two_value=@MetricTwoValue,
              metric_two_label=@MetricTwoLabel, address_line1=@AddressLine1,
              address_line2=@AddressLine2, city=@City, google_maps_url=@GoogleMapsUrl,
              google_maps_embed_url=@GoogleMapsEmbedUrl, office_building_image_url=@OfficeBuildingImageUrl,
              whatsapp_number=@WhatsAppNumber, email=@Email, phone=@Phone,
              tiktok_url=@TikTokUrl, instagram_url=@InstagramUrl, facebook_url=@FacebookUrl,
              hero_image_url=@HeroImageUrl, portrait_image_url=@PortraitImageUrl,
              degree_image_url=@DegreeImageUrl, updated_at=now()
            WHERE id=1 RETURNING *
            """, profile);
    }

    public async Task<LegalService> SaveServiceAsync(LegalService service)
    {
        if (service.Id == Guid.Empty) service.Id = Guid.NewGuid();
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<LegalService>("""
            INSERT INTO legal_services(id,slug,name,short_description,long_description,icon,accent,gallery_image_urls,is_featured,display_order,active)
            VALUES (@Id,@Slug,@Name,@ShortDescription,@LongDescription,@Icon,@Accent,@GalleryImageUrls,@IsFeatured,@DisplayOrder,@Active)
            ON CONFLICT (id) DO UPDATE SET slug=excluded.slug,name=excluded.name,
              short_description=excluded.short_description,long_description=excluded.long_description,
              icon=excluded.icon,accent=excluded.accent,gallery_image_urls=excluded.gallery_image_urls,is_featured=excluded.is_featured,
              display_order=excluded.display_order,active=excluded.active,updated_at=now()
            RETURNING *
            """, service);
    }

    public async Task DeleteServiceAsync(Guid id)
    {
        await using var connection = CreateConnection();
        await connection.ExecuteAsync("DELETE FROM legal_services WHERE id=@id", new { id });
    }

    public async Task<MediaPost> SaveMediaAsync(MediaPost post)
    {
        if (post.Id == Guid.Empty) post.Id = Guid.NewGuid();
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<MediaPost>("""
            INSERT INTO media_posts(id,platform,title,url,thumbnail_url,caption,category,display_order,active)
            VALUES (@Id,@Platform,@Title,@Url,@ThumbnailUrl,@Caption,@Category,@DisplayOrder,@Active)
            ON CONFLICT (id) DO UPDATE SET platform=excluded.platform,title=excluded.title,url=excluded.url,
              thumbnail_url=excluded.thumbnail_url,caption=excluded.caption,category=excluded.category,
              display_order=excluded.display_order,active=excluded.active
            RETURNING *
            """, post);
    }

    public async Task DeleteMediaAsync(Guid id)
    {
        await using var connection = CreateConnection();
        await connection.ExecuteAsync("DELETE FROM media_posts WHERE id=@id", new { id });
    }

    public async Task<Lead> CreateLeadAsync(CreateLeadRequest request)
    {
        await using var connection = CreateConnection();
        var consultationType = string.IsNullOrWhiteSpace(request.ConsultationType) ? "Presencial" : request.ConsultationType.Trim();
        var isVirtual = consultationType.Contains("virtual", StringComparison.OrdinalIgnoreCase);
        var status = isVirtual ? "Pago pendiente" : "Nuevo";
        var appointmentStatus = isVirtual ? "Pendiente de pago" : "Pendiente";
        var paymentStatus = isVirtual ? "Pendiente de comprobante" : "No requerido";
        var trackingToken = Guid.NewGuid().ToString("N");
        return await connection.QuerySingleAsync<Lead>("""
            INSERT INTO leads(id,name,whatsapp,email,legal_area,consultation_type,preferred_date,message,status,tracking_token,appointment_status,payment_status,source)
            VALUES (@Id,@Name,@Whatsapp,@Email,@LegalArea,@ConsultationType,@PreferredDate,@Message,@Status,@TrackingToken,@AppointmentStatus,@PaymentStatus,@Source)
            RETURNING *
            """, new
        {
            Id = Guid.NewGuid(),
            request.Name,
            request.Whatsapp,
            Email = request.Email ?? "",
            request.LegalArea,
            ConsultationType = consultationType,
            request.PreferredDate,
            request.Message,
            Status = status,
            TrackingToken = trackingToken,
            AppointmentStatus = appointmentStatus,
            PaymentStatus = paymentStatus,
            Source = string.IsNullOrWhiteSpace(request.Source) ? "Web" : request.Source.Trim()
        });
    }

    public async Task<Lead?> GetLeadByTrackingTokenAsync(string trackingToken)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Lead>("SELECT * FROM leads WHERE tracking_token=@trackingToken", new { trackingToken });
    }

    public async Task<IReadOnlyList<Lead>> GetLeadsAsync(string? status)
    {
        await using var connection = CreateConnection();
        var sql = "SELECT * FROM leads" + (string.IsNullOrWhiteSpace(status) ? "" : " WHERE status=@status") + " ORDER BY created_at DESC";
        return (await connection.QueryAsync<Lead>(sql, new { status })).AsList();
    }

    public async Task<Lead?> UpdateLeadStatusAsync(Guid id, string status, string? publicNotes = null)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Lead>("""
            UPDATE leads SET
              status=@status,
              appointment_status=CASE
                WHEN @status='Pago pendiente' THEN 'Pendiente de pago'
                WHEN @status='Comprobante recibido' THEN 'Comprobante recibido'
                WHEN @status='Contactado' THEN 'Contactado'
                WHEN @status='Agendado' THEN 'Agendada'
                WHEN @status='Atendido' THEN 'Atendida'
                WHEN @status='Cerrado' THEN 'Cerrada'
                ELSE appointment_status
              END,
              public_notes=COALESCE(NULLIF(@publicNotes, ''), public_notes),
              updated_at=now()
            WHERE id=@id RETURNING *
            """, new { id, status, publicNotes = publicNotes ?? "" });
    }

    public async Task<Lead?> SetPaymentProofAsync(string trackingToken, string proofUrl)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Lead>("""
            UPDATE leads SET
              payment_proof_url=@proofUrl,
              payment_status='En validación',
              status='Comprobante recibido',
              appointment_status='Comprobante recibido',
              updated_at=now()
            WHERE tracking_token=@trackingToken RETURNING *
            """, new { trackingToken, proofUrl });
    }

    public async Task<DashboardResponse> GetDashboardAsync()
    {
        await using var connection = CreateConnection();
        var total = await connection.ExecuteScalarAsync<int>("SELECT count(*) FROM leads");
        var fresh = await connection.ExecuteScalarAsync<int>("SELECT count(*) FROM leads WHERE status IN ('Nuevo','Pago pendiente','Comprobante recibido')");
        var services = await connection.ExecuteScalarAsync<int>("SELECT count(*) FROM legal_services WHERE active=true");
        var media = await connection.ExecuteScalarAsync<int>("SELECT count(*) FROM media_posts WHERE active=true");
        var recent = (await connection.QueryAsync<Lead>("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5")).AsList();
        return new DashboardResponse(total, fresh, services, media, recent);
    }

    public async Task<AdminUser?> GetAdminAsync(string email)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<AdminUser>("SELECT * FROM admin_users WHERE lower(email)=lower(@email) AND is_active=true", new { email });
    }

    public async Task<Guid> SaveAssetAsync(string fileName, string contentType, byte[] content)
    {
        await using var connection = CreateConnection();
        var id = Guid.NewGuid();
        await connection.ExecuteAsync("INSERT INTO media_assets(id,file_name,content_type,content) VALUES (@id,@fileName,@contentType,@content)", new { id, fileName, contentType, content });
        return id;
    }

    public async Task<NotificationSettings> GetNotificationSettingsAsync()
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<NotificationSettings>("SELECT * FROM notification_settings WHERE id=1");
    }

    public async Task<NotificationSettings> UpdateNotificationSettingsAsync(UpdateNotificationSettingsRequest request)
    {
        await using var connection = CreateConnection();
        return await connection.QuerySingleAsync<NotificationSettings>("""
            UPDATE notification_settings SET
              enabled=@Enabled,
              admin_email=@AdminEmail,
              sender_name=@SenderName,
              sender_email=@SenderEmail,
              brevo_api_key=CASE WHEN @BrevoApiKey = '' THEN brevo_api_key ELSE @BrevoApiKey END,
              updated_at=now()
            WHERE id=1 RETURNING *
            """, new
        {
            request.Enabled,
            request.AdminEmail,
            request.SenderName,
            request.SenderEmail,
            BrevoApiKey = request.BrevoApiKey?.Trim() ?? ""
        });
    }

    public async Task SaveNotificationLogAsync(Guid? leadId, string kind, string recipient, string status, string providerMessageId = "", string errorMessage = "")
    {
        await using var connection = CreateConnection();
        await connection.ExecuteAsync("""
            INSERT INTO notification_logs(id,lead_id,kind,recipient,status,provider_message_id,error_message)
            VALUES (@id,@leadId,@kind,@recipient,@status,@providerMessageId,@errorMessage)
            """, new
        {
            id = Guid.NewGuid(),
            leadId,
            kind,
            recipient,
            status,
            providerMessageId,
            errorMessage
        });
    }

    public async Task<(byte[] Content, string ContentType, string FileName)?> GetAssetAsync(Guid id)
    {
        await using var connection = CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<MediaAssetRow>("SELECT content,content_type,file_name FROM media_assets WHERE id=@id", new { id });
        return row is null ? null : (row.Content, row.ContentType, row.FileName);
    }

    private sealed class MediaAssetRow
    {
        public byte[] Content { get; set; } = [];
        public string ContentType { get; set; } = "application/octet-stream";
        public string FileName { get; set; } = "asset";
    }
}
