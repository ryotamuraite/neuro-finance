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
  incomes: Income[]; // 収入記録を追加
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

export interface Income {
  id: string;
  date: string;
  amount: number;
  category: 'salary' | 'bonus' | 'freelance' | 'gift' | 'investment' | 'other';
  description: string;
  isRecurring?: boolean; // 定期収入かどうか
  recurringDay?: number; // 定期収入の日（1-31）
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
  incomes: [], // 収入記録の初期化
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
        
        // incomes フィールドが存在しない場合は追加（後方互換性のため）
        if (!parsed.incomes) {
          parsed.incomes = [];
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
        
        // incomes フィールドが存在しない場合は追加
        if (!parsed.incomes) {
          parsed.incomes = [];
        }
        
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
          
          // incomes フィールドが存在しない場合は追加
          if (!imported.incomes) {
            imported.incomes = [];
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
    saveData(updatedData);
    
    // XP獲得（記録するたびに10XP）
    addXP(10);
    
    return newTransaction;
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // トランザクション編集
  const editTransaction = useCallback((updatedTransaction: Transaction) => {
    const oldTransaction = data.transactions.find(t => t.id === updatedTransaction.id);
    if (!oldTransaction) return;

    const updatedData = {
      ...data,
      transactions: data.transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      ),
      settings: {
        ...data.settings,
        categories: data.settings.categories.map(cat => {
          // 古いトランザクションの金額を減算
          if (cat.id === oldTransaction.category) {
            cat.spent -= oldTransaction.amount;
          }
          // 新しいトランザクションの金額を加算
          if (cat.id === updatedTransaction.category) {
            cat.spent += updatedTransaction.amount;
          }
          return cat;
        })
      }
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // トランザクション削除
  const deleteTransaction = useCallback((transactionId: string) => {
    const transactionToDelete = data.transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    const updatedData = {
      ...data,
      transactions: data.transactions.filter(t => t.id !== transactionId),
      settings: {
        ...data.settings,
        categories: data.settings.categories.map(cat => 
          cat.id === transactionToDelete.category 
            ? { ...cat, spent: Math.max(0, cat.spent - transactionToDelete.amount) }
            : cat
        )
      }
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 収入追加
  const addIncome = useCallback((income: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      incomes: [...(data.incomes || []), newIncome]
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
    
    // XP獲得（収入記録で5XP）
    addXP(5);
    
    return newIncome;
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 収入編集
  const editIncome = useCallback((updatedIncome: Income) => {
    const updatedData = {
      ...data,
      incomes: (data.incomes || []).map(i => 
        i.id === updatedIncome.id ? updatedIncome : i
      )
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 収入削除
  const deleteIncome = useCallback((incomeId: string) => {
    const updatedData = {
      ...data,
      incomes: (data.incomes || []).filter(i => i.id !== incomeId)
    };
    
    setData(updatedData);
    setHasUnsavedChanges(true);
    saveData(updatedData);
  }, [data, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // XP追加とレベルアップ処理（定期収入チェックより前に移動）
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

  // 定期収入の自動記録チェック
  const checkAndAddRecurringIncomes = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 定期収入として設定されている収入を取得
    const recurringIncomes = (data.incomes || []).filter(income => 
      income.isRecurring && income.recurringDay
    );
    
    if (recurringIncomes.length === 0) return [];
    
    const addedIncomes: Income[] = [];
    
    recurringIncomes.forEach(recurringIncome => {
      // 今月のこの定期収入がすでに記録されているかチェック
      const thisMonthRecorded = (data.incomes || []).some(income => {
        if (income.id === recurringIncome.id) return false; // 元の定期収入設定はスキップ
        
        const incomeDate = new Date(income.date);
        return (
          incomeDate.getFullYear() === currentYear &&
          incomeDate.getMonth() === currentMonth &&
          incomeDate.getDate() === recurringIncome.recurringDay &&
          income.category === recurringIncome.category &&
          income.amount === recurringIncome.amount
        );
      });
      
      // 今日が定期収入の日で、まだ記録されていない場合
      if (recurringIncome.recurringDay === currentDay && !thisMonthRecorded) {
        const newIncome: Income = {
          id: `recurring_${Date.now()}_${Math.random()}`,
          date: today.toISOString().split('T')[0],
          amount: recurringIncome.amount,
          category: recurringIncome.category,
          description: `${recurringIncome.description} (定期収入)`,
          isRecurring: false // 自動生成された収入は定期フラグをオフに
        };
        
        addedIncomes.push(newIncome);
      }
      
      // 過去の未記録分もチェック（最大3日前まで）
      for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - daysAgo);
        
        if (
          checkDate.getDate() === recurringIncome.recurringDay &&
          checkDate.getMonth() === currentMonth &&
          checkDate.getFullYear() === currentYear
        ) {
          const pastRecorded = (data.incomes || []).some(income => {
            const incomeDate = new Date(income.date);
            return (
              incomeDate.getFullYear() === checkDate.getFullYear() &&
              incomeDate.getMonth() === checkDate.getMonth() &&
              incomeDate.getDate() === checkDate.getDate() &&
              income.category === recurringIncome.category &&
              income.amount === recurringIncome.amount
            );
          });
          
          if (!pastRecorded) {
            const pastIncome: Income = {
              id: `recurring_past_${Date.now()}_${Math.random()}`,
              date: checkDate.toISOString().split('T')[0],
              amount: recurringIncome.amount,
              category: recurringIncome.category,
              description: `${recurringIncome.description} (定期収入・自動記録)`,
              isRecurring: false
            };
            
            addedIncomes.push(pastIncome);
          }
        }
      }
    });
    
    // 新しい収入があれば追加
    if (addedIncomes.length > 0) {
      const updatedData = {
        ...data,
        incomes: [...(data.incomes || []), ...addedIncomes]
      };
      
      setData(updatedData);
      setHasUnsavedChanges(true);
      saveData(updatedData);
      
      // XP獲得（自動記録ごとに3XP）
      addXP(addedIncomes.length * 3);
    }
    
    return addedIncomes;
  }, [data, saveData, addXP]); // eslint-disable-line react-hooks/exhaustive-deps

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
    editTransaction,
    deleteTransaction,
    
    // 収入管理
    addIncome,
    editIncome,
    deleteIncome,
    checkAndAddRecurringIncomes,
    
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
