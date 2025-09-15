import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DataManagement } from './DataManagement';
import { TransactionInput } from './TransactionInput';
import { CategoryManager } from './CategoryManager';
import { IncomeSettings } from './IncomeSettings';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  AlertCircle,
  Sparkles,
  Plus,
  Settings,
  PiggyBank,
  Home,
  Heart,
  Coffee,
  ShoppingBag,
  Gamepad2,
  Leaf
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
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

// 削除: spendingCategoriesとmoodDataは実データから生成するため不要

// 予算カテゴリーカード
interface BudgetCardProps {
  category: {
    name: string;
    value: number;
    icon: React.FC<{ className?: string }>;
    budget: number;
  };
}

const BudgetCard: React.FC<BudgetCardProps> = ({ category }) => {
  const percentage = (category.value / category.budget) * 100;
  const remaining = category.budget - category.value;
  const Icon = category.icon;
  
  const getStatusColor = (percent: number) => {
    if (percent < 60) return 'text-sage-600 bg-sage-50';
    if (percent < 80) return 'text-functional-warning bg-yellow-50';
    return 'text-functional-danger bg-red-50';
  };

  const getProgressColor = (percent: number) => {
    if (percent < 60) return 'from-sage-400 to-sage-500';
    if (percent < 80) return 'from-yellow-400 to-functional-warning';
    return 'from-functional-danger to-red-500';
  };

  return (
    <div className="bg-latte-50 rounded-xl p-4 shadow-soft hover:shadow-soft-md transition-all duration-300 border border-latte-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getStatusColor(percentage)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-medium text-latte-900">{category.name}</h3>
        </div>
        <span className={`text-sm font-semibold ${percentage > 80 ? 'text-functional-danger' : 'text-latte-700'}`}>
          {percentage.toFixed(0)}% 使用
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="relative h-3 bg-latte-200 rounded-full overflow-hidden">
          <div 
            className={`absolute h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getProgressColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-latte-600">
            ¥{category.value.toLocaleString()} / ¥{category.budget.toLocaleString()}
          </span>
          <span className={`font-medium ${remaining < 0 ? 'text-functional-danger' : 'text-sage-600'}`}>
            残り ¥{Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data, isLoading, addTransaction, updateCategories, updateIncomeSettings } = useLocalStorage();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  
  // 実データから統計を計算（Hooksは条件文の前に配置）
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 今月のトランザクションをフィルタ
    const monthTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    // 今月の支出合計
    const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // カテゴリ別の実データ
    const categoriesWithSpent = data.settings.categories.map(cat => {
      const categorySpent = monthTransactions
        .filter(t => t.category === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...cat,
        value: categorySpent,
        icon: cat.icon === 'coffee' ? Coffee : 
              cat.icon === 'gamepad' ? Gamepad2 : 
              cat.icon === 'heart' ? Heart : ShoppingBag,
        budget: cat.budget
      };
    });
    
    // 気分別の支出データ
    const moodSpending = monthTransactions.reduce((acc, t) => {
      const mood = t.mood || 'stable';
      acc[mood] = (acc[mood] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const moodDataCalculated = [
      { mood: '😊 幸せ', amount: moodSpending['happy'] || 0, color: '#a8c69f' },
      { mood: '😐 普通', amount: moodSpending['stable'] || 0, color: '#6b8cae' },
      { mood: '😔 疲れ', amount: moodSpending['tired'] || 0, color: '#daa520' },
      { mood: '😰 ストレス', amount: moodSpending['stressed'] || 0, color: '#c67171' },
      { mood: '😟 不安', amount: moodSpending['anxious'] || 0, color: '#9b8b9b' },
    ];
    
    return {
      totalSpent,
      categoriesWithSpent,
      moodData: moodDataCalculated,
      transactionCount: monthTransactions.length
    };
  }, [data.transactions, data.settings.categories]);
  
  // 収入配分の計算
  const incomeEnvelopes = useMemo(() => {
    const income = data.settings.monthlyIncome || 0;
    const allocation = data.settings.incomeAllocation || {
      savings: 20,
      fixedCosts: 40,
      livingCosts: 25,
      freeMoney: 15
    };
    
    return {
      total: income,
      savings: Math.round((income * allocation.savings) / 100),
      fixedCosts: Math.round((income * allocation.fixedCosts) / 100),
      livingCosts: Math.round((income * allocation.livingCosts) / 100),
      freeMoney: Math.round((income * allocation.freeMoney) / 100),
      remaining: income - currentMonthStats.totalSpent
    };
  }, [data.settings.monthlyIncome, data.settings.incomeAllocation, currentMonthStats.totalSpent]);
  
  // 今月の統計（ダミーデータ）
  const totalSavings = monthlyData.reduce((sum, month) => sum + month.貯蓄, 0);
  
  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto mb-4"></div>
            <p className="text-latte-600">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* ヘッダー */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-4 py-2 bg-latte-50 rounded-lg shadow-soft border border-latte-200 hover:shadow-soft-md transition-all flex items-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline">収入設定</span>
            </button>
            <div className="p-3 bg-gradient-to-br from-latte-400 to-latte-600 rounded-xl text-white shadow-soft-md">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-latte-900">NeuroFinance</h1>
              <p className="text-latte-600">あなたの金銭管理をサポート</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-functional-warning to-latte-600 text-white rounded-lg shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">支出を記録</span>
            </button>
            <button className="px-4 py-2 bg-latte-50 rounded-lg shadow-soft border border-latte-200 hover:shadow-soft-md transition-all text-latte-700">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>レベル {data.level || 5}</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 現在の残高 */}
        <div className="bg-gradient-to-br from-latte-300 to-latte-500 rounded-2xl p-6 text-white shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-latte-100">現在の残高</span>
            <Wallet className="w-6 h-6 text-latte-200" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{incomeEnvelopes.remaining.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-latte-100">
            <TrendingUp className="w-4 h-4" />
            <span>月収¥{incomeEnvelopes.total.toLocaleString()}</span>
          </div>
        </div>

        {/* 今月の支出 */}
        <div className="bg-gradient-to-br from-functional-warning to-latte-600 rounded-2xl p-6 text-white shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-50">今月の支出</span>
            <TrendingDown className="w-6 h-6 text-yellow-100" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{currentMonthStats.totalSpent.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-yellow-50">
            <Target className="w-4 h-4" />
            <span>予算の {incomeEnvelopes.total > 0 ? Math.round((currentMonthStats.totalSpent / incomeEnvelopes.total) * 100) : 0}% 使用</span>
          </div>
        </div>

        {/* 貯蓄目標 */}
        <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl p-6 text-white shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sage-50">今年の貯蓄</span>
            <Leaf className="w-6 h-6 text-sage-100" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{incomeEnvelopes.savings.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-sage-50">
            <PiggyBank className="w-4 h-4" />
            <span>月収の{data.settings.incomeAllocation?.savings || 20}%を自動貯蓄</span>
          </div>
        </div>
      </div>

      {/* 収入配分（仮想封筒） */}
      {incomeEnvelopes.total > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-latte-900 mb-4 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-latte-600" />
            収入の配分
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-sage-50 rounded-xl p-4 border border-sage-200">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-sage-600" />
                <span className="font-medium text-latte-900">先取り貯蓄</span>
              </div>
              <div className="text-2xl font-bold text-sage-600">
                ¥{incomeEnvelopes.savings.toLocaleString()}
              </div>
            </div>
            <div className="bg-latte-100 rounded-xl p-4 border border-latte-300">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-latte-700" />
                <span className="font-medium text-latte-900">固定費</span>
              </div>
              <div className="text-2xl font-bold text-latte-700">
                ¥{incomeEnvelopes.fixedCosts.toLocaleString()}
              </div>
            </div>
            <div className="bg-functional-info/10 rounded-xl p-4 border border-functional-info/30">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-functional-info" />
                <span className="font-medium text-latte-900">生活費</span>
              </div>
              <div className="text-2xl font-bold text-functional-info">
                ¥{incomeEnvelopes.livingCosts.toLocaleString()}
              </div>
            </div>
            <div className="bg-functional-warning/10 rounded-xl p-4 border border-functional-warning/30">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-functional-warning" />
                <span className="font-medium text-latte-900">自由支出</span>
              </div>
              <div className="text-2xl font-bold text-functional-warning">
                ¥{incomeEnvelopes.freeMoney.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 予算カテゴリー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-latte-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-sage-600" />
            仮想予算封筒
          </h2>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-1.5 text-sm bg-latte-50 border border-latte-300 rounded-lg hover:bg-latte-100 transition-all flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>カテゴリ編集</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentMonthStats.categoriesWithSpent.map((category) => (
            <BudgetCard key={category.name} category={category} />
          ))}
        </div>
      </div>

      {/* チャートエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 支出推移グラフ */}
        <div className="bg-latte-50 rounded-xl p-6 shadow-soft border border-latte-200">
          <h3 className="text-lg font-semibold text-latte-900 mb-4">月別収支推移</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
              <XAxis dataKey="name" tick={{ fill: '#7d6347' }} />
              <YAxis tick={{ fill: '#7d6347' }} />
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  backgroundColor: '#fdfbf7'
                }}
              />
              <Area type="monotone" dataKey="収入" stackId="1" stroke="#5e8e56" fill="#5e8e56" fillOpacity={0.6} />
              <Area type="monotone" dataKey="支出" stackId="2" stroke="#c67171" fill="#c67171" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 気分と支出の相関 */}
        <div className="bg-latte-50 rounded-xl p-6 shadow-soft border border-latte-200">
          <h3 className="text-lg font-semibold text-latte-900 mb-4">気分と支出の関係</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={currentMonthStats.moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
              <XAxis dataKey="mood" tick={{ fill: '#7d6347' }} />
              <YAxis tick={{ fill: '#7d6347' }} />
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  backgroundColor: '#fdfbf7'
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {currentMonthStats.moodData.map((entry, index) => (
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
          <div className="bg-gradient-to-r from-sage-50 to-latte-100 rounded-xl p-4 border border-sage-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-functional-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-latte-900 mb-1">今週のインサイト</h3>
                <p className="text-latte-700 text-sm">
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
      
      {/* トランザクション入力モーダル */}
      <TransactionInput 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={(transaction) => {
          addTransaction(transaction);
          // 成功メッセージ（後で実装）
        }}
        categories={data.settings.categories}
      />
      
      {/* カテゴリ管理モーダル */}
      <CategoryManager
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={data.settings.categories}
        onUpdate={updateCategories}
      />
      
      {/* 収入設定モーダル */}
      <IncomeSettings
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        monthlyIncome={data.settings.monthlyIncome || 0}
        incomeAllocation={data.settings.incomeAllocation || {
          savings: 20,
          fixedCosts: 40,
          livingCosts: 25,
          freeMoney: 15
        }}
        onUpdate={updateIncomeSettings}
      />
    </div>
  );
};

export default Dashboard;
