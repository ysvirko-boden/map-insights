namespace MapInsights.Core.Places
{
    public interface IPlacesService
    {
        Task<PlaceSearchResult> SearchPlacesAsync(PlaceSearchCriteria criteria, CancellationToken cancellationToken);
    }
}
