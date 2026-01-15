using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Service.EmailConfirmation;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using VietTuneArchive.Application.Common.Email;
using VietTuneArchive.Application.Mapper;
using VietTuneArchive.Domain.Context;
using VietTuneArchive.Application.Services;

var builder = WebApplication.CreateBuilder(args);

var smtpSettings = builder.Configuration.GetSection("SmtpSettings");
var connectionString = builder.Configuration.GetConnectionString("Database");

builder.Services.AddDbContext<DBContext>(options =>
    options.UseSqlServer(connectionString));

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Add services to the container.
builder.Services.Configure<SmtpSettings>(smtpSettings);
builder.Services.AddSingleton<EmailService>();

builder.Services.AddControllers();
builder.Services.AddControllersWithViews()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.Preserve);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(option =>
{
    // JWT Config
    option.DescribeAllParametersInCamelCase();
    option.ResolveConflictingActions(conf => conf.First());

    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:7200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Essentia API HttpClient
builder.Services.AddHttpClient<EssentiaService>(client =>
{
    var baseUrl = builder.Configuration["EssentiaApi:BaseUrl"] ?? "http://localhost:5000";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromMinutes(5);
});

// Audio Analysis Service
builder.Services.AddScoped<AudioAnalysisService>();

// ==========================

// Others
builder.Services.AddTransient<EmailService>();
builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfile));
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.MapGet("/health", () =>
    Results.Ok(new
    {
        status = "ok",
        service = "music-heritage-api"
    }))
.WithName("Health");

app.Run();
