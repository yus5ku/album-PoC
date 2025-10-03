# Album Video

写真・動画の管理とスライドショー生成機能を持つアルバムアプリケーションです。Next.js 15のApp Routerを使用したフルスタックアプリケーションとして構築されています。

## 技術スタック

### Frontend & Backend
- **Next.js 15** (App Router) - フロントエンドとAPIルート
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **React 19** - UIライブラリ
- **NextAuth.js** - 認証（LINE認証対応）

### Database & ORM
- **MySQL 8.0** - データベース
- **Prisma** - ORM

### Infrastructure
- **MySQL** - データベース（ローカル/本番）
- **AWS S3** - ファイルストレージ（本番環境）
- **ローカルファイルシステム** - ファイルストレージ（開発環境）
- **Sharp** - 画像処理

### 開発環境
- **Node.js** - ランタイム
- **Homebrew** - パッケージ管理（macOS）
- **ESLint** - コード品質

## 主要機能

### 認証
- LINE認証による安全なログイン
- NextAuth.jsによるセッション管理

### メディア管理
- 写真・動画のアップロード
- 画像の自動分析とカテゴリ分類
- メタデータ管理（サイズ、形式、撮影日時など）
- タグ・キャプション機能

### アルバム機能
- アルバムの作成・編集・削除
- メディアの整理・分類
- 公開・非公開設定

### 画像分析
- 自動カテゴリ分類（風景、ポートレート、食べ物など）
- 支配的な色の抽出
- 信頼度スコア

## 📁 プロジェクト構成
```
album-video-main/
├── web/                           # Next.js アプリケーション
│   ├── src/
│   │   ├── app/                   # App Router
│   │   │   ├── albums/            # アルバム関連ページ
│   │   │   ├── api/               # API Routes
│   │   │   │   ├── albums/        # アルバム API
│   │   │   │   ├── auth/          # 認証 API (NextAuth)
│   │   │   │   ├── health/        # ヘルスチェック
│   │   │   │   └── media/         # メディア API
│   │   │   ├── auth/              # 認証ページ
│   │   │   ├── photo/             # 写真詳細ページ
│   │   │   ├── photo-picker/      # 写真選択ページ
│   │   │   └── upload/            # アップロードページ
│   │   ├── components/            # React コンポーネント
│   │   │   └── ui/                # UI コンポーネント
│   │   ├── lib/                   # ユーティリティ・サービス
│   │   │   ├── services/          # ビジネスロジック
│   │   │   ├── auth.ts            # NextAuth 設定
│   │   │   ├── db.ts              # Prisma Client
│   │   │   ├── storage.ts         # ファイルストレージ
│   │   │   └── image-analysis.ts  # 画像分析
│   │   └── types/                 # TypeScript 型定義
│   ├── prisma/                    # データベーススキーマ
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/                    # 静的ファイル
│   └── docs/                      # ドキュメント
├── docs/                          # プロジェクトドキュメント
│   ├── ui/                        # 画面設計図
│   └── requirements/              # 要件定義
├── test/                          # テストファイル
├── uploads/                       # ローカルファイルアップロード
├── .env                           # 環境変数設定
├── Makefile                       # 開発用コマンド
└── README.md
```

## 🧩 API Routes（Next.js App Router）

Next.js 15のApp Routerを使用してAPIエンドポイントを実装しています。

### 主要エンドポイント

| メソッド | パス | 説明 | 実装場所 |
|---|---|---|---|
| GET | `/api/health` | ヘルスチェック | `web/src/app/api/health/route.ts` |
| GET | `/api/albums` | アルバム一覧取得 | `web/src/app/api/albums/route.ts` |
| POST | `/api/albums` | アルバム作成 | `web/src/app/api/albums/route.ts` |
| GET | `/api/albums/[id]` | アルバム詳細取得 | `web/src/app/api/albums/[id]/route.ts` |
| PUT | `/api/albums/[id]` | アルバム更新 | `web/src/app/api/albums/[id]/route.ts` |
| DELETE | `/api/albums/[id]` | アルバム削除 | `web/src/app/api/albums/[id]/route.ts` |
| POST | `/api/media/upload` | メディアアップロード | `web/src/app/api/media/upload/route.ts` |
| GET | `/api/media/[id]` | メディア詳細取得 | `web/src/app/api/media/[id]/route.ts` |
| DELETE | `/api/media/[id]` | メディア削除 | `web/src/app/api/media/[id]/route.ts` |
| GET | `/api/media/category/[category]` | カテゴリ別メディア取得 | `web/src/app/api/media/category/[category]/route.ts` |
| GET | `/api/media/stats/categories` | カテゴリ統計情報 | `web/src/app/api/media/stats/categories/route.ts` |

