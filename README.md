# 営業日報システム (Sales Daily Report System)

営業担当者が日々の営業活動を報告し、上長がフィードバックできる日報管理システム

## 📚 ドキュメント

- [UI仕様書](./doc/UI_SPEC.md) - 画面設計とワイヤーフレーム
- [API仕様書](./doc/API_SPEC.md) - RESTful APIエンドポイント
- [テスト仕様書](./doc/TEST_SPEC.md) - テストケースとテスト戦略
- [データベース設計書](./doc/DATABASE.md) - Prismaスキーマとセットアップ
- [ER図](./doc/ER_DIAGRAM.md) - エンティティ関連図

## 🛠️ 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Next.js (App Router)
- **UIコンポーネント**: shadcn/ui + Tailwind CSS
- **ORM**: Prisma.js
- **データベース**: PostgreSQL
- **テスト**: Vitest
- **API検証**: Zod
- **デプロイ**: Google Cloud Run

## 🚀 セットアップ

### 前提条件

- Node.js 20.x
- PostgreSQL 15.x
- npm または yarn

### 1. リポジトリのクローン

\`\`\`bash
git clone <repository-url>
cd sales-daily-report-system
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
make install

# または

npm install
\`\`\`

### 3. 環境変数の設定

\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\`ファイルを編集して、データベース接続情報を設定：

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/sales_daily_report"
JWT_SECRET="your-secret-key-here"
\`\`\`

### 4. データベースのセットアップ

\`\`\`bash

# Prisma Clientの生成

make prisma-generate

# マイグレーションの実行

make prisma-migrate

# シードデータの投入

make prisma-seed
\`\`\`

### 5. 開発サーバーの起動

\`\`\`bash
make dev

# または

npm run dev
\`\`\`

## 📝 開発ワークフロー

### Makefileコマンド

\`\`\`bash
make help # 利用可能なコマンド一覧を表示
make install # 依存関係のインストール
make dev # 開発サーバー起動
make build # ビルド
make test # テスト実行
make test-watch # テストをwatch モードで実行
make test-coverage # カバレッジ付きテスト実行
make lint # Lint実行
make lint-fix # Lint自動修正
make format # コードフォーマット
make format-check # フォーマットチェック
\`\`\`

### Gitワークフロー

このプロジェクトではHuskyによるGit hooksを使用しています：

- **pre-commit**: コミット前にlint-stagedが実行され、コードが自動整形されます
- **commit-msg**: コミットメッセージがConventional Commitsに準拠しているかチェックされます

#### コミットメッセージの形式

\`\`\`
<type>: <subject>

<body>
\`\`\`

**Type一覧**:

- \`feat\`: 新機能
- \`fix\`: バグ修正
- \`docs\`: ドキュメント変更
- \`style\`: コードフォーマット
- \`refactor\`: リファクタリング
- \`test\`: テスト追加・修正
- \`chore\`: ビルドプロセスやツールの変更

**例**:
\`\`\`bash
git commit -m "feat: 日報一覧画面の実装"
git commit -m "fix: 顧客検索のバグ修正"
git commit -m "docs: API仕様書の更新"
\`\`\`

## 🧪 テスト

\`\`\`bash

# テスト実行

npm test

# UIモードでテスト

npm run test:ui

# カバレッジレポート生成

npm run test:coverage
\`\`\`

## 🐳 Docker

### ローカルでDockerビルド

\`\`\`bash
make docker-build
make docker-run
\`\`\`

### イメージのプッシュ

\`\`\`bash
make docker-push
\`\`\`

## ☁️ デプロイ (Google Cloud Run)

### 前提条件

- Google Cloud SDKのインストール
- プロジェクトID: \`useful-loop-352201\`
- 必要な権限の付与

### 認証

\`\`\`bash
make gcloud-auth
\`\`\`

### デプロイ

\`\`\`bash

# 本番環境にデプロイ

make deploy-prod

# ステージング環境にデプロイ

make deploy-staging

# クイックデプロイ（ビルドスキップ）

make deploy-quick
\`\`\`

### Cloud Buildを使用したデプロイ

\`\`\`bash
gcloud builds submit --config cloudbuild.yaml
\`\`\`

### ログの確認

\`\`\`bash
make logs
\`\`\`

## 🔧 データベース管理

### Prismaコマンド

\`\`\`bash
make prisma-studio # Prisma Studioを開く
make prisma-migrate # マイグレーション実行
make prisma-seed # シードデータ投入
make db-reset # データベースリセット
\`\`\`

## 📊 CI/CD

このプロジェクトはGitHub Actionsを使用しています：

- **CI**: \`main\`や\`develop\`ブランチへのpush/PR時に自動実行
  - Lint
  - Format check
  - Test
  - Coverage report

- **Deploy**: \`main\`ブランチへのpush時に自動デプロイ
  - Docker imageのビルド
  - GCRへのpush
  - Cloud Runへのデプロイ

## 🔐 環境変数

本番環境では、以下の環境変数をGoogle Cloud Secretsで管理してください：

- \`DATABASE_URL\`: PostgreSQL接続文字列
- \`JWT_SECRET\`: JWT署名キー
- \`NODE_ENV\`: 実行環境 (production/staging/development)

## 📦 プロジェクト構成

\`\`\`
.
├── .github/
│ └── workflows/ # GitHub Actions
├── .husky/ # Git hooks
├── doc/ # ドキュメント
├── prisma/
│ ├── schema.prisma # Prismaスキーマ
│ └── seed.ts # シードデータ
├── src/ # ソースコード
├── tests/ # テストコード
├── Dockerfile # Dockerイメージ定義
├── Makefile # デプロイコマンド
├── cloudbuild.yaml # Cloud Build設定
└── vitest.config.ts # Vitestテスト設定
\`\`\`

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (\`git checkout -b feature/amazing-feature\`)
3. 変更をコミット (\`git commit -m 'feat: Add amazing feature'\`)
4. ブランチにプッシュ (\`git push origin feature/amazing-feature\`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 📧 サポート

質問や問題がある場合は、Issueを作成してください。
