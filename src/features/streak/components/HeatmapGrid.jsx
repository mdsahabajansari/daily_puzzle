/**
 * HeatmapGrid.jsx — The main grid rendering
 */
import React, { useMemo } from 'react';
import HeatmapColumn from './HeatmapColumn';
import { generateDateGrid } from '../utils/dateUtils';

export default function HeatmapGrid({ intensityData }) {
    // Generate grid once (or when depend changes, though here it's static relative to today)
    const weeks = useMemo(() => generateDateGrid(365), []);

    return (
        <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
            {weeks.map((week, index) => (
                <HeatmapColumn
                    key={index}
                    weekData={week}
                    colIndex={index}
                    intensityData={intensityData}
                />
            ))}
        </div>
    );
}
