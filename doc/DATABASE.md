# データベース設計 - 営業日報システム

## Prismaセットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、データベース接続情報を設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```
DATABASE_URL="postgresql://username:password@localhost:5432/sales_daily_report?schema=public"
```

### 3. データベースの作成

PostgreSQLにデータベースを作成：

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE sales_daily_report;
\q
```

### 4. Prisma Clientの生成

```bash
npm run prisma:generate
```

### 5. マイグレーションの実行

```bash
# 開発環境
npm run prisma:migrate

# 本番環境
npm run prisma:migrate:prod
```

マイグレーション名を入力（例: init）

### 6. シードデータの投入

```bash
npm run prisma:seed
```

投入されるデータ：

- 上長: 田中課長
- 営業担当者: 山田太郎、佐藤花子、鈴木一郎
- 管理者: 管理者
- 顧客: ABC商事、XYZ株式会社、DEF物産
- 日報と訪問記録、コメントのサンプル

### 7. Prisma Studioでデータ確認

```bash
npm run prisma:studio
```

ブラウザで http://localhost:5555 にアクセス

## データベーススキーマ

### ER図（Mermaid）

```mermaid
erDiagram
    Sales ||--o{ DailyReport : "作成する"
    Sales ||--o{ Customer : "担当する"
    Sales ||--o{ Comment : "投稿する"
    Sales ||--o{ Sales : "管理する（上長-部下）"
    DailyReport ||--o{ VisitRecord : "含む"
    DailyReport ||--o{ Comment : "受ける"
    Customer ||--o{ VisitRecord : "訪問される"

    Sales {
        int sales_id PK
        string sales_name
        string email UK
        string password
        string department
        int manager_id FK
        datetime created_at
        datetime updated_at
    }

    Customer {
        int customer_id PK
        string customer_name
        string address
        string phone
        string industry
        int sales_id FK
        datetime created_at
        datetime updated_at
    }

    DailyReport {
        int report_id PK
        int sales_id FK
        date report_date
        text problem
        text plan
        enum status
        datetime created_at
        datetime updated_at
    }

    VisitRecord {
        int visit_id PK
        int report_id FK
        int customer_id FK
        time visit_time
        text visit_content
        datetime created_at
        datetime updated_at
    }

    Comment {
        int comment_id PK
        int report_id FK
        int commenter_id FK
        text comment_content
        datetime created_at
        datetime updated_at
    }
```

## テーブル定義

### Sales（営業マスタ）

| カラム名   | 型           | 制約                    | 説明                     |
| ---------- | ------------ | ----------------------- | ------------------------ |
| sales_id   | INT          | PK, AUTO_INCREMENT      | 営業ID                   |
| sales_name | VARCHAR(100) | NOT NULL                | 営業名                   |
| email      | VARCHAR(255) | NOT NULL, UNIQUE        | メールアドレス           |
| password   | VARCHAR(255) | NOT NULL                | パスワード（ハッシュ化） |
| department | VARCHAR(100) | NULL                    | 部門                     |
| manager_id | INT          | FK(sales.sales_id)      | 上長ID（自己参照）       |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 作成日時                 |
| updated_at | TIMESTAMP    | NOT NULL                | 更新日時                 |

**インデックス**:

- `idx_manager_id` on `manager_id`

**制約**:

- Self-referential FK: `manager_id` → `sales_id`
- `onDelete: NoAction, onUpdate: NoAction` (循環参照防止)

---

### Customer（顧客マスタ）

| カラム名      | 型           | 制約                         | 説明       |
| ------------- | ------------ | ---------------------------- | ---------- |
| customer_id   | INT          | PK, AUTO_INCREMENT           | 顧客ID     |
| customer_name | VARCHAR(200) | NOT NULL                     | 顧客名     |
| address       | VARCHAR(500) | NULL                         | 住所       |
| phone         | VARCHAR(50)  | NULL                         | 電話番号   |
| industry      | VARCHAR(100) | NULL                         | 業種       |
| sales_id      | INT          | FK(sales.sales_id), NOT NULL | 担当営業ID |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()      | 作成日時   |
| updated_at    | TIMESTAMP    | NOT NULL                     | 更新日時   |

**インデックス**:

- `idx_sales_id` on `sales_id`

---

### DailyReport（日報）

