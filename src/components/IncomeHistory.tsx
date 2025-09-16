import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Edit2, Trash2, 
  X, TrendingUp, DollarSign, PieChart, 
  ChevronDown, ChevronUp, Repeat
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Income } from '../hooks/useLocalStorage';

interface IncomeHistoryProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (incomeId: string) => void;
  onClose: () => void;
}

// 収入カテゴリの定義（IncomeInputと同じ）
const incomeCategories = [
  { value: 'salary', label: '給与', icon: '💼', color: '#10b981' },
  { value: 'bonus', label: 'ボーナス', icon: '🎁', color: '#f59e0b' },
  { value: 'freelance', label: '副業', icon: '💻', color: '#8b5cf6' },
  { value: 'gift', label: '贈与', icon: '🎀', color: '#ec4899' },
  { value: 'investment', label: '投資収益', icon: '📈', color: '#3b82f6' },
  { value: 'other', label: 'その他', icon: '📝', color: '#6b7280' },
];

export const IncomeHistory: React.FC<IncomeHistoryProps> = ({
  incomes,
  onEdit,
  onDelete,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // 月のリストを生成
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    incomes.forEach(income => {
      const month = format(parseISO(income.date), 'yyyy-MM');
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  }, [incomes]);

  // フィルタリングとソート
  const filteredIncomes = useMemo(() => {
    let filtered = [...incomes];

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }

    // 月フィルタ
    if (selectedMonth !== 'all') {
      const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
      const monthEnd = endOfMonth(new Date(selectedMonth + '-01'));
      filtered = filtered.filter(i => {
        const incomeDate = parseISO(i.date);
        return incomeDate >= monthStart && incomeDate <= monthEnd;
      });
    }

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ソート
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [incomes, selectedCategory, selectedMonth, searchTerm, sortOrder]);

  // 統計情報の計算
  const statistics = useMemo(() => {
    const total = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const average = filteredIncomes.length > 0 ? total / filteredIncomes.length : 0;
    
    // カテゴリ別集計
    const byCategory = incomeCategories.map(cat => {
      const categoryIncomes = filteredIncomes.filter(i => i.category === cat.value);
      const sum = categoryIncomes.reduce((acc, i) => acc + i.amount, 0);
      return {
        ...cat,
        amount: sum,
        count: categoryIncomes.length,
        percentage: total > 0 ? (sum / total) * 100 : 0
      };
    }).filter(cat => cat.count > 0);

    // 定期収入の集計
    const recurringIncomes = filteredIncomes.filter(i => i.isRecurring);
    const recurringTotal = recurringIncomes.reduce((sum, i) => sum + i.amount, 0);

    return {
      total,
      average,
      count: filteredIncomes.length,
      byCategory,
      recurringTotal,
      recurringCount: recurringIncomes.length
    };
  }, [filteredIncomes]);

  const getCategoryInfo = (category: string) => {
    return incomeCategories.find(c => c.value === category) || incomeCategories[5];
  };

  const handleDelete = (incomeId: string) => {
    if (confirm('この収入記録を削除しますか？')) {
      onDelete(incomeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">収入履歴</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 統計サマリー */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center text-green-600 mb-1">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">合計収入</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{statistics.total.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-blue-600 mb-1">
                <DollarSign size={16} className="mr-1" />
                <span className="text-sm font-medium">平均収入</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{Math.round(statistics.average).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center text-purple-600 mb-1">
                <PieChart size={16} className="mr-1" />
                <span className="text-sm font-medium">記録数</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {statistics.count}件
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center text-orange-600 mb-1">
                <Repeat size={16} className="mr-1" />
                <span className="text-sm font-medium">定期収入</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{statistics.recurringTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                ({statistics.recurringCount}件)
              </p>
            </div>
          </div>

          {/* フィルタ */}
          <div className="space-y-3">
            {/* 検索バー */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* フィルタボタン */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter size={16} className="mr-1" />
              フィルタ
              {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>

            {/* フィルタオプション */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                {/* カテゴリフィルタ */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">カテゴリ</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">すべて</option>
                    {incomeCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* 月フィルタ */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">月</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">すべて</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {format(new Date(month + '-01'), 'yyyy年MM月', { locale: ja })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ソート順 */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">並び順</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="desc">新しい順</option>
                    <option value="asc">古い順</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 収入リスト */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">収入記録がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncomes.map((income) => {
                const categoryInfo = getCategoryInfo(income.category);
                const isExpanded = expandedId === income.id;

                const incomeDate = new Date(income.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // 今日の00:00:00
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1); // 明日の00:00:00
                const isFuture = incomeDate >= tomorrow; // 明日以降なら予定
                
                return (
                  <div
                    key={income.id}
                    className={`border rounded-lg hover:shadow-md transition-shadow ${
                      isFuture 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : income.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{categoryInfo.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {income.description}
                              {isFuture && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  予定
                                </span>
                              )}
                              {income.isRecurring && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  <Repeat size={12} className="mr-1" />
                                  定期
                                </span>
                              )}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {format(parseISO(income.date), 'yyyy年MM月dd日', { locale: ja })}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: categoryInfo.color + '20',
                                  color: categoryInfo.color
                                }}
                              >
                                {categoryInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className="text-2xl font-bold" style={{ color: categoryInfo.color }}>
                            +¥{income.amount.toLocaleString()}
                          </p>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* 展開時のアクション */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(income);
                            }}
                            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 size={14} className="mr-1" />
                            編集
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(income.id);
                            }}
                            className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={14} className="mr-1" />
                            削除
                          </button>
                        </div>
                        {income.isRecurring && income.recurringDay && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>毎月{income.recurringDay}日に支給</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* カテゴリ別サマリー */}
        {statistics.byCategory.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">カテゴリ別収入</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statistics.byCategory.map(cat => (
                <div key={cat.value} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: cat.color }}>
                    ¥{cat.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cat.percentage.toFixed(1)}% ({cat.count}件)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
