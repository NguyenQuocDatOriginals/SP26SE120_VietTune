using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides;
using Supabase; // Giữ lại nếu bạn vẫn dùng Supabase Storage
using VietTuneArchive.Application.Common.Email;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Cấu hình Forwarded Headers (Giúp Render nhận diện HTTPS) ---
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// --- 2. Khởi tạo Gemini / Supabase từ Config ---
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
{
    builder.Services.AddSingleton(new Client(supabaseUrl, supabaseKey));
}

// Lấy JWT Key để Auth hoạt động
var jwtKey = builder.Configuration["Jwt:Key"] ?? "Key_Mac_Dinh_Sieu_Dai_De_Khong_Loi";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

// Đăng ký các Service xử lý Gemini của bạn ở đây
builder.Services.AddScoped<IAudioProcessingService, AudioProcessingService>();
// builder.Services.AddHttpClient(); // Đừng quên nếu Service của bạn dùng HttpClient để gọi Gemini

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 3. Thứ tự Middleware chuẩn Render ---
app.UseForwardedHeaders();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VietTuneArchive API v1");
    c.RoutePrefix = string.Empty; // Hiện Swagger ngay trang chủ
});

// TẮT HttpsRedirection để tránh lỗi vòng lặp trên Render
// app.UseHttpsRedirection(); 

app.UseCors(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();