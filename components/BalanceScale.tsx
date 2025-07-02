import React from 'react';
import { BalanceSheetItem } from '../types';
import BalanceBlock from './BalanceBlock';

interface BalanceScaleProps {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equityItems: BalanceSheetItem[];
}

const BalanceScale: React.FC<BalanceScaleProps> = ({ assets, liabilities, equityItems }) => {
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = 
    liabilities.reduce((sum, item) => sum + item.amount, 0) +
    equityItems.reduce((sum, item) => sum + item.amount, 0);

  // Use the larger of the two totals to set the scale, prevents blocks from getting too large on one side
  const maxTotal = Math.max(totalAssets, totalLiabilitiesAndEquity);
  // This scaling factor makes block sizes relative to the total balance sheet size
  const scale = maxTotal > 0 ? 250 / maxTotal : 0; // 250px is the approx max height for the block container

  const difference = totalAssets - totalLiabilitiesAndEquity;
  // Tilt calculation: More sensitive for small differences, maxes out at ~15 degrees
  const tilt = Math.max(-15, Math.min(15, (difference / totalAssets) * 45 || 0));

  const formattedTotalAssets = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(totalAssets);
  const formattedTotalLiabilitiesAndEquity = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(totalLiabilitiesAndEquity);
  
  return (
    <div className="mt-12 w-full pt-8">
      <h2 className="text-2xl font-bold text-center text-gray-200 mb-2">Balansvågen</h2>
      <p className="text-center text-gray-400 mb-8">En visuell representation av din balansräkning.</p>
      
      <div className="relative w-full" style={{ height: '400px' }}>
        {/* Fulcrum (Base) */}
        <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-4 h-[180px] bg-gray-600 z-0"></div>
        <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-48 h-4 bg-gray-600 rounded-t-sm z-0"></div>

        {/* Beam Container - This will be the pivot point and will rotate */}
        <div
            className="absolute top-[180px] left-0 w-full h-2 transition-transform duration-1000 ease-in-out origin-center z-10"
            style={{ transform: `rotate(${tilt}deg)` }}
        >
            {/* The visible beam graphic */}
            <div className="absolute left-[10%] w-[80%] h-full bg-gray-500 rounded-full shadow-lg"></div>
            
            {/* Left Pan (at the left end of the beam) */}
            <div className="absolute left-[10%] bottom-2 -translate-x-1/2">
                <div className="flex flex-col-reverse items-stretch gap-1 p-2 bg-gray-900/50 rounded-lg w-52 min-h-[50px] border border-gray-700">
                     {assets.map(item => (
                        <BalanceBlock key={`asset-${item.accountNumber}`} {...item} type="asset" scale={scale} />
                    ))}
                </div>
            </div>

            {/* Right Pan (at the right end of the beam) */}
            <div className="absolute right-[10%] bottom-2 translate-x-1/2">
                 <div className="flex flex-col-reverse items-stretch gap-1 p-2 bg-gray-900/50 rounded-lg w-52 min-h-[50px] border border-gray-700">
                    {liabilities.map(item => (
                        <BalanceBlock key={`lia-${item.accountNumber}`} {...item} type="liability" scale={scale} />
                    ))}
                    {equityItems.map(item => (
                        <BalanceBlock key={`eq-${item.accountNumber}`} {...item} type="equity" scale={scale} />
                    ))}
                </div>
            </div>
        </div>
        
        {/* Totals - placed absolutely so they don't rotate */}
        <div className="absolute bottom-0 left-[20%] text-center">
            <h4 className="font-semibold text-gray-300">Tillgångar</h4>
            <div className="font-bold text-xl text-sky-300">{formattedTotalAssets}</div>
        </div>
        <div className="absolute bottom-0 right-[20%] text-center">
            <h4 className="font-semibold text-gray-300">Skulder & Eget Kapital</h4>
            <div className="font-bold text-xl text-amber-300">{formattedTotalLiabilitiesAndEquity}</div>
        </div>
      </div>
       {Math.abs(difference) > 1 && (
         <div className="text-center mt-4 p-3 bg-yellow-900/50 border border-yellow-500 rounded-lg max-w-lg mx-auto">
           <p className="font-semibold text-yellow-300">Vågen är i obalans!</p>
           <p className="text-yellow-400 text-sm">Skillnaden är {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(difference)}. Detta kan bero på avrundningsfel eller en ofullständig SIE-fil.</p>
         </div>
       )}
    </div>
  );
};

export default BalanceScale;
