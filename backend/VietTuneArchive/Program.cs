using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Service.EmailConfirmation;
using Supabase;
using VietTuneArchive.Application.Common.Email;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Services;
using VietTuneArchive.Domain.Context;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Database");
builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(connectionString));

var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    throw new Exception("CRITICAL: Supabase URL or Key is missing from Configuration/Environment Variables!");
}
var supabaseClient = new Client(supabaseUrl, supabaseKey);


builder.Services.AddSingleton(supabaseClient);
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]!);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services
    .AddScoped<IEnumsProvider, EnumsProvider>()
    .AddScoped<IAudioUploadService, AudioUploadService>()
    .AddScoped<IAudioProcessingService, AudioProcessingService>();
// ✅ CRITICAL: Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", p => p.RequireRole("Admin"));
    options.AddPolicy("Expert", p => p.RequireRole("Expert"));
    options.AddPolicy("Owner", p => p.RequireAssertion(c => true)); // Custom impl
});

// Controllers + JSON
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "VietTuneArchive", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Bearer",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new()
    {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, new string[] { } }
    });
});
builder.Services.AddHttpClient();

// Email + AutoMapper
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddTransient<EmailService>();

builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p =>
    p.WithOrigins("http://localhost:3000")
     .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// 1. Cấu hình Swagger: Đưa lên ĐẦU TIÊN của pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VietTuneArchive API v1");
    c.RoutePrefix = string.Empty; // Swagger sẽ là trang chủ
});

// 2. QUAN TRỌNG: Tắt hoặc giới hạn HttpsRedirection trên Render
// Render xử lý HTTPS ở tầng Load Balancer, nếu app cố redirect tiếp sẽ gây lỗi "Failed to determine https port"
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 3. Thứ tự Middleware chuẩn
app.UseCors("AllowReactApp");

// Đảm bảo Authentication trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
