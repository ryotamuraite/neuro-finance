# データ設計・API設計書

## 1. データモデル設計

### 1.1 TypeScript型定義

```typescript
// ============= 基本型定義 =============

export interface User {
  id: string;
  name: string;
  settings: UserSettings;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSettings {
  currency: string;           // 'JPY', 'USD', etc.
  startOfWeek: number;       // 0 = Sunday, 1 = Monday
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  neuroDiversityProfile: NeuroDiversityProfile;
}

export interface NeuroDiversityProfile {
  conditions: ('ADHD' | 'ASD' | 'bipolar' | 'insomnia')[];
  impulsivityLevel: 1 | 2 | 3 | 4 | 5;  // 1=低, 5=高
  cognitiveLoadPreference: 'minimal' | 'moderate' | 'detailed';
  preferredFeedbackType: 'visual' | 'auditory' | 'haptic' | 'combined';
}

// ============= 支出関連 =============

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;              // ISO 8601
  mood: MoodState;
  impulsivityScore: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MoodState = 'happy' | 'stable' | 'tired' | 'stressed' | 'anxious';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;              // Lucide icon name
  color: string;             // Tailwind color class
  monthlyBudget: number;
  isDefault: boolean;
  allowOverspend: boolean;   // ストレス発散費等での柔軟性
}

// ============= 予算関連 =============

export interface Budget {
  id: string;
  month: string;             // YYYY-MM
  categories: BudgetCategory[];
  totalMonthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  categoryId: string;
  allocatedAmount: number;
  spentAmount: number;
  dailyBudget: number;       // 自動計算値
  remainingDays: number;     // 自動計算値
  status: 'safe' | 'warning' | 'danger';
}

export interface BudgetSimulation {
  id: string;
  budgetId: string;
  scenarios: SimulationScenario[];
  createdAt: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  plannedExpenses: PlannedExpense[];
  impactAnalysis: ImpactAnalysis;
}

export interface PlannedExpense {
  amount: number;
  category: string;
  description: string;
  plannedDate: string;
}

export interface ImpactAnalysis {
  newDailyBudget: number;
  impactLevel: 'low' | 'medium' | 'high';
  affectedCategories: string[];
  recommendations: string[];
  alternativeOptions: AlternativeOption[];
}

export interface AlternativeOption {
  description: string;
  adjustedAmount: number;
  newImpactLevel: 'low' | 'medium' | 'high';
}

// ============= ゲーミフィケーション =============

export interface UserProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  badges: Badge[];
  activeQuests: Quest[];
  completedQuests: QuestCompletion[];
  streaks: Streak[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  target: QuestTarget;
  reward: QuestReward;
  deadline?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestTarget {
  type: 'expense_limit' | 'budget_adherence' | 'consecutive_days' | 'category_spending';
  value: number;
  category?: string;
}

export interface QuestReward {
  xp: number;
  badge?: string;
  unlockFeature?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'budget' | 'streak' | 'milestone' | 'special';
}

export interface Streak {
  type: 'budget_adherence' | 'daily_logging' | 'no_impulse_buying';
  currentCount: number;
  bestCount: number;
  lastUpdateAt: string;
}

// ============= 分析・レポート =============

export interface MoodSpendingAnalysis {
  mood: MoodState;
  averageSpending: number;
  totalTransactions: number;
  topCategories: CategorySpending[];
  pattern: 'increasing' | 'decreasing' | 'stable' | 'volatile';
}

export interface CategorySpending {
  categoryId: string;
  amount: number;
  percentage: number;
}

export interface MoneyTree {
  level: number;
  totalSavings: number;
  monthlyGrowth: number;
  growthHistory: GrowthRecord[];
  nextLevelThreshold: number;
  visualState: TreeVisualState;
}

export interface GrowthRecord {
  month: string;            // YYYY-MM
  amount: number;
  growth: number;           // 前月比
}

export interface TreeVisualState {
  size: 'seedling' | 'sapling' | 'young_tree' | 'mature_tree' | 'giant_tree';
  healthStatus: 'thriving' | 'healthy' | 'struggling' | 'dormant';
  specialFeatures: string[]; // ['flowers', 'fruits', 'golden_leaves', etc.]
}
```

### 1.2 localStorage データ構造

```typescript
// localStorage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'nf_user_profile',
  EXPENSES: 'nf_expenses',
  BUDGETS: 'nf_budgets',
  CATEGORIES: 'nf_categories',
  GAMIFICATION: 'nf_gamification',
  SETTINGS: 'nf_settings',
  BACKUP: 'nf_backup',
} as const;

// Storage data structure
interface LocalStorageData {
  user: User;
  expenses: Expense[];
  budgets: Budget[];
  categories: ExpenseCategory[];
  gamification: UserProgress;
  lastBackup: string;
  version: string;          // データスキーマバージョン
}
```

