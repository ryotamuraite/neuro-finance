import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2,
  Coffee, 
  Gamepad2, 
  Heart, 
  ShoppingBag,
  Music,
  Book,
  Car,
  Home,
  Utensils,
  Gift,
  Briefcase,
  Sparkles,
  Palette,
  Film,
  Camera,
  Plane,
  Monitor,
  Smartphone,
  Package,
  Zap
} from 'lucide-react';
import { BudgetCategory } from '../hooks/useLocalStorage';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onUpdate: (categories: BudgetCategory[]) => void;
}

// 利用可能なアイコン
const AVAILABLE_ICONS = [
  { name: 'coffee', Icon: Coffee, label: '飲食' },
  { name: 'gamepad', Icon: Gamepad2, label: 'ゲーム' },
  { name: 'heart', Icon: Heart, label: 'ヘルスケア' },
  { name: 'shopping-bag', Icon: ShoppingBag, label: '買い物' },
  { name: 'music', Icon: Music, label: '音楽' },
  { name: 'book', Icon: Book, label: '書籍' },
  { name: 'car', Icon: Car, label: '交通' },
  { name: 'home', Icon: Home, label: '住居' },
  { name: 'utensils', Icon: Utensils, label: '外食' },
  { name: 'gift', Icon: Gift, label: 'プレゼント' },
  { name: 'briefcase', Icon: Briefcase, label: '仕事' },
  { name: 'sparkles', Icon: Sparkles, label: '推し活' },
  { name: 'palette', Icon: Palette, label: '創作' },
  { name: 'film', Icon: Film, label: '映画' },
  { name: 'camera', Icon: Camera, label: '写真' },
  { name: 'plane', Icon: Plane, label: '旅行' },
  { name: 'monitor', Icon: Monitor, label: 'PC関連' },
  { name: 'smartphone', Icon: Smartphone, label: 'モバイル' },
  { name: 'package', Icon: Package, label: 'サブスク' },
  { name: 'zap', Icon: Zap, label: '光熱費' },
];

// 利用可能な色（カフェラテカラーパレット）
const AVAILABLE_COLORS = [
  { value: '#b89968', label: 'エスプレッソ' },
  { value: '#7fa877', label: 'セージ' },
  { value: '#c67171', label: 'テラコッタ' },
  { value: '#daa520', label: 'ゴールデン' },
  { value: '#6b8cae', label: 'スモーキーブルー' },
  { value: '#9b8b9b', label: 'グレージュ' },
  { value: '#d4a574', label: 'キャラメル' },
  { value: '#8b7355', label: 'モカ' },
  { value: '#a68b5b', label: 'ヘーゼルナッツ' },
  { value: '#967969', label: 'ココア' },
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdate
}) => {
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // 新規カテゴリのデフォルト値
  const [newCategory, setNewCategory] = useState<Partial<BudgetCategory>>({
    name: '',
    icon: 'shopping-bag',
    budget: 10000,
    color: '#b89968',
    spent: 0
  });

  const handleSaveCategory = () => {
    if (editingCategory) {
      // 編集の場合
      const updated = categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      );
      onUpdate(updated);
      setEditingCategory(null);
    } else if (isAdding && newCategory.name) {
      // 新規追加の場合
      const newCat: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        icon: newCategory.icon || 'shopping-bag',
        budget: newCategory.budget || 10000,
        color: newCategory.color || '#b89968',
        spent: 0
      };
      onUpdate([...categories, newCat]);
      setIsAdding(false);
      setNewCategory({
        name: '',
        icon: 'shopping-bag',
        budget: 10000,
        color: '#b89968',
        spent: 0
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('このカテゴリを削除しますか？\n関連する支出記録も影響を受ける可能性があります。')) {
      onUpdate(categories.filter(cat => cat.id !== id));
    }
  };

  const currentEditCategory = editingCategory || (isAdding ? newCategory : null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-latte-900/50 backdrop-blur-sm">
      <div className="bg-latte-50 rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-latte-50 border-b border-latte-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg text-white">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-latte-900">カテゴリ管理</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-latte-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-latte-600" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* 既存カテゴリリスト */}
          <div className="space-y-3 mb-4">
            {categories.map((category) => {
              const IconComponent = AVAILABLE_ICONS.find(i => i.name === category.icon)?.Icon || ShoppingBag;
              const isEditing = editingCategory?.id === category.id;
              
              return (
                <div
                  key={category.id}
                  className={`p-4 bg-white rounded-lg border-2 transition-all ${
                    isEditing ? 'border-sage-400' : 'border-latte-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-latte-900">{category.name}</h3>
                        <p className="text-sm text-latte-600">
                          予算: ¥{category.budget.toLocaleString()} 
                          {category.spent > 0 && (
                            <span className="ml-2 text-latte-500">
                              (使用: ¥{category.spent.toLocaleString()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2 text-latte-600 hover:bg-latte-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-functional-danger hover:bg-red-50 rounded-lg transition-colors"
                        disabled={categories.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 新規追加ボタン */}
          {!isAdding && !editingCategory && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full p-4 border-2 border-dashed border-latte-300 rounded-lg hover:border-sage-400 hover:bg-sage-50 transition-all flex items-center justify-center gap-2 text-latte-700"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">新しいカテゴリを追加</span>
            </button>
          )}

          {/* 編集/新規追加フォーム */}
          {(editingCategory || isAdding) && currentEditCategory && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-sage-400">
              <h3 className="font-medium text-latte-900 mb-4">
                {editingCategory ? 'カテゴリを編集' : '新しいカテゴリ'}
              </h3>
              
              {/* カテゴリ名 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-latte-700 mb-2">
                  カテゴリ名
                </label>
                <input
                  type="text"
                  value={currentEditCategory.name || ''}
                  onChange={(e) => {
                    if (editingCategory) {
                      setEditingCategory({ ...editingCategory, name: e.target.value });
                    } else {
                      setNewCategory({ ...newCategory, name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400"
                  placeholder="例：ゲーム課金、推し活"
                />
              </div>

              {/* 予算額 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-latte-700 mb-2">
                  月間予算
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-latte-600">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={currentEditCategory.budget || 10000}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingCategory) {
                        setEditingCategory({ ...editingCategory, budget: value });
                      } else {
                        setNewCategory({ ...newCategory, budget: value });
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* アイコン選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-latte-700 mb-2">
                  アイコン
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map(({ name, Icon, label }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        if (editingCategory) {
                          setEditingCategory({ ...editingCategory, icon: name });
                        } else {
                          setNewCategory({ ...newCategory, icon: name });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        currentEditCategory.icon === name
                          ? 'border-sage-400 bg-sage-50'
                          : 'border-latte-200 hover:border-latte-300'
                      }`}
                      title={label}
                    >
                      <Icon className="w-5 h-5 text-latte-700" />
                      <span className="text-xs text-latte-600">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 色選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-latte-700 mb-2">
                  カラー
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (editingCategory) {
                          setEditingCategory({ ...editingCategory, color: value });
                        } else {
                          setNewCategory({ ...newCategory, color: value });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentEditCategory.color === value
                          ? 'border-sage-400 ring-2 ring-sage-200'
                          : 'border-latte-200 hover:border-latte-300'
                      }`}
                      title={label}
                    >
                      <div 
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: value }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsAdding(false);
                    setNewCategory({
                      name: '',
                      icon: 'shopping-bag',
                      budget: 10000,
                      color: '#b89968',
                      spent: 0
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-latte-300 text-latte-700 rounded-lg hover:bg-latte-100 transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveCategory}
                  disabled={!currentEditCategory.name}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg hover:shadow-soft-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
