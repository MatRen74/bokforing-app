import React, { useState, useMemo } from 'react';
import { TimelineEvent } from '../types';

interface AugmentedEvent extends TimelineEvent {
    cashAfter: number;
}

interface TimelineProps {
    events: TimelineEvent[];
    fiscalYearStart: string;
    fiscalYearEnd: string;
    initialLiquidity: number;
}

interface TooltipData {
    x: number;
    y: number;
    event: AugmentedEvent;
}

const formatDate = (date: Date) => date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
const formatCurrency = (amount: number) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(amount);

const Timeline: React.FC<TimelineProps> = ({ events, fiscalYearStart, fiscalYearEnd, initialLiquidity }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const data = useMemo(() => {
        if (!fiscalYearStart || !fiscalYearEnd || events === null) {
            return null;
        }

        const startDate = new Date(parseInt(fiscalYearStart.slice(0, 4)), parseInt(fiscalYearStart.slice(4, 6)) - 1, parseInt(fiscalYearStart.slice(6, 8)));
        const endDate = new Date(parseInt(fiscalYearEnd.slice(0, 4)), parseInt(fiscalYearEnd.slice(4, 6)) - 1, parseInt(fiscalYearEnd.slice(6, 8)));
        const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

        if (totalDays <= 0) return null;

        const width = Math.max(1200, totalDays * 4);
        const height = 400;
        const resultGraphHeight = 80; // Max height for a result bar
        const cashGraphHeight = height * 0.4; // The vertical space for the cash graph
        const cashGraphTop = height * 0.55; // Y-coordinate where the top of the cash graph starts

        const getX = (date: Date) => {
            const daysFromStart = (date.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
            return (daysFromStart / totalDays) * width;
        };
        
        const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

        // --- Robust calculation of running cash total ---
        const eventsWithCashState: AugmentedEvent[] = [];
        let cashRunningTotal = initialLiquidity;
        for (const event of sortedEvents) {
            cashRunningTotal += event.cashChange;
            eventsWithCashState.push({
                ...event,
                cashAfter: cashRunningTotal,
            });
        }

        // --- Correctly calculate scales ---
        const maxResultChange = Math.max(...eventsWithCashState.map(e => Math.abs(e.resultChange)), 1);
        const resultScale = resultGraphHeight / maxResultChange;

        const allCashValues = [initialLiquidity, ...eventsWithCashState.map(p => p.cashAfter)];
        const minCash = Math.min(...allCashValues);
        const maxCash = Math.max(...allCashValues);
        const cashRange = maxCash - minCash || 1;

        const getCashY = (value: number) => {
            const normalizedValue = (value - minCash) / cashRange;
            return cashGraphTop + (cashGraphHeight - (normalizedValue * cashGraphHeight));
        };

        // --- Create path for SVG step-chart directly ---
        let currentY = getCashY(initialLiquidity);
        let cashPath = `M 0 ${currentY.toFixed(2)}`;

        eventsWithCashState.forEach(event => {
            const x = getX(event.date).toFixed(2);
            // 1. Horizontal line to the event's x-coordinate, using the previous Y-value
            cashPath += ` L ${x} ${currentY.toFixed(2)}`;
            
            // Update y for the vertical jump
            currentY = getCashY(event.cashAfter);
            
            // 2. Vertical line to the new y-coordinate at the same x
            cashPath += ` L ${x} ${currentY.toFixed(2)}`;
        });

        // 3. Horizontal line from the last event to the end of the graph
        cashPath += ` L ${width.toFixed(2)} ${currentY.toFixed(2)}`;

        // --- Month markers ---
        const monthMarkers = [];
        let currentDate = new Date(startDate);
        currentDate.setDate(1); // Start from the 1st of the starting month
        while (currentDate <= endDate) {
             monthMarkers.push({
                x: getX(currentDate),
                label: currentDate.toLocaleDateString('sv-SE', { month: 'short' })
             });
             currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return { width, height, getX, resultScale, cashPath, getCashY, monthMarkers, eventsWithCashState };
    }, [events, fiscalYearStart, fiscalYearEnd, initialLiquidity]);

    if (!data) {
        return <div className="text-center text-gray-500 py-10">Kunde inte rita tidslinjen. Ogiltig eller saknad data.</div>;
    }

    const { width, height, getX, resultScale, cashPath, getCashY, monthMarkers, eventsWithCashState } = data;

    return (
        <div className="mt-12 w-full pt-8">
            <h2 className="text-2xl font-bold text-center text-gray-200 mb-2">Tidslinjen: Resultat vs Kassaflöde</h2>
            <p className="text-center text-gray-400 mb-8">Jämför bokförda händelser (intäkter & kostnader) med det faktiska penningflödet på banken.</p>
            <div className="w-full overflow-x-auto bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div style={{ width: `${width}px`, height: `${height}px` }} className="relative">
                    <svg width={width} height={height} className="absolute inset-0">
                        {/* Center Line */}
                        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#4A5568" strokeDasharray="4" />
                        
                        {/* Month Markers */}
                        {monthMarkers.map(m => (
                             <g key={m.label}>
                                <line x1={m.x} y1="0" x2={m.x} y2={height} stroke="#374151" />
                                <text x={m.x + 5} y={height - 10} fill="#6B7280" fontSize="12">{m.label.toUpperCase()}</text>
                             </g>
                        ))}

                        {/* Resultat-spåret */}
                        <text x="10" y="20" fill="#A0AEC0" fontSize="14" fontWeight="bold">Resultat</text>
                        {eventsWithCashState
                            .filter(event => Math.abs(event.resultChange) > 0.01)
                            .map((event, i) => {
                                const x = getX(event.date);
                                const isIncome = event.resultChange > 0;
                                const barHeight = Math.abs(event.resultChange) * resultScale;
                                const y = isIncome ? height / 2 - barHeight : height / 2;
                                return (
                                    <rect
                                        key={`result-${i}`}
                                        x={x - 2}
                                        y={y}
                                        width="4"
                                        height={barHeight}
                                        fill={isIncome ? '#48BB78' : '#F56565'}
                                        className="cursor-pointer opacity-70 hover:opacity-100"
                                        onMouseEnter={() => {
                                            const tooltipY = isIncome ? y : y + barHeight;
                                            setTooltip({ x, y: tooltipY, event });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                );
                        })}

                        {/* Kassaflödes-spåret */}
                        <text x="10" y={height - 30} fill="#A0AEC0" fontSize="14" fontWeight="bold">Kassaflöde</text>
                        <path d={cashPath} stroke="#38B2AC" strokeWidth="2.5" fill="none" />
                        {eventsWithCashState
                            .filter(e => Math.abs(e.cashChange) > 0.01)
                            .map((event, i) => {
                                const x = getX(event.date);
                                const y = getCashY(event.cashAfter);
                                return (
                                    <circle 
                                        key={`cash-${i}`}
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="#38B2AC"
                                        stroke="#1A202C"
                                        strokeWidth="2"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setTooltip({ x, y, event })}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                )
                         })}

                    </svg>
                    {tooltip && (
                        <div
                            className="absolute p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-xl w-64 text-sm z-20 pointer-events-none"
                            style={{
                                left: `${tooltip.x + 15}px`,
                                top: `${tooltip.y}px`,
                                transform: `translateY(-50%)`,
                            }}
                        >
                            <div className="font-bold text-gray-300">{formatDate(tooltip.event.date)}</div>
                            <p className="text-gray-400 italic mb-2 max-h-20 overflow-y-auto">"{tooltip.event.description}"</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-400">Resultatpåverkan:</span>
                                <span className={`font-semibold ${tooltip.event.resultChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(tooltip.event.resultChange)}
                                </span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Kassaflöde:</span>
                                <span className={`font-semibold ${tooltip.event.cashChange >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>
                                    {formatCurrency(tooltip.event.cashChange)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
