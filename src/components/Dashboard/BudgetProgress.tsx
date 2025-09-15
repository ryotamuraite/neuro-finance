import React from 'react';
import { DollarSign } from 'lucide-react';

interface BudgetProgressProps {
  budget: number;
  spent: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ budget, spent }) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = Math.max(budget - spent, 0);
  
  // 予算使用率に応じた色の設定
  const getProgressColor = () => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusMessage = () => {
    if (percentage < 60) return '余裕があります';
    if (percentage < 80) return '順調です';
    if (percentage < 100) return '注意が必要です';
    return '予算超過！';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        <span className="text-sm font-medium text-gray-500">
          {getStatusMessage()}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-1">今月の予算</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-800">
            ¥{spent.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            / ¥{budget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {percentage.toFixed(1)}% 使用済み
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          残り ¥{remaining.toLocaleString()} 使用可能
        </p>
      </div>
    </div>
  );
};
