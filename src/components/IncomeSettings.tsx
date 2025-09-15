import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet,
  TrendingUp,
  PiggyBank,
  Home,
  ShoppingBag,
  Gamepad2,
  AlertCircle,
  Info
} from 'lucide-react';

interface IncomeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  incomeAllocation: IncomeAllocation;
  onUpdate: (income: number, allocation: IncomeAllocation) => void;
}

export interface IncomeAllocation {
  savings: number;      // 貯蓄率（%）
  fixedCosts: number;   // 固定費率（%）
  livingCosts: number;  // 生活費率（%）
  freeMoney: number;    // 自由支出率（%）
}

// デフォルトの配分
const DEFAULT_ALLOCATION: IncomeAllocation = {
  savings: 20,
  fixedCosts: 40,
  livingCosts: 25,
  freeMoney: 15
};

// 配分プリセット
const ALLOCATION_PRESETS = [
  { 
    name: '堅実型', 
    description: '貯蓄重視の安定志向',
    allocation: { savings: 30, fixedCosts: 35, livingCosts: 25, freeMoney: 10 } 
  },
  { 
    name: 'バランス型', 
    description: '貯蓄と生活の両立',
    allocation: { savings: 20, fixedCosts: 40, livingCosts: 25, freeMoney: 15 } 
  },
  { 
    name: '生活重視型', 
    description: '現在の生活を優先',
    allocation: { savings: 10, fixedCosts: 40, livingCosts: 30, freeMoney: 20 } 
  },
  { 
    name: '再建型', 
    description: '借金返済・生活再建向け',
    allocation: { savings: 5, fixedCosts: 50, livingCosts: 35, freeMoney: 10 } 
  }
];

