using Dapper;
using Npgsql;

namespace JordyTamayo.Api.Infrastructure;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var options = scope.ServiceProvider.GetRequiredService<DatabaseOptions>();
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        await using var connection = new NpgsqlConnection(options.ConnectionString);
        await connection.OpenAsync();

        await connection.ExecuteAsync("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
        var migrationsPath = Path.Combine(AppContext.BaseDirectory, "Infrastructure", "Migrations");
        foreach (var file in Directory.GetFiles(migrationsPath, "*.sql").OrderBy(Path.GetFileName))
        {
            var name = Path.GetFileName(file);
            if (await connection.ExecuteScalarAsync<bool>("SELECT EXISTS(SELECT 1 FROM app_migrations WHERE name = @name)", new { name })) continue;
            await using var transaction = await connection.BeginTransactionAsync();
            await connection.ExecuteAsync(await File.ReadAllTextAsync(file), transaction: transaction);
            await connection.ExecuteAsync("INSERT INTO app_migrations(name) VALUES (@name)", new { name }, transaction);
            await transaction.CommitAsync();
        }

        await SeedContentAsync(connection);
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@jordytamayo.ec";
        var exists = await connection.ExecuteScalarAsync<bool>("SELECT EXISTS(SELECT 1 FROM admin_users WHERE lower(email)=lower(@adminEmail))", new { adminEmail });
        if (!exists)
        {
            var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
                ?? throw new InvalidOperationException("ADMIN_PASSWORD es obligatoria para crear el administrador inicial.");
            var (hash, salt) = hasher.Hash(adminPassword);
            await connection.ExecuteAsync("INSERT INTO admin_users(id,email,password_hash,password_salt,role,is_active) VALUES (@id,@adminEmail,@hash,@salt,'Admin',true)", new { id = Guid.NewGuid(), adminEmail, hash, salt });
        }
    }

    private static async Task SeedContentAsync(NpgsqlConnection connection)
    {
        await connection.ExecuteAsync("INSERT INTO site_profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING");

        var services = new[]
        {
            new { Id = Guid.NewGuid(), Slug = "derecho-penal", Name = "Derecho penal", ShortDescription = "Defensa técnica, inmediata y estratégica en cada etapa del proceso.", LongDescription = "Acompañamiento integral desde la primera consulta, análisis de riesgos, diseño de la teoría del caso y representación durante todo el proceso penal.", Icon = "Shield", Accent = "01", Order = 1 },
            new { Id = Guid.NewGuid(), Slug = "derecho-familia", Name = "Familia", ShortDescription = "Soluciones humanas y firmes para decisiones que cambian la vida.", LongDescription = "Asesoría en divorcios, alimentos, tenencia, régimen de visitas y acuerdos familiares, con claridad jurídica y sensibilidad personal.", Icon = "Users", Accent = "02", Order = 2 },
            new { Id = Guid.NewGuid(), Slug = "derecho-civil", Name = "Civil y contratos", ShortDescription = "Prevención de conflictos y defensa de sus derechos patrimoniales.", LongDescription = "Redacción y revisión de contratos, obligaciones, cobros, propiedad y controversias civiles con una visión preventiva y práctica.", Icon = "FileText", Accent = "03", Order = 3 },
            new { Id = Guid.NewGuid(), Slug = "transito", Name = "Tránsito", ShortDescription = "Respuesta ágil ante accidentes, citaciones y procedimientos.", LongDescription = "Defensa y asesoría en infracciones, accidentes de tránsito, impugnaciones y procedimientos administrativos o judiciales.", Icon = "Car", Accent = "04", Order = 4 }
        };
        foreach (var item in services)
        {
            await connection.ExecuteAsync("""
                INSERT INTO legal_services(id,slug,name,short_description,long_description,icon,accent,is_featured,display_order,active)
                VALUES (@Id,@Slug,@Name,@ShortDescription,@LongDescription,@Icon,@Accent,true,@Order,true)
                ON CONFLICT (slug) DO NOTHING
                """, item);
        }

        var media = new[]
        {
            new { Id = Guid.NewGuid(), Platform = "TikTok", Title = "Criterio legal en lenguaje claro", Url = "https://www.tiktok.com/@jordytamayo", Thumb = "/images/jordy-tamayo-hero.png", Caption = "Análisis, actualidad y educación jurídica para una comunidad de más de 200K personas.", Category = "Comunidad", Order = 1 },
            new { Id = Guid.NewGuid(), Platform = "Instagram", Title = "Detrás de cada caso", Url = "https://www.instagram.com/jordytamayo28", Thumb = "/images/jordy-tamayo-office.png", Caption = "Contenido profesional, experiencias y una mirada cercana a la práctica del derecho.", Category = "Práctica legal", Order = 2 },
            new { Id = Guid.NewGuid(), Platform = "Facebook", Title = "Actualidad jurídica", Url = "https://www.facebook.com/share/19PQUeXhoj/", Thumb = "/images/jordy-tamayo-maestria.png", Caption = "Información útil y contacto directo con la comunidad de Babahoyo.", Category = "Actualidad", Order = 3 }
        };
        foreach (var item in media)
        {
            await connection.ExecuteAsync("""
                INSERT INTO media_posts(id,platform,title,url,thumbnail_url,caption,category,display_order,active)
                VALUES (@Id,@Platform,@Title,@Url,@Thumb,@Caption,@Category,@Order,true)
                ON CONFLICT (url) DO NOTHING
                """, item);
        }
    }
}
