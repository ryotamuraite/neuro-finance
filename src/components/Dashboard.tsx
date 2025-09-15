import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DataManagement } from './DataManagement';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  AlertCircle,
  Sparkles,
  PiggyBank,
  Heart,
  Coffee,
  ShoppingBag,
  Gamepad2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

// ダミーデータ
const monthlyData = [
  { name: '1月', 収入: 250000, 支出: 180000, 貯蓄: 70000 },
  { name: '2月', 収入: 250000, 支出: 195000, 貯蓄: 55000 },
  { name: '3月', 収入: 250000, 支出: 170000, 貯蓄: 80000 },
  { name: '4月', 収入: 250000, 支出: 160000, 貯蓄: 90000 },
  { name: '5月', 収入: 250000, 支出: 175000, 貯蓄: 75000 },
  { name: '6月', 収入: 250000, 支出: 165000, 貯蓄: 85000 },
];

const spendingCategories = [
  { name: '食費', value: 35000, icon: Coffee, color: '#8884d8', budget: 50000 },
  { name: '娯楽費', value: 25000, icon: Gamepad2, color: '#82ca9d', budget: 30000 },
  { name: 'ストレス発散費', value: 15000, icon: Heart, color: '#ec4899', budget: 20000 },
  { name: '日用品', value: 12000, icon: ShoppingBag, color: '#ffc658', budget: 15000 },
];

const moodData = [
  { mood: '😊 Happy', amount: 15000, color: '#10b981' },
  { mood: '😐 Stable', amount: 45000, color: '#3b82f6' },
  { mood: '😔 Tired', amount: 25000, color: '#f59e0b' },
  { mood: '😰 Stressed', amount: 35000, color: '#ef4444' },
  { mood: '😟 Anxious', amount: 20000, color: '#8b5cf6' },
];

// 予算カテゴリーカード
const BudgetCard: React.FC<{
  category: typeof spendingCategories[0];
}> = ({ category }) => {
  const percentage = (category.value / category.budget) * 100;
  const remaining = category.budget - category.value;
  const Icon = category.icon;
  
  const getStatusColor = (percent: number) => {
    if (percent < 60) return 'text-green-600 bg-green-50';
    if (percent < 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getStatusColor(percentage)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-medium text-gray-900">{category.name}</h3>
        </div>
        <span className={`text-sm font-semibold ${percentage > 80 ? 'text-red-600' : 'text-gray-600'}`}>
          {percentage.toFixed(0)}% 使用
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute h-full rounded-full transition-all duration-500 ${
              percentage > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
              percentage > 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              'bg-gradient-to-r from-green-400 to-green-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            ¥{category.value.toLocaleString()} / ¥{category.budget.toLocaleString()}
          </span>
          <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            残り ¥{Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('今月');
  const { data, isLoading, addTransaction, addXP } = useLocalStorage();
  
  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // 今月の統計
  const currentMonth = monthlyData[monthlyData.length - 1];
  const totalSavings = monthlyData.reduce((sum, month) => sum + month.貯蓄, 0);
  const avgMonthlySpending = monthlyData.reduce((sum, month) => sum + month.支出, 0) / monthlyData.length;
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* ヘッダー */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-xl text-white">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NeuroFinance</h1>
              <p className="text-gray-600">あなたの金銭管理をサポート</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>レベル 5</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 現在の残高 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">現在の残高</span>
            <Wallet className="w-6 h-6 text-blue-200" />
          </div>
          <div className="text-3xl font-bold mb-2">¥425,000</div>
          <div className="flex items-center gap-1 text-sm text-blue-100">
            <TrendingUp className="w-4 h-4" />
            <span>先月比 +12.5%</span>
          </div>
        </div>

        {/* 今月の支出 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">今月の支出</span>
            <TrendingDown className="w-6 h-6 text-purple-200" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{currentMonth.支出.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-purple-100">
            <Target className="w-4 h-4" />
            <span>予算の 78% 使用</span>
          </div>
        </div>

        {/* 貯蓄目標 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">今年の貯蓄</span>
            <PiggyBank className="w-6 h-6 text-green-200" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{totalSavings.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-green-100">
            <Sparkles className="w-4 h-4" />
            <span>目標まで あと ¥150,000</span>
          </div>
        </div>
      </div>

      {/* 予算カテゴリー */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" />
          仮想予算封筒
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spendingCategories.map((category) => (
            <BudgetCard key={category.name} category={category} />
          ))}
        </div>
      </div>

      {/* チャートエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 支出推移グラフ */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月別収支推移</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="収入" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="支出" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 気分と支出の相関 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">気分と支出の関係</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mood" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* アラートエリア */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">今週のインサイト</h3>
                <p className="text-gray-700 text-sm">
                  ストレス時の支出が先週より30%増加しています。リラックスタイムを設けて、衝動買いを防ぎましょう。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* データ管理パネル */}
        <div className="lg:col-span-1">
          <DataManagement />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
