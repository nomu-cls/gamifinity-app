import React from 'react';

interface EgoStats {
    ego_observation: number;
    ego_control: number;
    ego_efficacy: number;
    ego_affirmation: number;
    stress_tolerance: number;
}

interface RadarChartProps {
    stats: EgoStats;
    size?: number;
    primaryColor?: string;
    animated?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
    stats,
    size = 200,
    primaryColor = '#8B5CF6',
    animated = true
}) => {
    const labels = [
        { key: 'ego_observation', label: '観察力', short: '観' },
        { key: 'ego_control', label: '制御力', short: '制' },
        { key: 'ego_efficacy', label: '効力感', short: '効' },
        { key: 'ego_affirmation', label: '肯定感', short: '肯' },
        { key: 'stress_tolerance', label: '耐性', short: '耐' }
    ];

    const maxValue = 100;
    const center = size / 2;
    const radius = size * 0.35;
    const angleStep = (2 * Math.PI) / 5;
    const startAngle = -Math.PI / 2; // Start from top

    // Calculate points for the data polygon
    const getPoint = (index: number, value: number) => {
        const angle = startAngle + index * angleStep;
        const normalizedValue = Math.min(value, maxValue) / maxValue;
        const r = radius * normalizedValue;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    // Create polygon path for data
    const dataPoints = labels.map((label, i) => {
        const value = stats[label.key as keyof EgoStats] || 0;
        return getPoint(i, value);
    });

    const dataPath = dataPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ') + ' Z';

    // Create grid lines
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPaths = gridLevels.map(level => {
        const gridPoints = labels.map((_, i) => getPoint(i, maxValue * level));
        return gridPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ') + ' Z';
    });

    // Axis lines
    const axisLines = labels.map((_, i) => {
        const outerPoint = getPoint(i, maxValue);
        return { x1: center, y1: center, x2: outerPoint.x, y2: outerPoint.y };
    });

    // Label positions
    const labelPositions = labels.map((label, i) => {
        const angle = startAngle + i * angleStep;
        const labelRadius = radius * 1.25;
        return {
            x: center + labelRadius * Math.cos(angle),
            y: center + labelRadius * Math.sin(angle),
            label: label.label,
            short: label.short,
            value: stats[label.key as keyof EgoStats] || 0
        };
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {/* Background grid */}
                {gridPaths.map((path, i) => (
                    <path
                        key={`grid-${i}`}
                        d={path}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis lines */}
                {axisLines.map((line, i) => (
                    <line
                        key={`axis-${i}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                    />
                ))}

                {/* Data polygon with gradient fill */}
                <defs>
                    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.3" />
                    </radialGradient>
                </defs>

                <path
                    d={dataPath}
                    fill="url(#radarGradient)"
                    stroke={primaryColor}
                    strokeWidth="2"
                    className={animated ? 'animate-pulse' : ''}
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))'
                    }}
                />

                {/* Data points */}
                {dataPoints.map((point, i) => (
                    <circle
                        key={`point-${i}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={primaryColor}
                        stroke="white"
                        strokeWidth="2"
                        className={animated ? 'animate-pulse' : ''}
                    />
                ))}

                {/* Labels */}
                {labelPositions.map((pos, i) => (
                    <g key={`label-${i}`}>
                        <text
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                            className="select-none"
                        >
                            {pos.label}
                        </text>
                        <text
                            x={pos.x}
                            y={pos.y + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="rgba(255,255,255,0.7)"
                            fontSize="10"
                            className="select-none"
                        >
                            {pos.value}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default RadarChart;
