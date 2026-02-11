using MapInsights.Core.Places;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MapInsights.Infrastructure.Places
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPlacesInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<GoogleMapsOptions>(
                configuration.GetSection("GoogleMaps"));

            services.AddScoped<IGridDivisionService, GridDivisionService>();
            services.AddScoped<IPlacesService, GooglePlacesService>();

            return services;
        }
    }
}
