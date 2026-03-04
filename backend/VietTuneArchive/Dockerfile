# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file .csproj vào đúng thư mục để restore (tối ưu cache Docker)
COPY ["VietTuneArchive.API/VietTuneArchive.API.csproj", "VietTuneArchive.API/"]
COPY ["VietTuneArchive.Application/VietTuneArchive.Application.csproj", "VietTuneArchive.Application/"]
COPY ["VietTuneArchive.Domain/VietTuneArchive.Domain.csproj", "VietTuneArchive.Domain/"]

# Thực hiện restore các gói NuGet
RUN dotnet restore "VietTuneArchive.API/VietTuneArchive.API.csproj"

# Sau đó mới copy toàn bộ mã nguồn vào
COPY . .

# Build dự án
WORKDIR "/src/VietTuneArchive.API"
RUN dotnet build "VietTuneArchive.API.csproj" -c Release -o /app/build

# Publish ra file thực thi
FROM build AS publish
RUN dotnet publish "VietTuneArchive.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 2: Chạy ứng dụng (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Cấu hình Port: Render mặc định dùng cổng 10000 hoặc 8080
# Chúng ta sẽ ép ứng dụng chạy ở cổng 8080 (HTTP) thay vì 7264 (HTTPS) vì Render lo phần SSL rồi
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VietTuneArchive.API.dll"]