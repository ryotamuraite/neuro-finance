# システムアーキテクチャ設計書

## 1. 技術構成概要

### 1.1 技術スタック
```
Frontend Framework : React 18 + TypeScript
Styling           : Tailwind CSS
Charts           : Recharts
Icons            : Lucide React
State Management : React Context API + useReducer
Data Storage     : localStorage (Phase 1) → Supabase (Phase 2)
Routing          : React Router v6
Testing          : Jest + React Testing Library
Build Tool       : Create React App
Hosting          : GitHub Pages (Phase 1) → Vercel (Phase 2)
```

### 1.2 アーキテクチャパターン
- **プレゼンテーション層**: React コンポーネント
- **ビジネスロジック層**: カスタムフック + ユーティリティ関数
- **データ層**: localStorage ラッパー + Context API

## 2. ディレクトリ構成

```
src/
├── components/          # UIコンポーネント
│   ├── ui/             # 汎用UIコンポーネント
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Chart/
│   │   └── Modal/
│   ├── features/       # 機能別コンポーネント
│   │   ├── Budget/
│   │   ├── Expenses/
│   │   ├── Gamification/
│   │   └── Simulation/
│   └── layout/         # レイアウトコンポーネント
│       ├── Header/
│       ├── Navigation/
│       └── Container/
├── hooks/              # カスタムフック
│   ├── useLocalStorage.ts
│   ├── useBudget.ts
│   ├── useExpenses.ts
│   └── useSimulation.ts
├── contexts/           # React Context
│   ├── AppContext.tsx
│   ├── BudgetContext.tsx
│   └── UserContext.tsx
├── utils/              # ユーティリティ関数
│   ├── calculations.ts
│   ├── dateHelpers.ts
│   ├── formatters.ts
│   └── validators.ts
├── types/              # TypeScript型定義
│   ├── budget.ts
│   ├── expense.ts
│   ├── user.ts
│   └── index.ts
├── styles/             # グローバルスタイル
│   ├── globals.css
│   └── components.css
└── constants/          # 定数定義
    ├── categories.ts
    ├── colors.ts
    └── config.ts
```

## 3. コンポーネント設計

### 3.1 コンポーネント階層

```
App
├── Router
│   ├── Layout
│   │   ├── Header
│   │   ├── Navigation
│   │   └── Main
│   │       ├── Dashboard
│   │       │   ├── BudgetOverview
│   │       │   ├── QuickExpenseEntry
│   │       │   └── RecentTransactions
│   │       ├── Expenses
│   │       │   ├── ExpenseForm
│   │       │   ├── ExpenseList
│   │       │   └── ExpenseFilters
│   │       ├── Budget
│   │       │   ├── BudgetEnvelopes
│   │       │   ├── BudgetSimulator
│   │       │   └── BudgetSettings
│   │       ├── Analytics
│   │       │   ├── SpendingCharts
│   │       │   ├── MoodCorrelation
│   │       │   └── MoneyTree
│   │       └── Gamification
│   │           ├── QuestList
│   │           ├── BadgeCollection
│   │           └── LevelProgress
```

### 3.2 コンポーネント設計原則

**神経多様性配慮**
- 1コンポーネント1責務
- 認知負荷を軽減するシンプルなインターフェース
- 色・形・アニメーションによる直感的フィードバック

**再利用性**
- Atomic Design Pattern採用
- プロップスによる柔軟なカスタマイズ
- TypeScriptによる型安全性確保

## 4. 状態管理設計

### 4.1 グローバル状態構造

```typescript
interface AppState {
  user: UserState;
  budget: BudgetState;
  expenses: ExpenseState;
  gamification: GamificationState;
  ui: UIState;
}
```

### 4.2 Context分割戦略

```typescript
// メインコンテキスト
AppContext: ユーザー設定、アプリ全体設定
BudgetContext: 予算関連状態、シミュレーション
ExpenseContext: 支出記録、履歴管理
GamificationContext: XP、レベル、バッジ、クエスト
```

### 4.3 状態更新パターン

```typescript
// useReducer + Context パターン
const [state, dispatch] = useReducer(budgetReducer, initialState);

// アクション定義
type BudgetAction = 
  | { type: 'SET_MONTHLY_BUDGET'; payload: { category: string; amount: number } }
  | { type: 'UPDATE_DAILY_BUDGET'; payload: { remainingDays: number } }
  | { type: 'SIMULATE_EXPENSE'; payload: { amount: number; category: string } };
```

## 5. データフロー設計

### 5.1 入力→更新→表示フロー

```
User Input (Form)
    ↓
Custom Hook (useExpenses)
    ↓
Context Action Dispatch
    ↓
Reducer State Update
    ↓
localStorage Sync
    ↓
Component Re-render
    ↓
UI Update (Charts, Balances)
```

### 5.2 計算ロジックフロー

```
Monthly Budget Setting
    ↓
Daily Budget Calculation
    ↓
Expense Input
    ↓
Remaining Budget Update
    ↓
Simulation Trigger
    ↓
Impact Analysis
    ↓
Recommendation Generation
```

## 6. パフォーマンス最適化

### 6.1 レンダリング最適化
- React.memo による不要再レンダリング防止
- useMemo/useCallback によるオブジェクト/関数メモ化
- 仮想化（react-window）による大量データ表示最適化

### 6.2 バンドルサイズ最適化
- Tree shaking による未使用コード除去
- Dynamic import による遅延ローディング
- Recharts の必要チャートのみインポート

### 6.3 データ最適化
- localStorage 読み書き最小化
- debounce による連続入力対応
- キャッシュ戦略によるリアルタイム計算最適化

## 7. エラーハンドリング

### 7.1 エラー境界設定
```typescript
<ErrorBoundary>
  <BudgetSimulator />
</ErrorBoundary>
```

### 7.2 データ整合性確保
- スキーマバリデーション
- ローカルストレージデータ復旧機能
- バックアップ・エクスポート機能

## 8. セキュリティ考慮事項

### 8.1 データ保護
- ローカルストレージデータの暗号化検討
- XSS攻撃対策（CSP設定）
- 入力値サニタイゼーション

### 8.2 プライバシー保護
- 外部サービスへのデータ送信なし
- ローカル完結型処理
- ユーザー同意なしの情報収集禁止

## 9. デプロイメント戦略

### 9.1 Phase 1: GitHub Pages
```bash
npm run build
npm run deploy  # gh-pages パッケージ使用
```

### 9.2 Phase 2: Vercel移行
- 環境変数管理
- CI/CD パイプライン構築
- プレビューデプロイメント

## 10. 開発ツール設定

### 10.1 開発効率化
- ESLint + Prettier 設定
- Husky による pre-commit hooks
- VSCode 推奨拡張設定

### 10.2 デバッグ支援
- React Developer Tools
- localStorage データビューア
- Performance プロファイリング
