import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  trend?: number; // 前月比のパーセンテージ
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, trend = 0 }) => {
  const formattedBalance = balance.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  });

  const trendIcon = trend >= 0 ? (
    <TrendingUp className="h-5 w-5 text-green-500" />
  ) : (
    <TrendingDown className="h-5 w-5 text-red-500" />
  );

  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Wallet className="h-6 w-6 text-blue-600" />
        </div>
        {trend !== 0 && (
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className={`text-sm font-semibold ${trendColor}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-600 text-sm mb-1">総資産</p>
        <p className="text-2xl font-bold text-gray-800">
          {formattedBalance}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          前月から{trend >= 0 ? '順調に成長中' : '調整期間中'}
        </p>
      </div>
    </div>
  );
};
