import React from 'react';
import { Download, Upload, Save, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const DataManagement: React.FC = () => {
  const { 
    lastSaved, 
    hasUnsavedChanges, 
    saveData, 
    exportData, 
    importData,
    clearData 
  } = useLocalStorage();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file).then(success => {
        if (success) {
          alert('データのインポートに成功しました！');
          window.location.reload(); // 画面をリフレッシュ
        }
      });
    }
  };

  return (
    <div className="bg-latte-50 rounded-xl p-4 shadow-soft border border-latte-200">
      <h3 className="text-lg font-semibold text-latte-900 mb-4">データ管理</h3>
      
      {/* 保存状態の表示 */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        {hasUnsavedChanges ? (
          <div className="flex items-center gap-2 text-functional-warning">
            <AlertCircle className="w-4 h-4" />
            <span>未保存の変更があります</span>
          </div>
        ) : lastSaved ? (
          <div className="flex items-center gap-2 text-sage-600">
            <Save className="w-4 h-4" />
            <span>最終保存: {lastSaved.toLocaleTimeString()}</span>
          </div>
        ) : null}
      </div>

      {/* アクションボタン */}
      <div className="space-y-2">
        {/* 手動保存 */}
        {hasUnsavedChanges && (
          <button
            onClick={() => saveData()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors shadow-soft"
          >
            <Save className="w-4 h-4" />
            今すぐ保存
          </button>
        )}

        {/* エクスポート */}
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-latte-500 text-white rounded-lg hover:bg-latte-600 transition-colors shadow-soft"
        >
          <Download className="w-4 h-4" />
          データをバックアップ
        </button>

        {/* インポート */}
        <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-functional-info text-white rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer shadow-soft">
          <Upload className="w-4 h-4" />
          データを復元
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {/* データクリア */}
        <button
          onClick={clearData}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-functional-danger bg-opacity-10 text-functional-danger rounded-lg hover:bg-opacity-20 transition-colors"
        >
          すべてのデータを削除
        </button>
      </div>

      {/* 説明テキスト */}
      <div className="mt-4 p-3 bg-sage-50 rounded-lg border border-sage-200">
        <p className="text-xs text-sage-800">
          💡 データは自動的にブラウザに保存されます。
          定期的にバックアップを取ることをお勧めします。
        </p>
      </div>
    </div>
  );
};
