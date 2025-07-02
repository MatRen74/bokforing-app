
import React from 'react';

interface EquityMeterProps {
  equity: number;
  shareCapital: number;
}

const EquityMeter: React.FC<EquityMeterProps> = ({ equity, shareCapital }) => {
  const equityRatio = shareCapital > 0 ? equity / shareCapital : 0;
  const fillPercentage = Math.max(0, Math.min(100, equityRatio * 100));

  let bgColor = 'bg-green-500';
  let statusText = 'Stabilt';
  let statusColor = 'text-green-300';

  if (equityRatio < 0.5) {
    bgColor = 'bg-red-600';
    statusText = 'Kritiskt';
    statusColor = 'text-red-300';
  } else if (equityRatio < 0.75) {
    bgColor = 'bg-yellow-500';
    statusText = 'Varning';
    statusColor = 'text-yellow-300';
  }
  
  const formattedEquity = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(equity);
  const formattedShareCapital = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(shareCapital);


  return (
    <div className="p-4 bg-gray-900/70 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Eget Kapital</h3>
      <div className="flex items-end space-x-4">
        <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden relative border-2 border-gray-600">
            {/* The liquid fill */}
            <div
                className={`absolute bottom-0 w-full transition-all duration-1000 ease-in-out ${bgColor}`}
                style={{ height: `${fillPercentage}%` }}
            ></div>
            {/* Markings */}
            <div className="absolute top-1/4 w-full border-t border-dashed border-gray-500/50">
                <span className="absolute -left-7 text-xs text-gray-500 -translate-y-1/2">75%</span>
            </div>
            <div className="absolute top-1/2 w-full border-t border-dashed border-red-400/50">
                <span className="absolute -left-7 text-xs text-red-400 -translate-y-1/2">50%</span>
            </div>
        </div>
        <div className="flex-shrink-0 w-48">
            <div className={`text-3xl font-bold ${statusColor}`}>{statusText}</div>
            <div className="text-lg text-gray-200 font-medium">{formattedEquity}</div>
            <div className="text-sm text-gray-400">av {formattedShareCapital}</div>
        </div>
      </div>
    </div>
  );
};

export default EquityMeter;
