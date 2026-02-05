# API仕様書 - 営業日報システム

## ベースURL

```
https://api.example.com/v1
```

## 認証方式

- JWT (JSON Web Token) を使用
- ログイン時にトークンを発行
- 以降のリクエストはヘッダーに `Authorization: Bearer {token}` を付与

---

## 1. 認証API

### 1.1 ログイン

```
POST /auth/login
```

**説明**: ユーザー認証を行い、JWTトークンを発行

**リクエストボディ**:

```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "sales_id": 1,
      "sales_name": "山田太郎",
      "email": "yamada@example.com",
      "department": "営業1課",
      "manager_id": 10
    }
  }
}
```

**エラーレスポンス** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### 1.2 ログアウト

```
POST /auth/logout
```

**説明**: ログアウト処理（トークンの無効化）

**ヘッダー**:

```
Authorization: Bearer {token}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

---

### 1.3 トークン更新

```
POST /auth/refresh
```

**説明**: JWTトークンをリフレッシュ

**ヘッダー**:

```
Authorization: Bearer {token}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. 日報API

### 2.1 日報一覧取得（自分）

```
GET /daily-reports
```

**説明**: ログインユーザーの日報一覧を取得

**認証**: 必要

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| start_date | date | ○ | 開始日 (YYYY-MM-DD) |
| end_date | date | ○ | 終了日 (YYYY-MM-DD) |
| page | integer | × | ページ番号（デフォルト: 1） |
| limit | integer | × | 1ページあたりの件数（デフォルト: 20） |

**リクエスト例**:

```
GET /daily-reports?start_date=2026-02-01&end_date=2026-02-05&page=1&limit=20
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": 123,
        "sales_id": 1,
        "sales_name": "山田太郎",
        "report_date": "2026-02-04",
        "problem": "ABC商事の予算が厳しいため、値引き交渉が必要。",
        "plan": "ABC商事に見積もり再提出\nDEF株式会社にアポイント電話",
        "visit_count": 3,
        "comment_count": 1,
        "status": "submitted",
        "created_at": "2026-02-04T09:30:00Z",
        "updated_at": "2026-02-04T18:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 95,
      "limit": 20
    }
  }
}
```

---

### 2.2 日報一覧取得（部下）

```
GET /daily-reports/subordinates
```

**説明**: 部下の日報一覧を取得（上長のみ）

**認証**: 必要（上長権限）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| start_date | date | ○ | 開始日 (YYYY-MM-DD) |
| end_date | date | ○ | 終了日 (YYYY-MM-DD) |
| sales_id | integer | × | 特定の部下でフィルタ |
| page | integer | × | ページ番号（デフォルト: 1） |
| limit | integer | × | 1ページあたりの件数（デフォルト: 20） |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": 124,
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "report_date": "2026-02-04",
        "problem": "...",
        "plan": "...",
        "visit_count": 2,
        "comment_count": 0,
        "status": "submitted",
        "has_comment_from_manager": false,
        "created_at": "2026-02-04T10:00:00Z",
        "updated_at": "2026-02-04T17:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45,
      "limit": 20
    }
  }
}
```

---

### 2.3 日報詳細取得

```
GET /daily-reports/{report_id}
```

**説明**: 指定した日報の詳細を取得

**認証**: 必要（本人または上長）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| report_id | integer | 日報ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "report": {
      "report_id": 123,
      "sales_id": 1,
      "sales_name": "山田太郎",
      "report_date": "2026-02-04",
      "problem": "ABC商事の予算が厳しいため、値引き交渉が必要。",
      "plan": "ABC商事に見積もり再提出\nDEF株式会社にアポイント電話",
      "status": "submitted",
      "created_at": "2026-02-04T09:30:00Z",
      "updated_at": "2026-02-04T18:00:00Z",
      "visits": [
        {
          "visit_id": 301,
          "customer_id": 50,
          "customer_name": "ABC商事",
          "visit_time": "10:00:00",
          "visit_content": "新商品の提案を実施。好感触を得た。",
          "created_at": "2026-02-04T09:35:00Z"
        },
        {
          "visit_id": 302,
          "customer_id": 51,
          "customer_name": "XYZ株式会社",
          "visit_time": "14:00:00",
          "visit_content": "契約更新について相談。価格交渉中。",
          "created_at": "2026-02-04T09:40:00Z"
        }
      ],
      "comments": [
        {
          "comment_id": 201,
          "commenter_id": 10,
          "commenter_name": "田中課長",
          "comment_content": "ABC商事の値引きは10%までOKです。頑張って！",
          "created_at": "2026-02-04T18:30:00Z"
        }
      ]
    }
  }
}
```