## 2. データアクセス層設計

### 2.1 ストレージ操作インターフェース

```typescript
// ============= ストレージ抽象化層 =============

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      throw new Error('Storage quota exceeded');
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage).filter(key => key.startsWith('nf_'));
  }
}
```

### 2.2 データアクセスオブジェクト (DAO)

```typescript
// ============= 支出管理DAO =============

export class ExpenseDAO {
  constructor(private storage: StorageAdapter) {}

  async getAll(): Promise<Expense[]> {
    return await this.storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const expenses = await this.getAll();
    return expenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  }

  async getByCategory(categoryId: string): Promise<Expense[]> {
    const expenses = await this.getAll();
    return expenses.filter(expense => expense.category === categoryId);
  }

  async create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const expenses = await this.getAll();
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expenses.push(newExpense);
    await this.storage.set(STORAGE_KEYS.EXPENSES, expenses);
    return newExpense;
  }

  async update(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const expenses = await this.getAll();
    const index = expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) return null;
    
    expenses[index] = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.storage.set(STORAGE_KEYS.EXPENSES, expenses);
    return expenses[index];
  }

  async delete(id: string): Promise<boolean> {
    const expenses = await this.getAll();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    
    if (filteredExpenses.length === expenses.length) return false;
    
    await this.storage.set(STORAGE_KEYS.EXPENSES, filteredExpenses);
    return true;
  }
}

// ============= 予算管理DAO =============

export class BudgetDAO {
  constructor(private storage: StorageAdapter) {}

  async getCurrentBudget(): Promise<Budget | null> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return await this.getBudgetByMonth(currentMonth);
  }

  async getBudgetByMonth(month: string): Promise<Budget | null> {
    const budgets = await this.storage.get<Budget[]>(STORAGE_KEYS.BUDGETS) || [];
    return budgets.find(budget => budget.month === month) || null;
  }

  async createOrUpdateBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const budgets = await this.storage.get<Budget[]>(STORAGE_KEYS.BUDGETS) || [];
    const existingIndex = budgets.findIndex(b => b.month === budget.month);
    
    const updatedBudget: Budget = {
      ...budget,
      id: existingIndex >= 0 ? budgets[existingIndex].id : generateId(),
      createdAt: existingIndex >= 0 ? budgets[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      budgets[existingIndex] = updatedBudget;
    } else {
      budgets.push(updatedBudget);
    }

    await this.storage.set(STORAGE_KEYS.BUDGETS, budgets);
    return updatedBudget;
  }
}
```

## 3. ビジネスロジック層設計

### 3.1 計算ユーティリティ

