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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">データ管理</h3>
      
      {/* 保存状態の表示 */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        {hasUnsavedChanges ? (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <span>未保存の変更があります</span>
          </div>
        ) : lastSaved ? (
          <div className="flex items-center gap-2 text-green-600">
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            今すぐ保存
          </button>
        )}

        {/* エクスポート */}
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          データをバックアップ
        </button>

        {/* インポート */}
        <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          すべてのデータを削除
        </button>
      </div>

      {/* 説明テキスト */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 データは自動的にブラウザに保存されます。
          定期的にバックアップを取ることをお勧めします。
        </p>
      </div>
    </div>
  );
};
