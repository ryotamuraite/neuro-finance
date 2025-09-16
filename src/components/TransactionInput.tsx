import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Coffee, 
  Gamepad2, 
  Heart, 
  ShoppingBag,
  TrendingDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../hooks/useLocalStorage';

interface TransactionInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    budget: number;
    spent: number;
  }>;
  initialData?: Transaction;
}

// 気分の選択肢
const MOODS = [
  { value: 'happy', label: '😊 幸せ', color: 'bg-sage-100 border-sage-400' },
  { value: 'stable', label: '😐 普通', color: 'bg-functional-info/10 border-functional-info' },
  { value: 'tired', label: '😔 疲れ', color: 'bg-functional-warning/10 border-functional-warning' },
  { value: 'stressed', label: '😰 ストレス', color: 'bg-functional-danger/10 border-functional-danger' },
  { value: 'anxious', label: '😟 不安', color: 'bg-latte-200 border-latte-500' },
];

// 衝動度のラベル
const IMPULSIVITY_LABELS = [
  '計画的',      // 1
  'やや計画的',  // 2
  '普通',        // 3
  'やや衝動的',  // 4
  '衝動的'       // 5
];

// カテゴリアイコンのマッピング
const CATEGORY_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
  'coffee': Coffee,
  'gamepad': Gamepad2,
  'heart': Heart,
  'shopping-bag': ShoppingBag,
};

export const TransactionInput: React.FC<TransactionInputProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('stable');
  const [impulsivity, setImpulsivity] = useState<number>(3);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 編集モードの場合、初期値を設定
  useEffect(() => {
    if (initialData && isOpen) {
      setAmount(initialData.amount.toString());
      setSelectedCategory(initialData.category);
      setDescription(initialData.description || '');
      setSelectedMood(initialData.mood || 'stable');
      setImpulsivity(initialData.impulsivity || 3);
      setTransactionDate(initialData.date.split('T')[0]);
    } else if (!initialData && isOpen) {
      // 新規作成時はリセット
      setAmount('');
      setSelectedCategory(categories[0]?.id || '');
      setDescription('');
      setSelectedMood('stable');
      setImpulsivity(3);
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, categories, isOpen]);

  // 衝動度が高い場合の警告
  React.useEffect(() => {
    if (impulsivity >= 4 && amount && parseInt(amount) > 5000) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [impulsivity, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedCategory) {
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      date: new Date(transactionDate).toISOString(),
      amount: parseInt(amount),
      category: selectedCategory,
      description,
      mood: selectedMood,
      impulsivity
    };

    onSubmit(transaction);
    
    // フォームをリセット
    setAmount('');
    setDescription('');
    setSelectedMood('stable');
    setImpulsivity(3);
    onClose();
  };

  const handleCancel = () => {
    // フォームをリセット
    setAmount('');
    setDescription('');
    setSelectedMood('stable');
    setImpulsivity(3);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-latte-900/50 backdrop-blur-sm">
      <div className="bg-latte-50 rounded-2xl shadow-soft-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-latte-50 border-b border-latte-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-latte-400 to-latte-600 rounded-lg text-white">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-latte-900">
                {initialData ? '支出を編集' : '支出を記録'}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-latte-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-latte-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 金額入力 */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              金額 <span className="text-functional-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-latte-600 font-semibold">
                ¥
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-3 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all text-lg font-semibold text-latte-900"
                placeholder="0"
                required
                min="1"
                autoFocus
              />
            </div>
          </div>

          {/* 日付入力 */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              日付
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              カテゴリ <span className="text-functional-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.icon] || ShoppingBag;
                const isSelected = selectedCategory === category.id;
                const remainingBudget = category.budget - category.spent;
                const isOverBudget = remainingBudget < parseInt(amount || '0');
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-sage-500 bg-sage-50' 
                        : 'border-latte-300 bg-white hover:border-latte-400'
                      }
                      ${isOverBudget && isSelected ? 'ring-2 ring-functional-danger ring-opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-sage-600' : 'text-latte-600'}`} />
                      <span className={`font-medium ${isSelected ? 'text-sage-700' : 'text-latte-700'}`}>
                        {category.name}
                      </span>
                    </div>
                    <div className="text-xs text-latte-500 mt-1">
                      残り ¥{remainingBudget.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 説明（オプション） */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              メモ（任意）
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all"
              placeholder="例：ランチ、コンビニ"
            />
          </div>

          {/* 気分選択 */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              今の気分は？
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
                    ${selectedMood === mood.value 
                      ? `${mood.color} border-opacity-100` 
                      : 'bg-white border-latte-300 hover:border-latte-400'
                    }
                  `}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* 衝動度スライダー */}
          <div>
            <label className="block text-sm font-medium text-latte-700 mb-2">
              衝動度：
              <span className={`ml-2 font-bold ${
                impulsivity <= 2 ? 'text-sage-600' : 
                impulsivity === 3 ? 'text-latte-700' : 
                'text-functional-warning'
              }`}>
                {IMPULSIVITY_LABELS[impulsivity - 1]}
              </span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="5"
                value={impulsivity}
                onChange={(e) => setImpulsivity(parseInt(e.target.value))}
                className="w-full h-2 bg-latte-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #a8c69f 0%, #a8c69f ${(impulsivity - 1) * 25}%, #e8dcc8 ${(impulsivity - 1) * 25}%, #e8dcc8 100%)`
                }}
              />
              <div className="flex justify-between mt-1 text-xs text-latte-500">
                <span>計画的</span>
                <span>衝動的</span>
              </div>
            </div>
          </div>

          {/* 警告メッセージ */}
          {showWarning && (
            <div className="p-3 bg-functional-warning/10 border border-functional-warning rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-functional-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-latte-800">
                  <p className="font-semibold mb-1">衝動買いの可能性があります</p>
                  <p>この買い物は本当に必要ですか？24時間待ってから再度検討することをお勧めします。</p>
                </div>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-white border border-latte-300 text-latte-700 rounded-lg font-medium hover:bg-latte-100 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg font-medium hover:shadow-soft-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {initialData ? '更新する' : '記録する'}
            </button>
          </div>

          {/* XP獲得の説明 */}
          <div className="text-center text-xs text-latte-500">
            <Sparkles className="w-4 h-4 inline mr-1" />
            記録すると10XPを獲得できます
          </div>
        </form>
      </div>
    </div>
  );
};
