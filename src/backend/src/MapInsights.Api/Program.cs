using Serilog;
using MapInsights.Api.Features.Health;
using MapInsights.Api.Features.Places;
using MapInsights.Api.Features.Places.Validators;
using MapInsights.Infrastructure.Places;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

// Add Memory Cache with configuration
builder.Services.AddMemoryCache(options =>
{
    var config = builder.Configuration.GetSection("MemoryCache");
    
    var sizeLimit = config.GetValue<long?>("SizeLimit");
    if (sizeLimit.HasValue)
    {
        options.SizeLimit = sizeLimit.Value;
    }
    
    var compactionPercentage = config.GetValue<double?>("CompactionPercentage");
    if (compactionPercentage.HasValue)
    {
        options.CompactionPercentage = compactionPercentage.Value;
    }
    
    var expirationScanFrequency = config.GetValue<TimeSpan?>("ExpirationScanFrequency");
    if (expirationScanFrequency.HasValue)
    {
        options.ExpirationScanFrequency = expirationScanFrequency.Value;
    }
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddValidatorsFromAssemblyContaining<PlaceSearchRequestValidator>();

builder.Services.AddPlacesInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Firebase authentication
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] 
    ?? throw new InvalidOperationException("Firebase:ProjectId is not configured");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSerilogRequestLogging();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapPlacesEndpoints();

app.Run();

public partial class Program { }
