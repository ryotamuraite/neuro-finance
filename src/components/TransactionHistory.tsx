import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  TrendingDown,
  Coffee,
  Gamepad2,
  Heart,
  ShoppingBag,
  Sparkles,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Transaction, BudgetCategory } from '../hooks/useLocalStorage';

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: BudgetCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

// 気分の表示用マッピング
const moodLabels: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: '幸せ', emoji: '😊', color: 'text-sage-600' },
  stable: { label: '普通', emoji: '😐', color: 'text-latte-600' },
  tired: { label: '疲れ', emoji: '😔', color: 'text-functional-warning' },
  stressed: { label: 'ストレス', emoji: '😰', color: 'text-functional-danger' },
  anxious: { label: '不安', emoji: '😟', color: 'text-latte-500' }
};

// カテゴリアイコンのマッピング
const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  coffee: Coffee,
  gamepad: Gamepad2,
  heart: Heart,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  dollar: DollarSign
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // カテゴリマップの作成
  const categoryMap = useMemo(() => {
    const map = new Map<string, BudgetCategory>();
    categories.forEach(cat => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // フィルタリングとソート
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // 気分フィルタ
    if (selectedMood !== 'all') {
      filtered = filtered.filter(t => t.mood === selectedMood);
    }

    // 期間フィルタ
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch (selectedPeriod) {
          case 'today':
            return transactionDate >= today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactionDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return transactionDate >= monthAgo;
          }
          case 'three-months': {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return transactionDate >= threeMonthsAgo;
          }
          default:
            return true;
        }
      });
    }

    // ソート（日付順）
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, selectedMood, selectedPeriod, sortOrder]);

  // 統計情報の計算
  const statistics = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = filteredTransactions.length;
    const average = count > 0 ? total / count : 0;

    // カテゴリ別集計
    const byCategory = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // 気分別集計
    const byMood = filteredTransactions.reduce((acc, t) => {
      if (t.mood) {
        acc[t.mood] = (acc[t.mood] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, count, average, byCategory, byMood };
  }, [filteredTransactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-latte-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="absolute inset-x-4 top-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl">
        <div className="h-full bg-white rounded-2xl shadow-soft-xl flex flex-col">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-latte-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-latte-300 to-latte-500 rounded-lg text-white">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-latte-900">支出履歴</h2>
                  <p className="text-sm text-latte-600">
                    {statistics.count}件の記録 • 合計 ¥{statistics.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-latte-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-latte-600" />
              </button>
            </div>
          </div>

          {/* 検索・フィルタエリア */}
          <div className="px-6 py-4 border-b border-latte-100">
            {/* 検索バー */}
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-latte-400" />
                <input
                  type="text"
                  placeholder="説明文で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-latte-50 border border-latte-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-sage-50 border-sage-300 text-sage-700' 
                    : 'bg-latte-50 border-latte-200 text-latte-700 hover:bg-latte-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>フィルタ</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* フィルタオプション */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-latte-50 rounded-lg">
                {/* 期間フィルタ */}
                <div>
                  <label className="text-sm font-medium text-latte-700 mb-1 block">期間</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-latte-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="all">すべて</option>
                    <option value="today">今日</option>
                    <option value="week">過去7日間</option>
                    <option value="month">過去1ヶ月</option>
                    <option value="three-months">過去3ヶ月</option>
                  </select>
                </div>

                {/* カテゴリフィルタ */}
                <div>
                  <label className="text-sm font-medium text-latte-700 mb-1 block">カテゴリ</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-latte-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="all">すべて</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* 気分フィルタ */}
                <div>
                  <label className="text-sm font-medium text-latte-700 mb-1 block">気分</label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-latte-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(moodLabels).map(([key, mood]) => (
                      <option key={key} value={key}>{mood.emoji} {mood.label}</option>
                    ))}
                  </select>
                </div>

                {/* ソート順 */}
                <div>
                  <label className="text-sm font-medium text-latte-700 mb-1 block">並び順</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                    className="w-full px-3 py-2 bg-white border border-latte-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                  >
                    <option value="desc">新しい順</option>
                    <option value="asc">古い順</option>
                  </select>
                </div>
              </div>
            )}

            {/* 統計サマリー */}
            <div className="flex gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-functional-warning" />
                <span className="text-latte-600">平均:</span>
                <span className="font-medium text-latte-900">¥{Math.round(statistics.average).toLocaleString()}</span>
              </div>
              {Object.entries(statistics.byMood).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-latte-600">気分別:</span>
                  {Object.entries(statistics.byMood).slice(0, 3).map(([mood, amount]) => (
                    <span key={mood} className="flex items-center gap-1">
                      <span>{moodLabels[mood]?.emoji}</span>
                      <span className="text-latte-700">¥{Math.round(amount).toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* トランザクションリスト */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-latte-300 mx-auto mb-3" />
                <p className="text-latte-600">
                  {searchTerm || selectedCategory !== 'all' || selectedMood !== 'all' || selectedPeriod !== 'all'
                    ? '条件に一致する記録がありません'
                    : '支出記録がありません'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const category = categoryMap.get(transaction.category);
                  const IconComponent = category ? categoryIcons[category.icon] || ShoppingBag : ShoppingBag;
                  const mood = transaction.mood ? moodLabels[transaction.mood] : null;

                  return (
                    <div
                      key={transaction.id}
                      className="bg-latte-50 rounded-xl p-4 hover:shadow-soft transition-all border border-latte-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* カテゴリアイコン */}
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: category?.color + '20' }}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: category?.color || '#7d6347' }}
                            />
                          </div>

                          {/* 詳細情報 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-latte-900">{transaction.description}</h4>
                              {mood && (
                                <span className={`text-sm ${mood.color}`}>
                                  {mood.emoji}
                                </span>
                              )}
                              {transaction.impulsivity && transaction.impulsivity >= 4 && (
                                <span className="text-xs px-2 py-0.5 bg-functional-warning/20 text-functional-warning rounded-full">
                                  衝動度 {transaction.impulsivity}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-latte-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(transaction.date), 'M月d日(E)', { locale: ja })}
                              </span>
                              <span>{category?.name || 'その他'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 金額とアクション */}
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-latte-900">
                            ¥{transaction.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEdit(transaction)}
                              className="p-1.5 hover:bg-latte-200 rounded-lg transition-colors"
                              title="編集"
                            >
                              <Edit2 className="w-4 h-4 text-latte-600" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('この記録を削除しますか？')) {
                                  onDelete(transaction.id);
                                }
                              }}
                              className="p-1.5 hover:bg-functional-danger/10 rounded-lg transition-colors"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4 text-functional-danger" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
