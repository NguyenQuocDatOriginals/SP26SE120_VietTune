using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides; // Thêm dòng này
using Service.EmailConfirmation;
using Supabase;
using VietTuneArchive.Application.Common.Email;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Services;
using VietTuneArchive.Domain.Context;

var builder = WebApplication.CreateBuilder(args);

// --- Cấu hình Forwarded Headers (BẮT BUỘC cho Render/Cloudflare) ---
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ... (Giữ nguyên phần đăng ký Service: DBContext, Supabase, JWT, v.v.) ...
// Lưu ý: Đảm bảo builder.Configuration["Jwt:Key"] không bị null

var app = builder.Build();

// --- THỨ TỰ MIDDLEWARE (Cực kỳ quan trọng) ---

// 1. Phải đặt ForwardedHeaders lên ĐẦU TIÊN
app.UseForwardedHeaders();

// 2. Swagger phải nằm ngay sau đó để không bị chặn bởi Auth
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VietTuneArchive API v1");
    c.RoutePrefix = string.Empty; // Swagger tại trang chủ
});

// 3. Tắt HttpsRedirection trên Render (Vì Render đã lo HTTPS rồi)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");

// 4. Authentication và Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();