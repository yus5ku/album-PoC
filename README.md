# Album Video (album-PoC)
ビデオ処理機能を持つアルバムアプリケーションです。Web（Next.js）と API（Express/Prisma）、2つの主要コンポーネントで構成されたモノレポ構造です。

## 技術スタック
### Frontend (Web)
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- NextAuth.js（LINE認証）

### Backend (API) — **album-video-api（写真保管・処理用）**
- Node.js v22（Voltaで管理）
- Express.js
- TypeScript
- MySQL 8.0
- Prisma ORM
- Passport.js（**必要に応じて** LINE 認証連携。※APIの主目的は *アルバム/写真/動画* の保管と処理）

### Infrastructure
- Docker & Docker Compose
- MySQL 8.0

### デプロイ
- Frontend: Vercel
- Backend: Nginx + PM2（Node.jsアプリを常駐）
- Database: MySQL（本番）

### 開発環境
- Node.js v22系（Volta）
- Docker & Docker Compose
- GitHub（バージョン管理）

## 認証
- ログインは **LINE 認証のみ**
  - フロントエンド: NextAuth.js（LINE プロバイダ）
  - バックエンド: Passport.js（**オプション**。API 側でユーザ・セッション検証が必要な場合のみ利用）

## 📁 プロジェクト構成
```
album-video/
├── web/                     # フロントエンド (Next.js)
├── api/                     # バックエンド (Node.js/Express) — album-video-api
│   ├── src/
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── albums.ts         # アルバム CRUD
│   │   │   ├── media.ts          # 画像/動画アップロード・管理
│   │   │   └── slideshow.ts      # 画像→動画の生成ジョブ
│   │   ├── services/
│   │   │   ├── album.service.ts
│   │   │   ├── media.service.ts
│   │   │   └── slideshow.service.ts
│   │   ├── libs/
│   │   │   ├── db.ts             # Prisma Client
│   │   │   ├── storage.ts        # S3/MinIO/ローカル抽象化
│   │   │   └── auth.ts           # （必要なら）Passport/トークン検証
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── openapi/
│       └── openapi.yaml           # APIドキュメント（都度更新）
├── docs/
│   ├── ui/                        # 画面設計図
│   └── requirements/              # 要件定義
├── test/                          # 単体テスト
├── docker-compose.yml             # Docker Compose 設定
├── Makefile                       # 開発用コマンド
└── README.md
```

## 🧩 API の役割（要点）
- **ユーザー/セッション検証（必要なら）**: フロントの NextAuth セッション（JWT など）を検証するミドルウェアを提供
- **アルバム管理**: アルバムの作成・更新・削除・参照、共有設定
- **メディア管理**: 写真/動画のアップロード、メタデータ管理、タグ/キャプション、サムネイル生成
- **スライドショー生成**: 画像群＋トランジション指定→動画生成ジョブ投入、進捗/結果の取得
- **ストレージ抽象化**: 本番は S3 互換、ローカル/開発は MinIO またはローカルFS

### 代表エンドポイント（例）
> 実装は `api/src/routes/*.ts` を参照。

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/health` | ヘルスチェック |
| GET | `/albums` | アルバム一覧 |
| POST | `/albums` | アルバム作成 |
| GET | `/albums/:id` | アルバム詳細 |
| PATCH | `/albums/:id` | アルバム更新 |
| DELETE | `/albums/:id` | アルバム削除 |
| POST | `/media/upload` | 画像/動画アップロード（multipart/form-data）|
| GET | `/media/:id` | メディア詳細（サインドURLなど）|
| DELETE | `/media/:id` | メディア削除 |
| POST | `/slideshow` | スライドショー生成ジョブを作成 |
| GET | `/slideshow/:jobId` | ジョブ進捗・結果取得 |

## 🛠️ 開発環境セットアップ
### 前提条件
- Node.js v22（Volta）
- Docker & Docker Compose
- Make / GitHub アカウント

### 環境変数
`.env` を作成（雛形は `.env.example`）

```bash
cp .env.example .env
```

必要例：
```
# DB
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=album
MYSQL_USER=album
MYSQL_PASSWORD=album

# Prisma
DATABASE_URL="mysql://album:album@localhost:3306/album"

# Auth / Session
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=
JWT_SECRET=change_me
NEXTAUTH_SECRET=change_me
NEXT_PUBLIC_API_BASE=http://localhost:3001

# Storage（必要に応じて）
STORAGE_DRIVER=local          # or s3
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

### 起動方法

#### 方法1: 自動セットアップ（推奨）
```bash
# コンテナ起動
make up

# コンテナ終了
make down

# 初回セットアップ（マイグレーションなど）
make setup
```

#### 方法2: 手動セットアップ（API単体）
```bash
# データベース起動
docker compose up -d mysql

# APIセットアップ
cd api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

**詳細なセットアップ手順**: `api/INSTALL.md` を参照してください

### アクセス
- フロントエンド: http://localhost:3000
- API: http://localhost:3001
- データベース: localhost:3306

## 📚 ドキュメント
### API関連
- **インストールガイド**: `api/INSTALL.md` - 初回セットアップ手順
- **セットアップガイド**: `api/SETUP_GUIDE.md` - 詳細な設定方法
- **アーキテクチャ**: `api/ARCHITECTURE.md` - システム設計と構造
- **API仕様**: `api/openapi/openapi.yaml` - OpenAPI形式のAPI定義
- **基本的な使い方**: `api/README.md`

### その他
- 画面設計図: `docs/ui/`
- 要件定義書: `docs/requirements/`

## 🧪 テスト
- 単体テスト: `test/`
- E2E: `web/e2e/`

## 🔧 開発用コマンド
```bash
make up       # 起動
make down     # 停止
make restart  # 再起動
make build    # 再ビルド
make logs     # ログ（追従）
make clean    # ボリューム含むクリーン
make reset-db # DBリセット（開発用）
```

## 📋 機能
### 認証
- LINE 認証のみ（NextAuth）
- API 側はセッション検証のためのミドルウェアを提供（必要時）

### ビデオ/メディア
- 画像・動画のアップロード/管理
- サムネイル生成、メタデータ管理
- スライドショー生成（FFmpeg 等）

### アルバム
- アルバム作成・編集
- メディアの整理/分類（タグ・キャプション）

### UI/UX
- レスポンシブデザイン（PC優先）

## 🤝 コントリビューション
1. リポジトリをフォーク
2. フィーチャーブランチ作成：`git checkout -b feat/your-feature`
3. 変更コミット：`git commit -m "feat: add your feature"`
4. プッシュ：`git push origin feat/your-feature`
5. Pull Request を作成

## 📄 ライセンス
MIT
