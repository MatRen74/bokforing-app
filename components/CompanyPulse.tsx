import React from 'react';
import { FinancialMetrics } from '../types';
import EquityMeter from './EquityMeter';
import LiquidityMeter from './LiquidityMeter';
import BalanceScale from './BalanceScale';
import Timeline from './Timeline';

interface CompanyPulseProps {
  metrics: FinancialMetrics;
  onReset: () => void;
}

const CompanyPulse: React.FC<CompanyPulseProps> = ({ metrics, onReset }) => {
  return (
    <div className="w-full max-w-7xl p-4 md:p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700">
      <div className="flex justify-between items-start mb-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{metrics.companyName}</h1>
          <p className="text-gray-400">Företagets Puls | Räkenskapsår: {metrics.fiscalYearStart} - {metrics.fiscalYearEnd}</p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors text-sm"
        >
          Ladda ny fil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-12 px-4">
        <div className="md:col-span-2">
            <EquityMeter equity={metrics.totalEquity} shareCapital={metrics.shareCapital} />
        </div>
        <div>
            <LiquidityMeter liquidity={metrics.totalLiquidity} />
        </div>
      </div>

      <hr className="border-gray-700/50" />

      <BalanceScale 
        assets={metrics.assets}
        liabilities={metrics.liabilities}
        equityItems={metrics.equityItems}
      />

      <hr className="border-gray-700/50 mt-12" />

      <Timeline
        events={metrics.timelineEvents}
        fiscalYearStart={metrics.fiscalYearStart}
        fiscalYearEnd={metrics.fiscalYearEnd}
        initialLiquidity={metrics.initialLiquidity}
      />
    </div>
  );
};

export default CompanyPulse;
