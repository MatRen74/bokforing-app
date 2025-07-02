
import React from 'react';

interface LiquidityMeterProps {
  liquidity: number;
}

const Bubble: React.FC<{ delay: string; duration: string }> = ({ delay, duration }) => {
    return (
        <div 
            className="bubble absolute bottom-0 left-1/2 w-2 h-2 bg-sky-300/50 rounded-full"
            style={{
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: delay,
                animationDuration: duration,
                transform: 'scale(0)',
            }}
        ></div>
    );
};

const LiquidityMeter: React.FC<LiquidityMeterProps> = ({ liquidity }) => {
    const formattedLiquidity = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(liquidity);

  return (
    <div className="p-4 bg-gray-900/70 rounded-lg h-full flex flex-col">
       <h3 className="text-lg font-semibold text-gray-200 mb-2">Likviditet (Kassa)</h3>
      <div className="flex-grow flex items-end space-x-4">
        <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden relative border-2 border-gray-600">
            <div className="absolute bottom-0 w-full h-2/3 bg-sky-600/70">
                {/* Bubbles for animation */}
                <Bubble delay="0s" duration="3s" />
                <Bubble delay="0.5s" duration="4s" />
                <Bubble delay="1s" duration="2.5s" />
                <Bubble delay="1.5s" duration="3.5s" />
                <Bubble delay="2s" duration="3s" />
            </div>
        </div>
      </div>
      <div className="text-center mt-3">
            <div className="text-2xl font-bold text-sky-300">{formattedLiquidity}</div>
            <div className="text-sm text-gray-400">På bankkonton</div>
        </div>
    </div>
  );
};

export default LiquidityMeter;
