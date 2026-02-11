namespace MapInsights.Infrastructure.Places
{
    public class GoogleMapsOptions
    {
        public required string ApiKey { get; set; }
        public int MaxParallelRequests { get; set; } = 10;
        public double GridCellSizeInDegrees { get; set; } = 0.005;
        public int MaxGridCells { get; set; } = 25;
    }
}
