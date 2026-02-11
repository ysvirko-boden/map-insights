using MapInsights.Core.Places;

namespace MapInsights.Infrastructure.Places
{
    public class GridDivisionService : IGridDivisionService
    {
        public List<GridCell> DivideIntoGrid(ViewportBounds bounds, double cellSizeInDegrees)
        {
            var cells = new List<GridCell>();

            var latDiff = bounds.North - bounds.South;
            var lngDiff = bounds.East - bounds.West;

            var rows = (int)Math.Ceiling(latDiff / cellSizeInDegrees);
            var columns = (int)Math.Ceiling(lngDiff / cellSizeInDegrees);

            for (var row = 0; row < rows; row++)
            {
                for (var col = 0; col < columns; col++)
                {
                    var south = bounds.South + (row * cellSizeInDegrees);
                    var north = Math.Min(south + cellSizeInDegrees, bounds.North);
                    var west = bounds.West + (col * cellSizeInDegrees);
                    var east = Math.Min(west + cellSizeInDegrees, bounds.East);

                    cells.Add(new GridCell
                    {
                        Bounds = new ViewportBounds
                        {
                            North = north,
                            South = south,
                            East = east,
                            West = west
                        },
                        RowIndex = row,
                        ColumnIndex = col
                    });
                }
            }

            return cells;
        }
    }
}
