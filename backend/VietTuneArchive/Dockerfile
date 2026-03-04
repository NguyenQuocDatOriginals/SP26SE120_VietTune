# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy toàn bộ solution và các file .csproj để restore
# Sử dụng wildcard (*) để tránh lỗi sai tên thư mục cụ thể
COPY ["*.sln", "./"]
COPY ["VietTuneArchive.API/*.csproj", "VietTuneArchive.API/"]
COPY ["VietTuneArchive.Application/*.csproj", "VietTuneArchive.Application/"]
COPY ["VietTuneArchive.Domain/*.csproj", "VietTuneArchive.Domain/"]

# Restore các dependencies
RUN dotnet restore

# Copy toàn bộ code còn lại
COPY . .

# Build dự án (Đảm bảo tên thư mục VietTuneArchive.API là đúng 100%)
WORKDIR "/src/VietTuneArchive.API"
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render yêu cầu chạy trên cổng 8080 (hoặc 10000)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VietTuneArchive.API.dll"]