```typescript
// ============= 予算計算ロジック =============

export class BudgetCalculator {
  static calculateDailyBudget(monthlyBudget: number, remainingDays: number): number {
    return remainingDays > 0 ? monthlyBudget / remainingDays : 0;
  }

  static calculateRemainingDays(targetMonth: string): number {
    const today = new Date();
    const [year, month] = targetMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getDate();
    
    return Math.max(0, lastDayOfMonth - currentDay + 1);
  }

  static simulateExpense(
    currentBudget: number,
    plannedExpense: number,
    remainingDays: number
  ): ImpactAnalysis {
    const newBudget = currentBudget - plannedExpense;
    const newDailyBudget = this.calculateDailyBudget(newBudget, remainingDays);
    const originalDailyBudget = this.calculateDailyBudget(currentBudget, remainingDays);
    
    const impactPercentage = (originalDailyBudget - newDailyBudget) / originalDailyBudget;
    
    let impactLevel: 'low' | 'medium' | 'high';
    if (impactPercentage < 0.1) impactLevel = 'low';
    else if (impactPercentage < 0.25) impactLevel = 'medium';
    else impactLevel = 'high';

    return {
      newDailyBudget,
      impactLevel,
      affectedCategories: [], // 実装時に詳細化
      recommendations: this.generateRecommendations(impactLevel, newDailyBudget),
      alternativeOptions: this.generateAlternatives(plannedExpense, impactLevel),
    };
  }

  private static generateRecommendations(
    impactLevel: 'low' | 'medium' | 'high',
    newDailyBudget: number
  ): string[] {
    switch (impactLevel) {
      case 'low':
        return ['影響は軽微です。計画通り進めても問題ありません。'];
      case 'medium':
        return [
          '他のカテゴリでの節約を検討してください。',
          `1日あたり${Math.round(newDailyBudget)}円の予算になります。`,
        ];
      case 'high':
        return [
          '大きな影響があります。購入を延期することを検討してください。',
          '必要であれば、翌月の予算から前借りを検討してください。',
        ];
    }
  }

  private static generateAlternatives(
    originalAmount: number,
    impactLevel: 'low' | 'medium' | 'high'
  ): AlternativeOption[] {
    if (impactLevel === 'low') return [];
    
    return [
      {
        description: '50%削減案',
        adjustedAmount: originalAmount * 0.5,
        newImpactLevel: impactLevel === 'high' ? 'medium' : 'low',
      },
      {
        description: '75%削減案',
        adjustedAmount: originalAmount * 0.25,
        newImpactLevel: 'low',
      },
    ];
  }
}

// ============= ゲーミフィケーション計算 =============

export class GamificationCalculator {
  static calculateXP(action: string, metadata?: any): number {
    const xpTable: Record<string, number> = {
      'expense_logged': 10,
      'budget_adhered': 50,
      'quest_completed': 100,
      'streak_milestone': 200,
    };
    
    return xpTable[action] || 5;
  }

  static calculateLevel(totalXP: number): number {
    // レベル計算式: level = floor(sqrt(totalXP / 100))
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  static getXPRequiredForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  static checkBadgeEligibility(userProgress: UserProgress, expenses: Expense[]): Badge[] {
    const newBadges: Badge[] = [];
    
    // 実装例: 連続記録バッジ
    if (this.getConsecutiveDays(expenses) >= 7 && 
        !userProgress.badges.some(b => b.id === 'seven_day_streak')) {
      newBadges.push({
        id: 'seven_day_streak',
        name: '一週間継続',
        description: '7日間連続で支出を記録しました',
        icon: 'calendar-check',
        earnedAt: new Date().toISOString(),
        category: 'streak',
      });
    }
    
    return newBadges;
  }

  private static getConsecutiveDays(expenses: Expense[]): number {
    // 連続記録日数の計算ロジック
    const sortedDates = [...new Set(expenses.map(e => e.date.split('T')[0]))].sort();
    let consecutiveDays = 0;
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - consecutiveDays);
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  }
}
```

## 4. カスタムフック設計

### 4.1 予算管理フック

```typescript
// ============= 予算管理フック =============

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const budgetDAO = useMemo(() => new BudgetDAO(new LocalStorageAdapter()), []);

  const loadCurrentBudget = useCallback(async () => {
    try {
      setLoading(true);
      const currentBudget = await budgetDAO.getCurrentBudget();
      setBudget(currentBudget);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [budgetDAO]);

  const updateBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedBudget = await budgetDAO.createOrUpdateBudget(budgetData);
      setBudget(updatedBudget);
      return updatedBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      throw err;
    }
  }, [budgetDAO]);

  const simulateExpense = useCallback((amount: number, category: string) => {
    if (!budget) return null;
    
    const categoryBudget = budget.categories.find(c => c.categoryId === category);
    if (!categoryBudget) return null;

    const remainingBudget = categoryBudget.allocatedAmount - categoryBudget.spentAmount;
    const remainingDays = BudgetCalculator.calculateRemainingDays(budget.month);
    
    return BudgetCalculator.simulateExpense(remainingBudget, amount, remainingDays);
  }, [budget]);

  useEffect(() => {
    loadCurrentBudget();
  }, [loadCurrentBudget]);

  return {
    budget,
    loading,
    error,
    updateBudget,
    simulateExpense,
    refreshBudget: loadCurrentBudget,
  };
};
```

## 5. Phase 2 移行準備

### 5.1 API インターフェース定義

```typescript
// 将来のバックエンドAPI用インターフェース
export interface APIClient {
  // 認証
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  
  // 支出管理
  getExpenses(filters?: ExpenseFilters): Promise<Expense[]>;
  createExpense(expense: CreateExpenseRequest): Promise<Expense>;
  updateExpense(id: string, updates: UpdateExpenseRequest): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  // 予算管理
  getBudget(month: string): Promise<Budget>;
  updateBudget(budget: UpdateBudgetRequest): Promise<Budget>;
  
  // 外部連携
  linkBankAccount(credentials: BankCredentials): Promise<LinkResult>;
  syncTransactions(): Promise<SyncResult>;
}
```

この設計により、Phase 1のlocalStorage版から Phase 2のフルスケール版への移行が容易になり、段階的な機能拡張が可能になります。
