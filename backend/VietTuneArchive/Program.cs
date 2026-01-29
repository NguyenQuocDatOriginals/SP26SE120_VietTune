using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Service.EmailConfirmation;
using VietTuneArchive.Application.Common.Email;
using VietTuneArchive.Application.IServices;
using VietTuneArchive.Application.Mapper;
using VietTuneArchive.Application.Services;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Domain.IRepositories;
using VietTuneArchive.Domain.Repositories;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Database");
builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(connectionString));

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
    try
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
        
        // ✅ Fix: Handle circular references
        c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine($"Swagger Error: {ex.Message}");
    }
});

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<IGenreRepository, GenreRepository>();
builder.Services.AddScoped<IInstrumentRepository, InstrumentRepository>();
builder.Services.AddScoped<IRegionRepository, RegionRepository>();
builder.Services.AddScoped<IProvinceRepository, ProvinceRepository>();
builder.Services.AddScoped<IContextRepository, ContextRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<IInstrumentService, InstrumentService>();
builder.Services.AddScoped<IRegionService, RegionService>();
builder.Services.AddScoped<IProvinceService, ProvinceService>();
builder.Services.AddScoped<IContextService, ContextService>();

// AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

// Email + AutoMapper
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddTransient<EmailService>();

builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p =>
    p.WithOrigins("http://localhost:3000")
     .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// ✅ Error handling middleware
app.UseExceptionHandler("/error");
app.MapGet("/error", () => Results.Problem("An error occurred", statusCode: StatusCodes.Status500InternalServerError));

if (app.Environment.IsDevelopment())  // ✅ Fix: Chỉ Development
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