**エラーレスポンス** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "日報が見つかりません"
  }
}
```

---

### 2.4 日報登録

```
POST /daily-reports
```

**説明**: 新規日報を作成

**認証**: 必要

**リクエストボディ**:

```json
{
  "report_date": "2026-02-05",
  "problem": "今日の課題や相談内容",
  "plan": "明日やること",
  "status": "draft"
}
```

**フィールド説明**:
| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| report_date | date | ○ | 報告日 (YYYY-MM-DD) |
| problem | text | × | 今日の課題・相談 |
| plan | text | × | 明日やること |
| status | string | ○ | ステータス (draft: 下書き, submitted: 提出済) |

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "report_id": 125,
    "sales_id": 1,
    "report_date": "2026-02-05",
    "problem": "今日の課題や相談内容",
    "plan": "明日やること",
    "status": "draft",
    "created_at": "2026-02-05T09:00:00Z",
    "updated_at": "2026-02-05T09:00:00Z"
  }
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "この日付の日報は既に登録されています"
  }
}
```

---

### 2.5 日報更新

```
PUT /daily-reports/{report_id}
```

**説明**: 既存の日報を更新

**認証**: 必要（本人のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| report_id | integer | 日報ID |

**リクエストボディ**:

```json
{
  "problem": "更新した課題内容",
  "plan": "更新した明日の予定",
  "status": "submitted"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "report_id": 125,
    "sales_id": 1,
    "report_date": "2026-02-05",
    "problem": "更新した課題内容",
    "plan": "更新した明日の予定",
    "status": "submitted",
    "created_at": "2026-02-05T09:00:00Z",
    "updated_at": "2026-02-05T10:30:00Z"
  }
}
```

---

### 2.6 日報削除

```
DELETE /daily-reports/{report_id}
```

**説明**: 日報を削除（下書きのみ削除可能）

**認証**: 必要（本人のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| report_id | integer | 日報ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "日報を削除しました"
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SUBMITTED",
    "message": "提出済みの日報は削除できません"
  }
}
```

---

## 3. 訪問記録API

### 3.1 訪問記録追加

```
POST /daily-reports/{report_id}/visits
```

**説明**: 日報に訪問記録を追加

**認証**: 必要（日報の作成者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| report_id | integer | 日報ID |

**リクエストボディ**:

```json
{
  "customer_id": 50,
  "visit_time": "10:00:00",
  "visit_content": "新商品の提案を実施。好感触を得た。"
}
```

**フィールド説明**:
| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |
| visit_time | time | ○ | 訪問時刻 (HH:MM:SS) |
| visit_content | text | ○ | 訪問内容 |

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "visit_id": 303,
    "report_id": 125,
    "customer_id": 50,
    "customer_name": "ABC商事",
    "visit_time": "10:00:00",
    "visit_content": "新商品の提案を実施。好感触を得た。",
    "created_at": "2026-02-05T10:05:00Z"
  }
}
```

---

### 3.2 訪問記録更新

```
PUT /visits/{visit_id}
```

**説明**: 訪問記録を更新

**認証**: 必要（日報の作成者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| visit_id | integer | 訪問記録ID |

**リクエストボディ**:

```json
{
  "customer_id": 50,
  "visit_time": "10:30:00",
  "visit_content": "更新した訪問内容"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "visit_id": 303,
    "report_id": 125,
    "customer_id": 50,
    "customer_name": "ABC商事",
    "visit_time": "10:30:00",
    "visit_content": "更新した訪問内容",
    "updated_at": "2026-02-05T11:00:00Z"
  }
}
```

---

### 3.3 訪問記録削除

```
DELETE /visits/{visit_id}
```

**説明**: 訪問記録を削除

**認証**: 必要（日報の作成者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| visit_id | integer | 訪問記録ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "訪問記録を削除しました"
}
```

---

## 4. コメントAPI

### 4.1 コメント追加

```
POST /daily-reports/{report_id}/comments
```

**説明**: 日報にコメントを追加（上長のみ）

**認証**: 必要（上長権限）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| report_id | integer | 日報ID |

**リクエストボディ**:

```json
{
  "comment_content": "ABC商事の値引きは10%までOKです。頑張って！"
}
```

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "comment_id": 202,
    "report_id": 123,
    "commenter_id": 10,
    "commenter_name": "田中課長",
    "comment_content": "ABC商事の値引きは10%までOKです。頑張って！",
    "created_at": "2026-02-05T14:30:00Z"
  }
}
```