### 認証API
| メソッド | パス | 説明 |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js認証エンドポイント |

## 🛠️ 開発環境セットアップ

### 前提条件
- **Node.js** - JavaScript/TypeScriptランタイム
- **MySQL** - データベース
- **Homebrew** - パッケージ管理（macOS）
- **Git** - バージョン管理

### 1. MySQLのインストールと設定

```bash
# MySQLをインストール
brew install mysql

# MySQLサービスを開始
brew services start mysql

# データベースとユーザーを作成
mysql -u root -e "CREATE DATABASE IF NOT EXISTS album_video; CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'app_password'; GRANT ALL PRIVILEGES ON album_video.* TO 'app_user'@'localhost'; FLUSH PRIVILEGES;"
```

### 2. 環境変数設定

プロジェクトルートに `.env` ファイルを作成してください：

```bash
# データベース設定（ローカルMySQL）
DATABASE_URL="mysql://app_user:app_password@localhost:3306/album_video"

# NextAuth設定
NEXTAUTH_SECRET=your_nextauth_secret_change_in_production
NEXTAUTH_URL=http://localhost:3000

# LINE認証設定（オプション）
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=

# ストレージ設定（ローカルファイルシステム）
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=./uploads

# S3設定（本番環境用 - 開発時は空でOK）
S3_ENDPOINT=
S3_REGION=ap-northeast-1
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=

# JWT設定
JWT_SECRET=your_jwt_secret_change_in_production

# 開発環境設定
NODE_ENV=development
TZ=Asia/Tokyo
```

### 3. アプリケーションの起動

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd album-video-main

# 2. 環境変数ファイルを作成（上記の設定を参考に）
# .env ファイルを作成

# 3. アップロード用ディレクトリを作成
mkdir -p uploads

# 4. webディレクトリに移動して依存関係をインストール
cd web
npm install

# 5. データベースマイグレーション（初回のみ）
npx prisma migrate dev

# 6. 開発サーバーを起動
npm run dev
```

### 開発用コマンド

```bash
# webディレクトリ内で実行

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint

# Prismaスキーマ更新
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev
```

### アクセス情報

- **Webアプリケーション**: http://localhost:3000
- **データベース**: localhost:3306 (MySQL)
- **ファイルアップロード**: `./uploads` (プロジェクトルート)

## 📚 ドキュメント

### プロジェクト関連
- **プロジェクト概要**: `README.md` - このファイル
- **画面設計図**: `docs/ui/` - UI/UXデザイン
- **要件定義書**: `docs/requirements/` - 機能要件・非機能要件

### 技術ドキュメント
- **API統合ガイド**: `web/docs/API_INTEGRATION.md` - API使用方法
- **削除機能**: `web/docs/DELETE_FEATURE.md` - 削除機能の仕様
- **LINE認証設定**: `web/docs/LINE_AUTH_SETUP.md` - LINE認証の設定方法
- **レガシーAPI**: `web/docs/legacy-api/` - 過去のAPI仕様

### データベース
- **スキーマ定義**: `web/prisma/schema.prisma` - Prismaスキーマ
- **マイグレーション**: `web/prisma/migrations/` - データベース変更履歴

## 🧪 テスト

現在テストファイルは `test/` ディレクトリに配置予定です。

## 🔧 便利なコマンド

### Makefileコマンド

```bash
# 依存関係インストール
make install

# MySQLサービス管理
brew services start mysql   # MySQL開始
brew services stop mysql    # MySQL停止
brew services restart mysql # MySQL再起動

# データベース操作
mysql -u app_user -p album_video  # データベース接続
```

## 🚀 デプロイ

### 本番環境
- **フロントエンド**: Vercel（推奨）
- **データベース**: MySQL 8.0（クラウドサービス）
- **ファイルストレージ**: AWS S3

### 本番環境での設定
本番環境では以下の環境変数を適切に設定してください：
- `DATABASE_URL`: 本番データベースの接続文字列
- `NEXTAUTH_SECRET`: 本番用の秘密鍵
- `S3_*`: AWS S3の設定情報

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/your-feature`
3. 変更をコミット: `git commit -m "feat: add your feature"`
4. ブランチをプッシュ: `git push origin feature/your-feature`
5. Pull Requestを作成

## 📄 ライセンス

MIT License
