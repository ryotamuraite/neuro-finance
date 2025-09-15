import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Heart, 
  Trophy,
  AlertCircle
} from 'lucide-react';
import { BalanceCard } from './BalanceCard';
import { BudgetProgress } from './BudgetProgress';
import { SpendingChart } from './SpendingChart';
import { MoodTracker } from './MoodTracker';
import { LevelProgress } from './LevelProgress';
import { QuickActions } from './QuickActions';

export const Dashboard: React.FC = () => {
  // 仮のデータ（後でContextやAPIから取得）
  const dashboardData = {
    totalBalance: 125000,
    monthlyBudget: 200000,
    monthlySpent: 87500,
    currentLevel: 3,
    currentXP: 450,
    nextLevelXP: 1000,
    currentMood: 'stable' as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NeuroFinance Dashboard
          </h1>
          <p className="text-gray-600">
            今日も一歩ずつ、確実に前進していきましょう
          </p>
        </header>

        {/* メインダッシュボードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 残高カード */}
          <BalanceCard 
            balance={dashboardData.totalBalance}
            trend={2.5}
          />

          {/* 予算進捗 */}
          <BudgetProgress
            budget={dashboardData.monthlyBudget}
            spent={dashboardData.monthlySpent}
          />

          {/* レベル進捗 */}
          <LevelProgress
            level={dashboardData.currentLevel}
            currentXP={dashboardData.currentXP}
            nextLevelXP={dashboardData.nextLevelXP}
          />

          {/* 支出チャート */}
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>

          {/* 気分トラッカー */}
          <MoodTracker
            currentMood={dashboardData.currentMood}
          />

          {/* クイックアクション */}
          <div className="lg:col-span-3">
            <QuickActions />
          </div>
        </div>

        {/* アラート/通知エリア */}
        <div className="mt-8">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  今月の娯楽費があと¥12,000です
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  賢明な判断を続けています。この調子で！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