**エラーレスポンス** (403 Forbidden):

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "この日報にコメントする権限がありません"
  }
}
```

---

### 4.2 コメント更新

```
PUT /comments/{comment_id}
```

**説明**: コメントを更新

**認証**: 必要（コメント作成者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| comment_id | integer | コメントID |

**リクエストボディ**:

```json
{
  "comment_content": "更新したコメント内容"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "comment_id": 202,
    "report_id": 123,
    "commenter_id": 10,
    "commenter_name": "田中課長",
    "comment_content": "更新したコメント内容",
    "updated_at": "2026-02-05T15:00:00Z"
  }
}
```

---

### 4.3 コメント削除

```
DELETE /comments/{comment_id}
```

**説明**: コメントを削除

**認証**: 必要（コメント作成者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| comment_id | integer | コメントID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "コメントを削除しました"
}
```

---

## 5. 顧客API

### 5.1 顧客一覧取得

```
GET /customers
```

**説明**: 顧客一覧を取得

**認証**: 必要

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| keyword | string | × | 顧客名または業種で検索 |
| sales_id | integer | × | 担当営業でフィルタ |
| page | integer | × | ページ番号（デフォルト: 1） |
| limit | integer | × | 1ページあたりの件数（デフォルト: 20） |

**リクエスト例**:

```
GET /customers?keyword=ABC&page=1&limit=20
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": 50,
        "customer_name": "ABC商事",
        "address": "東京都千代田区...",
        "phone": "03-1234-5678",
        "industry": "製造業",
        "sales_id": 1,
        "sales_name": "山田太郎",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2026-01-20T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 195,
      "limit": 20
    }
  }
}
```

---

### 5.2 顧客詳細取得

```
GET /customers/{customer_id}
```

**説明**: 指定した顧客の詳細と訪問履歴を取得

**認証**: 必要

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| customer_id | integer | 顧客ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer": {
      "customer_id": 50,
      "customer_name": "ABC商事",
      "address": "東京都千代田区...",
      "phone": "03-1234-5678",
      "industry": "製造業",
      "sales_id": 1,
      "sales_name": "山田太郎",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2026-01-20T14:30:00Z"
    },
    "recent_visits": [
      {
        "visit_id": 301,
        "report_id": 123,
        "report_date": "2026-02-04",
        "visit_time": "10:00:00",
        "visit_content": "新商品の提案を実施。好感触を得た。",
        "sales_name": "山田太郎"
      }
    ]
  }
}
```

---

### 5.3 顧客登録

```
POST /customers
```

**説明**: 新規顧客を登録

**認証**: 必要

**リクエストボディ**:

```json
{
  "customer_name": "ABC商事",
  "address": "東京都千代田区...",
  "phone": "03-1234-5678",
  "industry": "製造業",
  "sales_id": 1
}
```

**フィールド説明**:
| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| customer_name | string | ○ | 顧客名 |
| address | string | × | 住所 |
| phone | string | × | 電話番号 |
| industry | string | × | 業種 |
| sales_id | integer | ○ | 担当営業ID |

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "customer_id": 51,
    "customer_name": "ABC商事",
    "address": "東京都千代田区...",
    "phone": "03-1234-5678",
    "industry": "製造業",
    "sales_id": 1,
    "sales_name": "山田太郎",
    "created_at": "2026-02-05T11:00:00Z",
    "updated_at": "2026-02-05T11:00:00Z"
  }
}
```

---

### 5.4 顧客更新

```
PUT /customers/{customer_id}
```

**説明**: 顧客情報を更新

**認証**: 必要

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| customer_id | integer | 顧客ID |

**リクエストボディ**:

```json
{
  "customer_name": "ABC商事株式会社",
  "address": "東京都千代田区...",
  "phone": "03-1234-5678",
  "industry": "製造業",
  "sales_id": 1
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer_id": 51,
    "customer_name": "ABC商事株式会社",
    "address": "東京都千代田区...",
    "phone": "03-1234-5678",
    "industry": "製造業",
    "sales_id": 1,
    "sales_name": "山田太郎",
    "updated_at": "2026-02-05T12:00:00Z"
  }
}
```

---

### 5.5 顧客削除

```
DELETE /customers/{customer_id}
```

**説明**: 顧客を削除（訪問記録がある場合は削除不可）

**認証**: 必要（管理者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| customer_id | integer | 顧客ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "顧客を削除しました"
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_HAS_VISITS",
    "message": "訪問記録が存在する顧客は削除できません"
  }
}
```

---

## 6. 営業API

### 6.1 営業一覧取得

```
GET /sales
```

**説明**: 営業担当者一覧を取得

**認証**: 必要（管理者のみ）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| keyword | string | × | 営業名または部門で検索 |
| page | integer | × | ページ番号（デフォルト: 1） |
| limit | integer | × | 1ページあたりの件数（デフォルト: 20） |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "sales_id": 1,
        "sales_name": "山田太郎",
        "email": "yamada@example.com",
        "department": "営業1課",
        "manager_id": 10,
        "manager_name": "田中課長",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-06-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45,
      "limit": 20
    }
  }
}
```

