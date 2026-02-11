namespace MapInsights.Core.Places
{
    public class GridCell
    {
        public required ViewportBounds Bounds { get; init; }
        public int RowIndex { get; init; }
        public int ColumnIndex { get; init; }
    }
}
