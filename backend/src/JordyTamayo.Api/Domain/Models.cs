namespace JordyTamayo.Api.Domain;

public sealed class SiteProfile
{
    public int Id { get; set; } = 1;
    public string BrandName { get; set; } = "Jordy Tamayo";
    public string FullName { get; set; } = "Abg. Jordy Tamayo";
    public string Credentials { get; set; } = "Abogado · Máster";
    public string Eyebrow { get; set; } = "Estrategia legal · Babahoyo";
    public string HeroTitle { get; set; } = "Derecho con";
    public string HeroAccent { get; set; } = "criterio y carácter.";
    public string HeroDescription { get; set; } = "Asesoría jurídica cercana, estratégica y directa.";
    public string BioTitle { get; set; } = "Preparación que se convierte en estrategia.";
    public string BioBody { get; set; } = "Una práctica jurídica moderna, construida sobre estudio constante, análisis riguroso y una comunicación clara con cada cliente.";
    public string SocialProof { get; set; } = "200K+";
    public string SocialProofLabel { get; set; } = "comunidad en TikTok";
    public string MetricOneValue { get; set; } = "01";
    public string MetricOneLabel { get; set; } = "estrategia para cada caso";
    public string MetricTwoValue { get; set; } = "360°";
    public string MetricTwoLabel { get; set; } = "visión legal";
    public string AddressLine1 { get; set; } = "Edificio Alavama";
    public string AddressLine2 { get; set; } = "Calle Sucre y Av. 5 de Junio";
    public string City { get; set; } = "Babahoyo, Los Ríos";
    public string GoogleMapsUrl { get; set; } = "https://maps.google.com/?q=Edificio+Alavama+Babahoyo";
    public string WhatsAppNumber { get; set; } = "";
    public string Email { get; set; } = "contacto@jordytamayo.ec";
    public string Phone { get; set; } = "";
    public string TikTokUrl { get; set; } = "https://www.tiktok.com/@jordytamayo";
    public string InstagramUrl { get; set; } = "https://www.instagram.com/jordytamayo28";
    public string FacebookUrl { get; set; } = "https://www.facebook.com/share/19PQUeXhoj/";
    public string HeroImageUrl { get; set; } = "/images/jordy-tamayo-hero.png";
    public string PortraitImageUrl { get; set; } = "/images/jordy-tamayo-office.png";
    public string DegreeImageUrl { get; set; } = "/images/jordy-tamayo-maestria.png";
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class LegalService
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string LongDescription { get; set; } = "";
    public string Icon { get; set; } = "Scale";
    public string Accent { get; set; } = "01";
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public bool Active { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class MediaPost
{
    public Guid Id { get; set; }
    public string Platform { get; set; } = "TikTok";
    public string Title { get; set; } = "";
    public string Url { get; set; } = "";
    public string ThumbnailUrl { get; set; } = "";
    public string Caption { get; set; } = "";
    public string Category { get; set; } = "Actualidad";
    public int DisplayOrder { get; set; }
    public bool Active { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class Lead
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Whatsapp { get; set; } = "";
    public string Email { get; set; } = "";
    public string LegalArea { get; set; } = "";
    public string ConsultationType { get; set; } = "Presencial";
    public DateOnly? PreferredDate { get; set; }
    public string Message { get; set; } = "";
    public string Status { get; set; } = "Nuevo";
    public string Source { get; set; } = "Web";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class AdminUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string PasswordSalt { get; set; } = "";
    public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; }
}

public sealed record PublicSiteResponse(SiteProfile Profile, IReadOnlyList<LegalService> Services, IReadOnlyList<MediaPost> MediaPosts);
public sealed record LoginRequest(string Email, string Password);
public sealed record LoginResponse(string Token, DateTimeOffset ExpiresAt, string Email);
public sealed record CreateLeadRequest(string Name, string Whatsapp, string? Email, string LegalArea, string ConsultationType, DateOnly? PreferredDate, string Message);
public sealed record DashboardResponse(int TotalLeads, int NewLeads, int Services, int MediaPosts, IReadOnlyList<Lead> RecentLeads);
