import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage, Transaction, Income } from '../hooks/useLocalStorage';
import { DataManagement } from './DataManagement';
import { TransactionInput } from './TransactionInput';
import { CategoryManager } from './CategoryManager';
import { IncomeSettings } from './IncomeSettings';
import { TransactionHistory } from './TransactionHistory';
import { MonthlyReport } from './MonthlyReport';
import { IncomeInput } from './IncomeInput';
import { IncomeHistory } from './IncomeHistory';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
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
  const { data, isLoading, addTransaction, editTransaction, deleteTransaction, updateCategories, updateIncomeSettings, addIncome, editIncome, deleteIncome, checkAndAddRecurringIncomes } = useLocalStorage();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isIncomeInputModalOpen, setIsIncomeInputModalOpen] = useState(false);
  const [isIncomeHistoryModalOpen, setIsIncomeHistoryModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [recurringIncomeNotification, setRecurringIncomeNotification] = useState<{
    show: boolean;
    count: number;
    totalAmount: number;
  }>({ show: false, count: 0, totalAmount: 0 });
  
  // 定期収入の自動記録チェック
  useEffect(() => {
    if (!isLoading) {
      const addedIncomes = checkAndAddRecurringIncomes();
      if (addedIncomes.length > 0) {
        const totalAmount = addedIncomes.reduce((sum, income) => sum + income.amount, 0);
        setRecurringIncomeNotification({
          show: true,
          count: addedIncomes.length,
          totalAmount
        });
        
        // 5秒後に通知を自動で閉じる
        setTimeout(() => {
          setRecurringIncomeNotification({ show: false, count: 0, totalAmount: 0 });
        }, 5000);
      }
    }
  }, [isLoading, checkAndAddRecurringIncomes]);
  
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
    
    // 今月の収入をフィルタ
    const monthIncomes = (data.incomes || []).filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate.getMonth() === currentMonth && 
             incomeDate.getFullYear() === currentYear;
    });
    
    // 今月の収入合計
    const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
    
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
    
    // 収入カテゴリ別の集計
    const incomeCategoryData = [
      { value: 'salary', label: '給与', icon: '💼', color: '#10b981' },
      { value: 'bonus', label: 'ボーナス', icon: '🎁', color: '#f59e0b' },
      { value: 'freelance', label: '副業', icon: '💻', color: '#8b5cf6' },
      { value: 'gift', label: '贈与', icon: '🎀', color: '#ec4899' },
      { value: 'investment', label: '投資収益', icon: '📈', color: '#3b82f6' },
      { value: 'other', label: 'その他', icon: '📝', color: '#6b7280' },
    ].map(cat => {
      const categoryIncomes = monthIncomes.filter(i => i.category === cat.value);
      const amount = categoryIncomes.reduce((sum, i) => sum + i.amount, 0);
      return {
        ...cat,
        amount,
        count: categoryIncomes.length
      };
    }).filter(cat => cat.amount > 0);
    
    return {
      totalSpent,
      totalIncome,
      categoriesWithSpent,
      incomeCategoryData,
      moodData: moodDataCalculated,
      transactionCount: monthTransactions.length,
      incomeCount: monthIncomes.length,
      actualBalance: totalIncome - totalSpent // 実際の収支バランス
    };
  }, [data.transactions, data.settings.categories, data.incomes]);
  
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
      {/* 定期収入自動記録の通知 */}
      {recurringIncomeNotification.show && (
        <div className="mb-4 p-4 bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-300 rounded-xl shadow-soft animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-500 rounded-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sage-900">
                  定期収入を自動記録しました！
                </p>
                <p className="text-sm text-sage-700">
                  {recurringIncomeNotification.count}件の収入（合計 ¥{recurringIncomeNotification.totalAmount.toLocaleString()}）を記録しました
                </p>
              </div>
            </div>
            <button
              onClick={() => setRecurringIncomeNotification({ show: false, count: 0, totalAmount: 0 })}
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      )}
      
      {/* ヘッダー */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-latte-400 to-latte-600 rounded-xl text-white shadow-soft-md">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-latte-900">NeuroFinance</h1>
              <p className="text-sm text-latte-600">あなたの金銭管理をサポート</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsIncomeInputModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">収入を記録</span>
            </button>
            <button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-functional-warning to-latte-600 text-white rounded-lg shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">支出を記録</span>
            </button>
            <button 
              onClick={() => setIsIncomeHistoryModalOpen(true)}
              className="px-4 py-2 bg-latte-50 rounded-lg shadow-soft border border-latte-200 hover:shadow-soft-md transition-all text-latte-700"
              title="収入履歴"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-4 py-2 bg-latte-50 rounded-lg shadow-soft border border-latte-200 hover:shadow-soft-md transition-all text-latte-700"
              title="支出履歴"
            >
              <TrendingDown className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg shadow-soft hover:shadow-soft-md transition-all flex items-center gap-2"
              title="月次レポート"
            >
              <Sparkles className="w-5 h-5" />
              <span>レポート</span>
            </button>
          </div>
        </div>
      </header>

      {/* Aboutエリア */}
      <div className="mb-8 p-6 bg-gradient-to-br from-latte-100 to-sage-50 rounded-xl border border-latte-300 shadow-soft">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-latte-800 leading-relaxed">
              NeuroFinanceは、ADHD・ASD・双極性障害・不眠症などの神経多様性を持つ方々の金銭管理をサポートするツールです。
              <br className="hidden md:inline" />
              同じ境遇にある方々の資産管理の一助となることを願って開発しています。
            </p>
          </div>
          <div className="flex-shrink-0">
            <a 
              href="https://ofuse.me/ryotamuraite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-latte-50 border-2 border-[#2880a1] rounded-full transition-all hover:shadow-soft-md group"
              title="開発者を応援する"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition-transform fill-[#2880a1]"
                viewBox="0 0 323.86 352.27"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M165.62,216.8c-.76.39-1.6.59-2.43.59s-1.67-.2-2.43-.59l-55.88-28.59-8.79,37.21c0,5.9,4.78,10.68,10.68,10.68h112.86c5.9,0,10.68-4.78,10.68-10.68l-8.79-37.21-55.89,28.59Z"/>
                <path d="M315.29,186.34c-12.86-47.03-34.69-85.88-63.14-112.35-18.47-17.19-39.14-28.83-60.92-34.48,1.98-3.23,4.11-7.58,6.58-13.31,3.81-8.85,6.85-17.54,6.98-17.91,1.13-3.25-.58-6.81-3.84-7.94-3.25-1.13-6.81.58-7.94,3.84-4.67,13.4-9.77,24.61-12.75,29.34-3.22-3.43-8.53-11.09-12.87-18.77-1.11-1.96-3.18-3.17-5.43-3.17h0c-2.25,0-4.32,1.21-5.43,3.17-4.34,7.68-9.65,15.34-12.87,18.77-2.98-4.73-8.08-15.94-12.75-29.34-1.13-3.25-4.69-4.97-7.94-3.84-3.25,1.13-4.97,4.69-3.84,7.94.13.37,3.17,9.06,6.98,17.91,2.29,5.32,4.29,9.45,6.16,12.61-23.16,5.45-44.98,17.66-64.16,36.09-27.56,26.48-48.4,65.09-60.26,111.67-13.53,53.1-9.58,92.45,12.06,120.29,13.59,17.48,33.47,29.54,60.79,36.86,21.49,5.76,47.95,8.56,80.9,8.56,46.27,0,111.45-4.81,143.2-46.41,10.47-13.72,16.7-30.6,18.51-50.17,1.83-19.86-.86-43.19-8.01-69.35ZM161.96,29.92c1.41,2.18,2.73,4.09,3.97,5.76-2.23-.1-4.46-.15-6.7-.12-.39,0-.77.02-1.16.02,1.22-1.65,2.51-3.52,3.89-5.66ZM283.55,289.64c-18.7,24.49-57.45,35.9-121.95,35.9s-101.98-11.15-120.59-35.09c-16.01-20.6-18.46-53.34-7.26-97.29,5.05-19.82,11.83-37.95,20.12-53.99,6.13-8.73,28.06-36.03,58.65-29.76,32.9,6.74,34.42,57.87,34.4,67.62h-31.25c-2.15,0-4.15.64-5.83,1.74l53.35,27.29,53.35-27.29c-1.68-1.1-3.68-1.74-5.83-1.74h-33.7c-.01-9.75,1.5-60.87,34.4-67.62,23.87-4.89,42.46,10.65,52.39,21.87,10.66,17.95,19.34,38.86,25.7,62.11,11.81,43.22,9.81,75.6-5.96,96.26Z"/>
                <circle cx="105.36" cy="151.88" r="11.68" transform="translate(-76.54 118.98) rotate(-45)"/>
                <circle cx="217.38" cy="151.88" r="11.68" transform="translate(-43.73 198.19) rotate(-45)"/>
              </svg>
              <span className="font-semibold text-[#2880a1]">開発を応援する</span>
            </a>
          </div>
        </div>
      </div>

      {/* メインステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 現在の残高 */}
        <div className="bg-gradient-to-br from-latte-300 to-latte-500 rounded-2xl p-6 text-white shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-latte-100">現在の残高</span>
            <Wallet className="w-6 h-6 text-latte-200" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{currentMonthStats.actualBalance.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-latte-100">
            <TrendingUp className="w-4 h-4" />
            <span>今月の収入¥{currentMonthStats.totalIncome.toLocaleString()}</span>
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
            <span>{currentMonthStats.transactionCount}件の支出</span>
          </div>
        </div>

        {/* 今月の収入 */}
        <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-2xl p-6 text-white shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sage-50">今月の収入</span>
            <Leaf className="w-6 h-6 text-sage-100" />
          </div>
          <div className="text-3xl font-bold mb-2">¥{currentMonthStats.totalIncome.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-sage-50">
            <PiggyBank className="w-4 h-4" />
            <span>{currentMonthStats.incomeCount}件の収入</span>
          </div>
        </div>
      </div>

      {/* 収入配分（仮想封筒） */}
      {incomeEnvelopes.total > 0 ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-latte-900 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-latte-600" />
              収入の配分
            </h2>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-3 py-1.5 text-sm bg-latte-50 border border-latte-300 rounded-lg hover:bg-latte-100 transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>収入設定</span>
            </button>
          </div>
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
      ) : (
        /* 収入未設定の場合のガイド */
        <div className="mb-8 p-6 bg-gradient-to-br from-latte-100 to-sage-50 rounded-xl border border-latte-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-soft">
              <Wallet className="w-6 h-6 text-latte-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-latte-900 mb-2">収入設定で、より正確な管理を</h3>
              <p className="text-sm text-latte-700 mb-3">
                月収を設定すると、自動的に貯蓄・固定費・生活費・自由支出に振り分けられ、
                使える金額が明確になります。
              </p>
              <button
                onClick={() => setIsIncomeModalOpen(true)}
                className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>収入を設定する</span>
              </button>
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

      {/* 収入カテゴリ別表示 */}
      {currentMonthStats.incomeCategoryData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-latte-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-sage-600" />
            今月の収入内訳
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentMonthStats.incomeCategoryData.map(cat => (
              <div key={cat.value} className="bg-white rounded-xl p-4 shadow-soft border border-latte-200 hover:shadow-soft-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-latte-900">{cat.label}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: cat.color }}>
                  ¥{cat.amount.toLocaleString()}
                </p>
                <p className="text-xs text-latte-600">
                  {cat.count}件
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
        isOpen={isTransactionModalOpen || editingTransaction !== null}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={(transaction) => {
          if (editingTransaction) {
            editTransaction({ ...transaction, id: editingTransaction.id } as Transaction);
          } else {
            addTransaction(transaction);
          }
          setEditingTransaction(null);
        }}
        categories={data.settings.categories}
        initialData={editingTransaction || undefined}
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
      
      {/* トランザクション履歴モーダル */}
      <TransactionHistory
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={data.transactions}
        categories={data.settings.categories}
        onEdit={(transaction) => {
          setEditingTransaction(transaction);
          setIsHistoryModalOpen(false);
        }}
        onDelete={deleteTransaction}
      />
      
      {/* 月次レポートモーダル */}
      <MonthlyReport
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={data.transactions}
        categories={data.settings.categories}
        monthlyIncome={data.settings.monthlyIncome}
        incomeAllocation={data.settings.incomeAllocation}
      />
      
      {/* 収入入力モーダル */}
      {(isIncomeInputModalOpen || editingIncome !== null) && (
        <IncomeInput
          onClose={() => {
            setIsIncomeInputModalOpen(false);
            setEditingIncome(null);
          }}
          onSubmit={(income) => {
            if (editingIncome) {
              editIncome({ ...income, id: editingIncome.id } as Income);
            } else {
              addIncome(income);
            }
            setEditingIncome(null);
            setIsIncomeInputModalOpen(false);
          }}
          editingIncome={editingIncome || undefined}
        />
      )}
      
      {/* 収入履歴モーダル */}
      {isIncomeHistoryModalOpen && (
        <IncomeHistory
          incomes={data.incomes || []}
          onClose={() => setIsIncomeHistoryModalOpen(false)}
          onEdit={(income) => {
            setEditingIncome(income);
            setIsIncomeHistoryModalOpen(false);
            setIsIncomeInputModalOpen(true);
          }}
          onDelete={deleteIncome}
        />
      )}
    </div>
  );
};

export default Dashboard;