| カラム名    | 型                         | 制約                         | 説明             |
| ----------- | -------------------------- | ---------------------------- | ---------------- |
| report_id   | INT                        | PK, AUTO_INCREMENT           | 日報ID           |
| sales_id    | INT                        | FK(sales.sales_id), NOT NULL | 営業ID           |
| report_date | DATE                       | NOT NULL                     | 報告日           |
| problem     | TEXT                       | NULL                         | 今日の課題・相談 |
| plan        | TEXT                       | NULL                         | 明日やること     |
| status      | ENUM('draft', 'submitted') | NOT NULL, DEFAULT 'draft'    | ステータス       |
| created_at  | TIMESTAMP                  | NOT NULL, DEFAULT NOW()      | 作成日時         |
| updated_at  | TIMESTAMP                  | NOT NULL                     | 更新日時         |

**インデックス**:

- `idx_sales_id` on `sales_id`
- `idx_report_date` on `report_date`

**制約**:

- UNIQUE: `(sales_id, report_date)` - 1営業につき1日1件

---

### VisitRecord（訪問記録）

| カラム名      | 型        | 制約                                  | 説明       |
| ------------- | --------- | ------------------------------------- | ---------- |
| visit_id      | INT       | PK, AUTO_INCREMENT                    | 訪問記録ID |
| report_id     | INT       | FK(daily_reports.report_id), NOT NULL | 日報ID     |
| customer_id   | INT       | FK(customers.customer_id), NOT NULL   | 顧客ID     |
| visit_time    | TIME      | NOT NULL                              | 訪問時刻   |
| visit_content | TEXT      | NOT NULL                              | 訪問内容   |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()               | 作成日時   |
| updated_at    | TIMESTAMP | NOT NULL                              | 更新日時   |

**インデックス**:

- `idx_report_id` on `report_id`
- `idx_customer_id` on `customer_id`

**制約**:

- `onDelete: Cascade` - 日報削除時に訪問記録も削除

---

### Comment（コメント）

| カラム名        | 型        | 制約                                  | 説明         |
| --------------- | --------- | ------------------------------------- | ------------ |
| comment_id      | INT       | PK, AUTO_INCREMENT                    | コメントID   |
| report_id       | INT       | FK(daily_reports.report_id), NOT NULL | 日報ID       |
| commenter_id    | INT       | FK(sales.sales_id), NOT NULL          | コメント者ID |
| comment_content | TEXT      | NOT NULL                              | コメント内容 |
| created_at      | TIMESTAMP | NOT NULL, DEFAULT NOW()               | 作成日時     |
| updated_at      | TIMESTAMP | NOT NULL                              | 更新日時     |

**インデックス**:

- `idx_report_id` on `report_id`
- `idx_commenter_id` on `commenter_id`

**制約**:

- `onDelete: Cascade` - 日報削除時にコメントも削除

---

## 主要なクエリ例

### 日報一覧取得（自分）

```typescript
const reports = await prisma.dailyReport.findMany({
  where: {
    salesId: currentUserId,
    reportDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  include: {
    visitRecords: {
      include: {
        customer: true,
      },
    },
    comments: {
      include: {
        commenter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
  orderBy: {
    reportDate: 'desc',
  },
});
```

### 部下の日報取得（上長）

```typescript
const subordinateReports = await prisma.dailyReport.findMany({
  where: {
    sales: {
      managerId: currentUserId,
    },
    reportDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  include: {
    sales: {
      select: {
        id: true,
        name: true,
      },
    },
    visitRecords: true,
    comments: true,
  },
});
```

### 顧客への訪問履歴取得

```typescript
const customerVisits = await prisma.visitRecord.findMany({
  where: {
    customerId: customerId,
  },
  include: {
    dailyReport: {
      include: {
        sales: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

## トラブルシューティング

### マイグレーションエラー

```bash
# マイグレーションをリセット
npm run db:reset

# または強制的にプッシュ
npm run db:push
```

### Prisma Clientの再生成

スキーマを変更した後は必ず：

```bash
npm run prisma:generate
```

### データベース接続エラー

- `.env`ファイルの`DATABASE_URL`が正しいか確認
- PostgreSQLが起動しているか確認
- データベースが存在するか確認

## Docker Compose（オプション）

開発用にPostgreSQLをDockerで起動する場合：

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sales_daily_report
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

起動：

```bash
docker-compose up -d
```
