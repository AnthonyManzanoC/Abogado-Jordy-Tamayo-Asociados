# Construir desde la raíz del repositorio:
# docker build -f backend/src/JordyTamayo.Api/Dockerfile -t jordy-tamayo-api .

# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restaurar primero para reutilizar la caché de dependencias.
COPY backend/src/JordyTamayo.Api/JordyTamayo.Api.csproj backend/src/JordyTamayo.Api/
RUN dotnet restore backend/src/JordyTamayo.Api/JordyTamayo.Api.csproj

# Copiar solo la API, sin el frontend ni la configuración local.
COPY backend/src/JordyTamayo.Api/ backend/src/JordyTamayo.Api/
RUN dotnet publish backend/src/JordyTamayo.Api/JordyTamayo.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Configurar PORT=8080 en Render para coincidir con este listener.
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# La API no necesita permisos de administrador en el contenedor.
USER app
ENTRYPOINT ["dotnet", "JordyTamayo.Api.dll"]
