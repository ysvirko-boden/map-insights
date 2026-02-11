namespace MapInsights.Core.Places
{
    public interface IGridDivisionService
    {
        List<GridCell> DivideIntoGrid(ViewportBounds bounds, double cellSizeInDegrees);
    }
}
