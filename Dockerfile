# Minify CSS/JS with esbuild (cross-platform stand-in for build/Minify-Assets.ps1,
# which only runs on Windows and is skipped by the .csproj target on this Linux image).
FROM node:20-slim AS assets
WORKDIR /src
COPY css/app.css css/app.css
COPY js/app.js js/app.js
RUN npx --yes esbuild@0.28.2 css/app.css --minify --outfile=css/app.min.css \
 && npx --yes esbuild@0.28.2 js/app.js --minify --outfile=js/app.min.js

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
COPY --from=assets /src/css/app.min.css css/app.min.css
COPY --from=assets /src/js/app.min.js js/app.min.js
RUN dotnet publish LandsatProgram.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet LandsatProgram.dll"]