export const IncomeSettings: React.FC<IncomeSettingsProps> = ({
  isOpen,
  onClose,
  monthlyIncome,
  incomeAllocation,
  onUpdate
}) => {
  const [income, setIncome] = useState(monthlyIncome || 0);
  const [allocation, setAllocation] = useState<IncomeAllocation>(
    incomeAllocation || DEFAULT_ALLOCATION
  );
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // 合計が100%になるように調整
  useEffect(() => {
    const total = allocation.savings + allocation.fixedCosts + 
                  allocation.livingCosts + allocation.freeMoney;
    
    if (total !== 100 && total > 0) {
      const ratio = 100 / total;
      setAllocation({
        savings: Math.round(allocation.savings * ratio),
        fixedCosts: Math.round(allocation.fixedCosts * ratio),
        livingCosts: Math.round(allocation.livingCosts * ratio),
        freeMoney: Math.round(allocation.freeMoney * ratio)
      });
    }
  }, []);

  const handleAllocationChange = (key: keyof IncomeAllocation, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    const newAllocation = { ...allocation, [key]: newValue };
    
    // 合計を100%に調整
    const total = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
    if (total > 100) {
      // 他の項目を比例的に減らす
      const excess = total - 100;
      const otherKeys = Object.keys(newAllocation).filter(k => k !== key) as (keyof IncomeAllocation)[];
      const otherTotal = otherKeys.reduce((sum, k) => sum + newAllocation[k], 0);
      
      if (otherTotal > 0) {
        otherKeys.forEach(k => {
          newAllocation[k] = Math.round(newAllocation[k] - (newAllocation[k] / otherTotal) * excess);
        });
      }
    }
    
    setAllocation(newAllocation);
    setSelectedPreset(''); // カスタム設定になったらプリセット選択を解除
  };

  const applyPreset = (preset: typeof ALLOCATION_PRESETS[0]) => {
    setAllocation(preset.allocation);
    setSelectedPreset(preset.name);
  };

  const handleSave = () => {
    onUpdate(income, allocation);
    onClose();
  };

  const calculateAmount = (percentage: number) => {
    return Math.round((income * percentage) / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-latte-900/50 backdrop-blur-sm">
      <div className="bg-latte-50 rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-latte-50 border-b border-latte-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-latte-400 to-latte-600 rounded-lg text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-latte-900">収入設定と配分</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-latte-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-latte-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* 月収入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-latte-700 mb-2">
              月収（手取り）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-latte-600 font-semibold">
                ¥
              </span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-3 bg-white border border-latte-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-sage-400 text-lg font-semibold"
                placeholder="300000"
                step="10000"
              />
            </div>
            <p className="mt-1 text-sm text-latte-600">
              毎月の手取り収入を入力してください
            </p>
          </div>

          {/* プリセット選択 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-latte-700 mb-3">配分プリセット</h3>
            <div className="grid grid-cols-2 gap-3">
              {ALLOCATION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    selectedPreset === preset.name
                      ? 'border-sage-400 bg-sage-50'
                      : 'border-latte-200 bg-white hover:border-latte-300'
                  }`}
                >
                  <div className="font-medium text-latte-900">{preset.name}</div>
                  <div className="text-xs text-latte-600 mt-1">{preset.description}</div>
                  <div className="text-xs text-latte-500 mt-2">
                    貯蓄{preset.allocation.savings}% / 固定{preset.allocation.fixedCosts}% / 
                    生活{preset.allocation.livingCosts}% / 自由{preset.allocation.freeMoney}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 収入配分（仮想封筒） */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-latte-700 mb-3">収入の配分（仮想封筒）</h3>
            
            {/* 貯蓄封筒 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-latte-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <PiggyBank className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-medium text-latte-900">先取り貯蓄</div>
                    <div className="text-sm text-latte-600">将来への備え</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-sage-600">
                    ¥{calculateAmount(allocation.savings).toLocaleString()}
                  </div>
                  <div className="text-sm text-latte-500">月額</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={allocation.savings}
                  onChange={(e) => handleAllocationChange('savings', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-12 text-right font-medium">{allocation.savings}%</div>
              </div>
            </div>

            {/* 固定費封筒 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-latte-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-latte-200 rounded-lg">
                    <Home className="w-5 h-5 text-latte-700" />
                  </div>
                  <div>
                    <div className="font-medium text-latte-900">固定費</div>
                    <div className="text-sm text-latte-600">家賃・光熱費・通信費など</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-latte-700">
                    ¥{calculateAmount(allocation.fixedCosts).toLocaleString()}
                  </div>
                  <div className="text-sm text-latte-500">月額</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={allocation.fixedCosts}
                  onChange={(e) => handleAllocationChange('fixedCosts', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-12 text-right font-medium">{allocation.fixedCosts}%</div>
              </div>
            </div>

            {/* 生活費封筒 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-latte-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-functional-info/10 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-functional-info" />
                  </div>
                  <div>
                    <div className="font-medium text-latte-900">生活費</div>
                    <div className="text-sm text-latte-600">食費・日用品など</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-functional-info">
                    ¥{calculateAmount(allocation.livingCosts).toLocaleString()}
                  </div>
                  <div className="text-sm text-latte-500">月額</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={allocation.livingCosts}
                  onChange={(e) => handleAllocationChange('livingCosts', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-12 text-right font-medium">{allocation.livingCosts}%</div>
              </div>
            </div>

            {/* 自由支出封筒 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-latte-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-functional-warning/10 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-functional-warning" />
                  </div>
                  <div>
                    <div className="font-medium text-latte-900">自由支出</div>
                    <div className="text-sm text-latte-600">娯楽・趣味・ストレス発散</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-functional-warning">
                    ¥{calculateAmount(allocation.freeMoney).toLocaleString()}
                  </div>
                  <div className="text-sm text-latte-500">月額</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={allocation.freeMoney}
                  onChange={(e) => handleAllocationChange('freeMoney', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-12 text-right font-medium">{allocation.freeMoney}%</div>
              </div>
            </div>

            {/* 合計確認 */}
            <div className="p-3 bg-latte-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-latte-700">合計配分率</span>
                <span className={`font-bold ${
                  allocation.savings + allocation.fixedCosts + allocation.livingCosts + allocation.freeMoney === 100
                    ? 'text-sage-600'
                    : 'text-functional-danger'
                }`}>
                  {allocation.savings + allocation.fixedCosts + allocation.livingCosts + allocation.freeMoney}%
                </span>
              </div>
            </div>
          </div>

          {/* 説明 */}
          <div className="mb-6 p-4 bg-sage-50 rounded-lg border border-sage-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-latte-700">
                <p className="font-medium mb-1">仮想封筒システムについて</p>
                <p>
                  収入を受け取った時点で、自動的に各用途に振り分けることで、
                  使える金額を明確にし、衝動的な支出を防ぎます。
                  特に「先取り貯蓄」は、最初から「使えないお金」として分離することが重要です。
                </p>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-latte-300 text-latte-700 rounded-lg font-medium hover:bg-latte-100 transition-all"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-sage-400 to-sage-500 text-white rounded-lg font-medium hover:shadow-soft-md transition-all"
            >
              設定を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
