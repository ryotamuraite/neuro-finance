import { useState, useEffect, useCallback } from 'react';

import { IncomeAllocation } from '../components/IncomeSettings';

// LocalStorageのキー
const STORAGE_KEY = 'neurofinance_data';
const BACKUP_KEY = 'neurofinance_backup';
// const VERSION_KEY = 'neurofinance_version'; // 将来的に使用予定
const CURRENT_VERSION = '1.0.0';

// データの型定義
export interface NeuroFinanceData {
  version: string;
  lastUpdated: string;
  settings: {
    userName?: string;
    monthlyIncome?: number;
    incomeAllocation?: IncomeAllocation;
    categories: BudgetCategory[];
  };
  transactions: Transaction[];
  moods: MoodEntry[];
  goals: Goal[];
  level: number;
  xp: number;
  badges: string[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  mood?: string;
  impulsivity?: number; // 1-5
}

export interface MoodEntry {
  date: string;
  mood: 'happy' | 'stable' | 'tired' | 'stressed' | 'anxious';
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

// デフォルトデータ
const DEFAULT_DATA: NeuroFinanceData = {
  version: CURRENT_VERSION,
  lastUpdated: new Date().toISOString(),
  settings: {
    monthlyIncome: 0,
    incomeAllocation: {
      savings: 20,
      fixedCosts: 40,
      livingCosts: 25,
      freeMoney: 15
    },
    categories: [
      { id: '1', name: '食費', icon: 'coffee', budget: 50000, spent: 0, color: '#8884d8' },
      { id: '2', name: '娯楽費', icon: 'gamepad', budget: 30000, spent: 0, color: '#82ca9d' },
      { id: '3', name: 'ストレス発散費', icon: 'heart', budget: 20000, spent: 0, color: '#ec4899' },
      { id: '4', name: '日用品', icon: 'shopping-bag', budget: 15000, spent: 0, color: '#ffc658' },
    ]
  },
  transactions: [],
  moods: [],
  goals: [],
  level: 1,
  xp: 0,
  badges: []
};

/**
 * LocalStorageとの同期を管理するカスタムフック
 */
export const useLocalStorage = () => {
  const [data, setData] = useState<NeuroFinanceData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // LocalStorageからデータを読み込み
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NeuroFinanceData;
        
        // バージョンチェック
        if (parsed.version !== CURRENT_VERSION) {
          // マイグレーション処理をここに追加
          // TODO: データマイグレーション処理
        // console.log('データマイグレーションが必要です');
        }
        
        setData(parsed);
        setLastSaved(new Date(parsed.lastUpdated));
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
      // エラー時は自動バックアップから復元を試みる
      tryRestoreFromBackup();
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // LocalStorageにデータを保存
  const saveData = useCallback((newData?: NeuroFinanceData) => {
    try {
      const dataToSave = newData || data;
      const updated = {
        ...dataToSave,
        lastUpdated: new Date().toISOString()
      };
      
      // メインデータを保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // 自動バックアップ（1日1回）
      const lastBackup = localStorage.getItem(BACKUP_KEY + '_date');
      const today = new Date().toDateString();
      if (lastBackup !== today) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
        localStorage.setItem(BACKUP_KEY + '_date', today);
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      return true;
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
      
      // 容量オーバーの可能性
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('ブラウザのストレージ容量が不足しています。古いデータを削除してください。');
      }
      
      return false;
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // 自動バックアップからの復元
  const tryRestoreFromBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup) as NeuroFinanceData;
        setData(parsed);
        // バックアップから復元成功
        // console.log('バックアップから復元しました');
        return true;
      }
    } catch (error) {
      console.error('バックアップからの復元に失敗しました:', error);
    }
    return false;
  }, []);

  // データをエクスポート（JSON形式でダウンロード）
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neurofinance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  // データをインポート
  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as NeuroFinanceData;
          
          // データの検証
          if (!imported.version || !imported.settings) {
            throw new Error('無効なデータ形式です');
          }
          
          setData(imported);
          saveData(imported);
          resolve(true);
        } catch (error) {
          console.error('インポートに失敗しました:', error);
          alert('ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, [saveData]);

  // データをクリア（初期化）
  const clearData = useCallback(() => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      // バックアップを作成してから削除
      exportData();
      localStorage.removeItem(STORAGE_KEY);
      setData(DEFAULT_DATA);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    }
  }, [exportData]);

  // 収入設定更新
  const updateIncomeSettings = useCallback((income: number, allocation: IncomeAllocation) => {
    const updatedData = {
      ...data,
      settings: {
        ...data.settings,
        monthlyIncome: income,
        incomeAllocation: allocation
      }
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // カテゴリ更新
  const updateCategories = useCallback((newCategories: BudgetCategory[]) => {
    const updatedData = {
      ...data,
      settings: {
        ...data.settings,
        categories: newCategories
      }
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // トランザクション追加
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      transactions: [...data.transactions, newTransaction],
      settings: {
        ...data.settings,
        categories: data.settings.categories.map(cat => 
          cat.id === transaction.category 
            ? { ...cat, spent: cat.spent + transaction.amount }
            : cat
        )
      }
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    
    // XP獲得（記録するたびに10XP）
    addXP(10);
    
    return newTransaction;
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // XP追加とレベルアップ処理
  const addXP = useCallback((amount: number) => {
    const newXP = data.xp + amount;
    const xpForNextLevel = data.level * 100; // レベル×100がレベルアップに必要なXP
    
    if (newXP >= xpForNextLevel) {
      // レベルアップ！
      const newLevel = data.level + 1;
      const remainingXP = newXP - xpForNextLevel;
      
      setData(prev => ({
        ...prev,
        level: newLevel,
        xp: remainingXP
      }));
      
      // レベルアップ通知（実装は後で）
      // TODO: トースト通知などのUIフィードバックを実装
      // console.log(`🎉 レベル${newLevel}にアップ！`);
    } else {
      setData(prev => ({
        ...prev,
        xp: newXP
      }));
    }
  }, [data]);

  // 初回マウント時にデータを読み込み
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 定期的な自動保存（30秒ごと）
  useEffect(() => {
    if (hasUnsavedChanges && !isLoading) {
      const timer = setTimeout(() => {
        saveData();
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, isLoading, saveData]);

  // ページを離れる前に保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        saveData();
        e.preventDefault();
        e.returnValue = '保存されていない変更があります。';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saveData]);

  return {
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    
    // データ操作
    saveData,
    loadData,
    clearData,
    exportData,
    importData,
    
    // トランザクション
    addTransaction,
    
    // カテゴリ管理
    updateCategories,
    
    // 収入設定
    updateIncomeSettings,
    
    // ゲーミフィケーション
    addXP,
    
    // 直接データ更新（慎重に使用）
    updateData: setData
  };
};
