import React, { useState } from 'react';
import { Calendar, DollarSign, Tag, FileText, Repeat, X } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Income } from '../hooks/useLocalStorage';

interface IncomeInputProps {
  onSubmit: (income: Omit<Income, 'id'>) => void;
  onClose: () => void;
  editingIncome?: Income;
}

// 収入カテゴリの定義
const incomeCategories = [
  { value: 'salary', label: '給与', icon: '💼', color: '#10b981' },
  { value: 'bonus', label: 'ボーナス', icon: '🎁', color: '#f59e0b' },
  { value: 'freelance', label: '副業', icon: '💻', color: '#8b5cf6' },
  { value: 'gift', label: '贈与', icon: '🎀', color: '#ec4899' },
  { value: 'investment', label: '投資収益', icon: '📈', color: '#3b82f6' },
  { value: 'other', label: 'その他', icon: '📝', color: '#6b7280' },
] as const;

export const IncomeInput: React.FC<IncomeInputProps> = ({ onSubmit, onClose, editingIncome }) => {
  const [date, setDate] = useState(editingIncome?.date || format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState(editingIncome?.amount?.toString() || '');
  const [category, setCategory] = useState<Income['category']>(editingIncome?.category || 'salary');
  const [description, setDescription] = useState(editingIncome?.description || '');
  const [isRecurring, setIsRecurring] = useState(editingIncome?.isRecurring || false);
  const [recurringDay, setRecurringDay] = useState(editingIncome?.recurringDay?.toString() || '25');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // バリデーション
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = '金額を入力してください';
    }
    
    if (!description.trim()) {
      newErrors.description = '説明を入力してください';
    }
    
    if (isRecurring && (!recurringDay || parseInt(recurringDay) < 1 || parseInt(recurringDay) > 31)) {
      newErrors.recurringDay = '1から31の日付を入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // 未来の日付の場合は確認
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      if (!confirm('これは将来の予定収入として記録されます。よろしいですか？')) {
        return;
      }
    }
    
    const incomeData: Omit<Income, 'id'> = {
      date,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      isRecurring,
      ...(isRecurring && { recurringDay: parseInt(recurringDay) })
    };
    
    onSubmit(incomeData);
    
    // フォームをリセット（編集モードでない場合）
    if (!editingIncome) {
      setAmount('');
      setDescription('');
      setIsRecurring(false);
      setRecurringDay('25');
    }
  };

  const selectedCategory = incomeCategories.find(c => c.value === category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingIncome ? '収入を編集' : '収入を記録'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 日付 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* 金額 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 mr-1" />
              金額
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-2 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 mr-1" />
              カテゴリ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {incomeCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value as Income['category'])}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    category === cat.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-1" />
              説明
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: 12月分給与"
              className={`w-full px-4 py-2 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* 定期収入設定 */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                <Repeat className="w-4 h-4 mr-1" />
                定期収入として設定
              </span>
            </label>
            
            {isRecurring && (
              <div className="ml-6">
                <label className="text-sm font-medium text-gray-700">
                  毎月の支給日
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="number"
                    value={recurringDay}
                    onChange={(e) => setRecurringDay(e.target.value)}
                    min="1"
                    max="31"
                    className={`w-20 px-3 py-1 border ${
                      errors.recurringDay ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  <span className="text-sm text-gray-600">日</span>
                </div>
                {errors.recurringDay && (
                  <p className="mt-1 text-sm text-red-600">{errors.recurringDay}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  ※月末の場合は31を入力してください
                </p>
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              {editingIncome ? '更新する' : '記録する'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>

        {/* 未来日付の警告 */}
        {date && (() => {
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return selectedDate >= tomorrow;
        })() && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              これは将来の予定収入として記録されます
            </p>
          </div>
        )}

        {/* 現在選択中のカテゴリ表示 */}
        {selectedCategory && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedCategory.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{selectedCategory.label}</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(date), 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold" style={{ color: selectedCategory.color }}>
                  ¥{amount ? parseInt(amount).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