---

### 6.2 営業詳細取得

```
GET /sales/{sales_id}
```

**説明**: 指定した営業担当者の詳細を取得

**認証**: 必要

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| sales_id | integer | 営業ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "sales": {
      "sales_id": 1,
      "sales_name": "山田太郎",
      "email": "yamada@example.com",
      "department": "営業1課",
      "manager_id": 10,
      "manager_name": "田中課長",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-06-01T10:00:00Z"
    },
    "subordinates": [
      {
        "sales_id": 2,
        "sales_name": "佐藤花子"
      }
    ]
  }
}
```

---

### 6.3 部下一覧取得

```
GET /sales/subordinates
```

**説明**: ログインユーザーの部下一覧を取得

**認証**: 必要（上長のみ）

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "subordinates": [
      {
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "email": "sato@example.com",
        "department": "営業1課"
      },
      {
        "sales_id": 3,
        "sales_name": "鈴木一郎",
        "email": "suzuki@example.com",
        "department": "営業1課"
      }
    ]
  }
}
```

---

### 6.4 営業登録

```
POST /sales
```

**説明**: 新規営業担当者を登録

**認証**: 必要（管理者のみ）

**リクエストボディ**:

```json
{
  "sales_name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123",
  "department": "営業1課",
  "manager_id": 10
}
```

**フィールド説明**:
| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| sales_name | string | ○ | 営業名 |
| email | string | ○ | メールアドレス（ユニーク） |
| password | string | ○ | パスワード（8文字以上） |
| department | string | × | 部門 |
| manager_id | integer | × | 上長ID |

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "sales_id": 15,
    "sales_name": "山田太郎",
    "email": "yamada@example.com",
    "department": "営業1課",
    "manager_id": 10,
    "created_at": "2026-02-05T13:00:00Z",
    "updated_at": "2026-02-05T13:00:00Z"
  }
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

---

### 6.5 営業更新

```
PUT /sales/{sales_id}
```

**説明**: 営業担当者情報を更新

**認証**: 必要（管理者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| sales_id | integer | 営業ID |

**リクエストボディ**:

```json
{
  "sales_name": "山田太郎",
  "email": "yamada@example.com",
  "department": "営業2課",
  "manager_id": 11
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "yamada@example.com",
    "department": "営業2課",
    "manager_id": 11,
    "manager_name": "佐々木部長",
    "updated_at": "2026-02-05T14:00:00Z"
  }
}
```

---

### 6.6 営業削除

```
DELETE /sales/{sales_id}
```

**説明**: 営業担当者を削除（日報や訪問記録がある場合は削除不可）

**認証**: 必要（管理者のみ）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|----------|-----|------|
| sales_id | integer | 営業ID |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "営業担当者を削除しました"
}
```

---

## 7. ダッシュボードAPI

### 7.1 ダッシュボード情報取得

```
GET /dashboard
```

**説明**: ダッシュボード表示用のサマリー情報を取得

**認証**: 必要

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "sales_id": 1,
      "sales_name": "山田太郎"
    },
    "weekly_summary": {
      "visit_count": 12,
      "report_submitted": 4,
      "report_total": 5,
      "unread_comments": 2
    },
    "recent_reports": [
      {
        "report_id": 123,
        "report_date": "2026-02-04",
        "status": "submitted",
        "comment_count": 1
      }
    ],
    "subordinate_reports": [
      {
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "report_id": 124,
        "report_date": "2026-02-04",
        "status": "submitted"
      }
    ]
  }
}
```

---

## 8. 共通仕様

### HTTPステータスコード

| コード | 説明                                   |
| ------ | -------------------------------------- |
| 200    | OK - 成功                              |
| 201    | Created - 作成成功                     |
| 400    | Bad Request - リクエストエラー         |
| 401    | Unauthorized - 認証エラー              |
| 403    | Forbidden - 権限エラー                 |
| 404    | Not Found - リソースが見つからない     |
| 500    | Internal Server Error - サーバーエラー |

### エラーレスポンス形式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {
      "field": "エラー詳細"
    }
  }
}
```

### ページネーション形式

```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 195,
    "limit": 20
  }
}
```

### 日時フォーマット

- 日付: `YYYY-MM-DD` (例: 2026-02-05)
- 時刻: `HH:MM:SS` (例: 14:30:00)
- 日時: ISO 8601形式 `YYYY-MM-DDTHH:MM:SSZ` (例: 2026-02-05T14:30:00Z)
