# Places Infrastructure

## GoogleApi Integration

Uses the **GoogleApi** NuGet package (v5.8.12) for Google Maps and Places API.

## Configuration

### Development
Set API key in `appsettings.Development.json`:
```json
{
  "GoogleMaps": {
    "ApiKey": "your-key-here"
  }
}
```

### Production
Use environment variable: `GoogleMaps__ApiKey`

## Usage Example

```csharp
using GoogleApi.Entities.Places.Search.NearBy.Request;
using Microsoft.Extensions.Options;

public class PlacesService(IOptions<GoogleMapsOptions> options)
{
    private readonly string _apiKey = options.Value.ApiKey;
    
    public async Task<PlacesNearBySearchResponse> SearchNearbyAsync(
        double lat, double lng, int radius)
    {
        var request = new PlacesNearBySearchRequest
        {
            Key = _apiKey,
            Location = new GoogleApi.Entities.Common.Location(lat, lng),
            Radius = radius
        };
        
        return await GooglePlaces.NearBySearch.QueryAsync(request);
    }
}
```
