/**
 * HeatmapColumn.jsx — A week column in the heatmap
 */
import React, { memo } from 'react';
import HeatmapCell from './HeatmapCell';

const HeatmapColumn = memo(({ weekData, colIndex, intensityData }) => {
    return (
        <div className="flex flex-col gap-1">
            {weekData.map((day, rowIndex) => {
                const intensity = day.date ? (intensityData[day.date] || 0) : 0;
                // Calculate a flat index for animation delay
                const flatIndex = colIndex * 7 + rowIndex;

                return (
                    <HeatmapCell
                        key={`${colIndex}-${rowIndex}`}
                        date={day.date}
                        intensity={intensity}
                        index={flatIndex}
                    />
                );
            })}
        </div>
    );
});

HeatmapColumn.displayName = 'HeatmapColumn';

export default HeatmapColumn;
