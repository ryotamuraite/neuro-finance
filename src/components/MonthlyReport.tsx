import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  AlertCircle,
  Target,
  Brain,
  Zap,
  Coffee,
  Gamepad2,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { 
  PieChart as RechartsPC, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction, BudgetCategory } from '../hooks/useLocalStorage';

interface MonthlyReportProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: BudgetCategory[];
  monthlyIncome?: number;
  incomeAllocation?: {
    savings: number;
    fixedCosts: number;
    livingCosts: number;
    freeMoney: number;
  };
}

// カテゴリアイコンのマッピング
const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  coffee: Coffee,
  gamepad: Gamepad2,
  heart: Heart,
  'shopping-bag': ShoppingBag
};

// 気分のラベルと色
const moodInfo: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: '幸せ', emoji: '😊', color: '#a8c69f' },
  stable: { label: '普通', emoji: '😐', color: '#6b8cae' },
  tired: { label: '疲れ', emoji: '😔', color: '#daa520' },
  stressed: { label: 'ストレス', emoji: '😰', color: '#c67171' },
  anxious: { label: '不安', emoji: '😟', color: '#9b8b9b' }
};

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  monthlyIncome = 0,
  incomeAllocation
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // カテゴリマップの作成
  const categoryMap = useMemo(() => {
    const map = new Map<string, BudgetCategory>();
    categories.forEach(cat => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // 選択月のデータ分析
  const monthlyAnalysis = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    // 今月のトランザクション
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });

    // 前月のトランザクション
    const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));
    const prevMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    // 基本統計
    const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const prevMonthTotal = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averagePerDay = totalSpent / new Date(monthEnd).getDate();
    const transactionCount = currentMonthTransactions.length;

    // カテゴリ別集計
    const categoryBreakdown = categories.map(cat => {
      const amount = currentMonthTransactions
        .filter(t => t.category === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const prevAmount = prevMonthTransactions
        .filter(t => t.category === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: cat.id,
        name: cat.name,
        amount,
        prevAmount,
        budget: cat.budget,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        budgetUsage: cat.budget > 0 ? (amount / cat.budget) * 100 : 0,
        change: prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0,
        color: cat.color
      };
    }).filter(cat => cat.amount > 0);

    // 気分別集計
    const moodBreakdown = Object.entries(moodInfo).map(([key, info]) => {
      const amount = currentMonthTransactions
        .filter(t => t.mood === key)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const count = currentMonthTransactions.filter(t => t.mood === key).length;
      
      return {
        mood: key,
        label: info.label,
        emoji: info.emoji,
        amount,
        count,
        color: info.color,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      };
    }).filter(m => m.amount > 0);

    // 衝動度分析
    const impulsivityAnalysis = currentMonthTransactions
      .filter(t => t.impulsivity !== undefined)
      .reduce((acc, t) => {
        const level = t.impulsivity || 3;
        if (!acc[level]) {
          acc[level] = { count: 0, amount: 0 };
        }
        acc[level].count++;
        acc[level].amount += t.amount;
        return acc;
      }, {} as Record<number, { count: number; amount: number }>);

    // 日別推移
    const dailyTrend = [];
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dayTransactions = currentMonthTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getDate() === d.getDate();
      });
      
      dailyTrend.push({
        date: d.getDate(),
        amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      });
    }

    // 週別集計
    const weeklyBreakdown = [0, 0, 0, 0, 0].map((_, weekIndex) => {
      const weekStart = weekIndex * 7 + 1;
      const weekEnd = Math.min(weekStart + 6, new Date(monthEnd).getDate());
      
      const weekTransactions = currentMonthTransactions.filter(t => {
        const day = new Date(t.date).getDate();
        return day >= weekStart && day <= weekEnd;
      });

      return {
        week: `第${weekIndex + 1}週`,
        amount: weekTransactions.reduce((sum, t) => sum + t.amount, 0),
        count: weekTransactions.length
      };
    }).filter(w => w.amount > 0);

    return {
      totalSpent,
      prevMonthTotal,
      changeFromPrevMonth: prevMonthTotal > 0 ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100 : 0,
      averagePerDay,
      transactionCount,
      categoryBreakdown,
      moodBreakdown,
      impulsivityAnalysis,
      dailyTrend,
      weeklyBreakdown,
      remainingBudget: monthlyIncome - totalSpent,
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / monthlyIncome) * 100 : 0
    };
  }, [selectedMonth, transactions, categories, monthlyIncome]);

  // 前月・次月への移動
  const handlePrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-latte-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12">
        <div className="h-full bg-white rounded-2xl shadow-soft-xl flex flex-col">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-latte-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-latte-900">月次レポート</h2>
                  <p className="text-sm text-latte-600">詳細な支出分析と傾向</p>
                </div>
              </div>
              
              {/* 月選択 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-latte-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-latte-600" />
                </button>
                <div className="px-4 py-2 bg-latte-50 rounded-lg min-w-[140px] text-center">
                  <span className="font-medium text-latte-900">
                    {format(selectedMonth, 'yyyy年M月', { locale: ja })}
                  </span>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-latte-100 rounded-lg transition-colors"
                  disabled={selectedMonth >= new Date()}
                >
                  <ChevronRight className="w-5 h-5 text-latte-600" />
                </button>
                <button
                  onClick={onClose}
                  className="ml-4 p-2 hover:bg-latte-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-latte-600" />
                </button>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* 総支出 */}
              <div className="bg-gradient-to-br from-latte-300 to-latte-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-latte-100 text-sm">総支出</span>
                  <TrendingDown className="w-5 h-5 text-latte-200" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  ¥{monthlyAnalysis.totalSpent.toLocaleString()}
                </div>
                <div className="text-xs text-latte-100 flex items-center gap-1">
                  {monthlyAnalysis.changeFromPrevMonth > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    前月比 {monthlyAnalysis.changeFromPrevMonth > 0 ? '+' : ''}
                    {monthlyAnalysis.changeFromPrevMonth.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 残予算 */}
              <div className={`rounded-xl p-4 ${
                monthlyAnalysis.remainingBudget >= 0 
                  ? 'bg-gradient-to-br from-sage-400 to-sage-600 text-white'
                  : 'bg-gradient-to-br from-functional-danger to-red-600 text-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-opacity-90 text-sm">残予算</span>
                  <Target className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  ¥{Math.abs(monthlyAnalysis.remainingBudget).toLocaleString()}
                </div>
                <div className="text-xs opacity-90">
                  {monthlyAnalysis.remainingBudget >= 0 ? '予算内' : '予算超過'}
                </div>
              </div>

              {/* 平均支出/日 */}
              <div className="bg-gradient-to-br from-functional-info to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm">日平均</span>
                  <Calendar className="w-5 h-5 text-blue-200" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  ¥{Math.round(monthlyAnalysis.averagePerDay).toLocaleString()}
                </div>
                <div className="text-xs text-blue-100">
                  {monthlyAnalysis.transactionCount}件の記録
                </div>
              </div>

              {/* 貯蓄率 */}
              <div className="bg-gradient-to-br from-functional-warning to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-100 text-sm">貯蓄率</span>
                  <Zap className="w-5 h-5 text-yellow-200" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {monthlyAnalysis.savingsRate.toFixed(1)}%
                </div>
                <div className="text-xs text-yellow-100">
                  目標: {incomeAllocation?.savings || 20}%
                </div>
              </div>
            </div>

            {/* グラフエリア */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* カテゴリ別円グラフ */}
              <div className="bg-latte-50 rounded-xl p-4 border border-latte-200">
                <h3 className="font-semibold text-latte-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-sage-600" />
                  カテゴリ別支出割合
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPC>
                    <Pie
                      data={monthlyAnalysis.categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    >
                      {monthlyAnalysis.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                  </RechartsPC>
                </ResponsiveContainer>
              </div>

              {/* 気分別棒グラフ */}
              <div className="bg-latte-50 rounded-xl p-4 border border-latte-200">
                <h3 className="font-semibold text-latte-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-sage-600" />
                  気分別支出
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyAnalysis.moodBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                    <XAxis 
                      dataKey="emoji" 
                      tick={{ fill: '#7d6347' }}
                    />
                    <YAxis tick={{ fill: '#7d6347' }} />
                    <Tooltip 
                      formatter={(value: number) => `¥${value.toLocaleString()}`}
                      labelFormatter={(label) => {
                        const mood = monthlyAnalysis.moodBreakdown.find(m => m.emoji === label);
                        return mood ? mood.label : label;
                      }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {monthlyAnalysis.moodBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 日別推移グラフ */}
            <div className="bg-latte-50 rounded-xl p-4 border border-latte-200 mb-6">
              <h3 className="font-semibold text-latte-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sage-600" />
                日別支出推移
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyAnalysis.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                  <XAxis dataKey="date" tick={{ fill: '#7d6347' }} />
                  <YAxis tick={{ fill: '#7d6347' }} />
                  <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#5e8e56" 
                    strokeWidth={2}
                    dot={{ fill: '#5e8e56' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* カテゴリ別詳細 */}
            <div className="bg-latte-50 rounded-xl p-4 border border-latte-200">
              <h3 className="font-semibold text-latte-900 mb-4">カテゴリ別詳細</h3>
              <div className="space-y-3">
                {monthlyAnalysis.categoryBreakdown.map(cat => {
                  const category = categoryMap.get(cat.id);
                  const Icon = category ? categoryIcons[category.icon] || ShoppingBag : ShoppingBag;
                  
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: cat.color + '20' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <div className="font-medium text-latte-900">{cat.name}</div>
                          <div className="text-sm text-latte-600">
                            予算使用率: {cat.budgetUsage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-latte-900">
                          ¥{cat.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-latte-600">
                          {cat.change !== 0 && (
                            <span className={cat.change > 0 ? 'text-functional-danger' : 'text-sage-600'}>
                              {cat.change > 0 ? '↑' : '↓'} {Math.abs(cat.change).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 衝動度分析 */}
            {Object.keys(monthlyAnalysis.impulsivityAnalysis).length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-sage-50 to-latte-100 rounded-xl border border-sage-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-latte-900 mb-2">衝動買い分析</h4>
                    <div className="text-sm text-latte-700">
                      {Object.entries(monthlyAnalysis.impulsivityAnalysis)
                        .filter(([level]) => parseInt(level) >= 4)
                        .reduce((sum, [, data]) => sum + data.amount, 0) > 0 && (
                        <p>
                          衝動度4以上の支出: ¥
                          {Object.entries(monthlyAnalysis.impulsivityAnalysis)
                            .filter(([level]) => parseInt(level) >= 4)
                            .reduce((sum, [, data]) => sum + data.amount, 0)
                            .toLocaleString()}
                          （
                          {Object.entries(monthlyAnalysis.impulsivityAnalysis)
                            .filter(([level]) => parseInt(level) >= 4)
                            .reduce((sum, [, data]) => sum + data.count, 0)}
                          件）
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-6 py-4 border-t border-latte-200 flex justify-end">
            <button
              onClick={() => {
                // TODO: PDF出力機能の実装
                alert('PDF出力機能は準備中です');
              }}
              className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDFで保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
