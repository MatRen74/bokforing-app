import React from 'react';

interface BalanceBlockProps {
  name: string;
  amount: number;
  type: 'asset' | 'liability' | 'equity';
  scale: number; // A scaling factor to determine height
}

const BalanceBlock: React.FC<BalanceBlockProps> = ({ name, amount, type, scale }) => {
  const height = Math.max(20, Math.abs(amount) * scale); // min height 20px
  const formattedAmount = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', notation: 'compact', maximumFractionDigits: 1 }).format(amount);

  const colorClasses = {
    asset: 'bg-sky-700/80 border-sky-500',
    liability: 'bg-amber-700/80 border-amber-500',
    equity: 'bg-emerald-700/80 border-emerald-500',
  };
  
  return (
    <div
      className={`relative flex flex-col justify-center p-1 text-center text-white font-semibold rounded-sm border-b-4 transition-all duration-500 overflow-hidden ${colorClasses[type]}`}
      style={{ height: `${height}px` }}
      title={`${name}: ${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount)}`}
    >
      <div className="text-xs truncate leading-tight px-1">{name}</div>
      <div className="text-sm font-bold">{formattedAmount}</div>
    </div>
  );
};

export default BalanceBlock;
