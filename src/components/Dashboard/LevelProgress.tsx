import React from 'react';
import { Trophy, Star } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ 
  level, 
  currentXP, 
  nextLevelXP 
}) => {
  const percentage = (currentXP / nextLevelXP) * 100;
  
  // レベルに応じたバッジの色
  const getLevelColor = () => {
    if (level < 5) return 'text-bronze-600 bg-bronze-100';
    if (level < 10) return 'text-gray-600 bg-gray-100';
    if (level < 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getLevelTitle = () => {
    if (level < 3) return '初心者';
    if (level < 5) return '見習い';
    if (level < 10) return '中級者';
    if (level < 20) return '上級者';
    return 'マスター';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getLevelColor()}`}>
          <Trophy className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, Math.ceil(level / 4)))].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 text-yellow-400 fill-yellow-400"
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-1">現在のレベル</p>
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-bold text-gray-800">
            Lv. {level}
          </p>
          <p className="text-sm text-gray-500">
            {getLevelTitle()}
          </p>
        </div>
      </div>

      {/* XPプログレスバー */}
      <div className="relative mb-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-600">
            {currentXP} XP
          </p>
          <p className="text-xs text-gray-600">
            {nextLevelXP} XP
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          次のレベルまであと {nextLevelXP - currentXP} XP
        </p>
      </div>
    </div>
  );
};
