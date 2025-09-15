import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

// 仮のデータ（後でPropsやContextから取得）
const data = [
  { name: '食費', value: 35000, color: '#3B82F6' },
  { name: '娯楽費', value: 18000, color: '#10B981' },
  { name: 'ストレス発散費', value: 12000, color: '#F59E0B' },
  { name: '交通費', value: 8000, color: '#8B5CF6' },
  { name: '日用品', value: 14500, color: '#EF4444' },
];

export const SpendingChart: React.FC = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            ¥{data.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <PieChartIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">支出内訳</h3>
            <p className="text-sm text-gray-500">今月の支出カテゴリー</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">合計</p>
          <p className="text-lg font-bold text-gray-800">
            ¥{total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* チャート */}
        <div className="flex-1 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* レジェンド */}
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                ¥{item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* アドバイス */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 食費の割合が適切な範囲内です。この調子で維持しましょう！
        </p>
      </div>
    </div>
  );
};
