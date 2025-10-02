# Album Video API - セットアップガイド

## 📋 前提条件

以下がインストールされていることを確認してください：

- **Node.js** v22以上（Voltaで管理推奨）
- **Docker & Docker Compose**
- **Git**

## 🚀 クイックスタート

### 1. 環境変数の設定

`.env` ファイルを作成します：

```bash
cd api
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="mysql://album:album@localhost:3306/album"

# Authentication
NEXTAUTH_SECRET=your_random_secret_key_change_me
JWT_SECRET=your_random_secret_key_change_me

# Server Configuration
PORT=3001
NODE_ENV=development

# Storage Configuration
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=./.storage
EOF
```

**重要**: `NEXTAUTH_SECRET` と `JWT_SECRET` は本番環境では必ず変更してください！

### 2. データベースの起動

プロジェクトルートから MySQL コンテナを起動：

```bash
cd ..  # プロジェクトルートへ
docker compose up -d mysql
```

データベースが起動するまで数秒待ちます。

### 3. 依存関係のインストール

```bash
cd api
npm install
```

### 4. Prisma のセットアップ

```bash
# Prisma クライアントを生成
npm run prisma:generate

# データベースマイグレーションを実行
npm run prisma:migrate
```

マイグレーション名を聞かれたら、例: `init` と入力してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

サーバーが起動したら、ブラウザで http://localhost:3001/health にアクセスして動作確認できます。

## 🔧 利用可能なコマンド

### npm スクリプト

```bash
npm run dev              # 開発サーバー起動（ホットリロード対応）
npm run build            # 本番用ビルド
npm start                # 本番サーバー起動
npm run prisma:generate  # Prisma クライアント生成
npm run prisma:migrate   # マイグレーション実行
npm run prisma:deploy    # 本番マイグレーション
npm run prisma:studio    # Prisma Studio 起動（DB GUI）
```

### Make コマンド

```bash
make help            # ヘルプ表示
make install         # 依存関係インストール
make dev             # 開発サーバー起動
make build           # ビルド
make prisma-studio   # Prisma Studio 起動
make clean           # クリーンアップ
```

## 📝 API エンドポイント

### ヘルスチェック
```
GET /health
```

### アルバム管理
```
GET    /albums          - アルバム一覧
POST   /albums          - アルバム作成
GET    /albums/:id      - アルバム詳細
PATCH  /albums/:id      - アルバム更新
DELETE /albums/:id      - アルバム削除
```

### メディア管理
```
POST   /media/upload    - メディアアップロード
GET    /media/:id       - メディア詳細
DELETE /media/:id       - メディア削除
```

### スライドショー
```
POST   /slideshow       - スライドショー生成
GET    /slideshow/:jobId - ジョブ状態確認
```

詳細は `/api/openapi/openapi.yaml` を参照してください。

## 🔐 認証

APIは JWT トークンベースの認証を使用します。

リクエストヘッダーに以下を含めてください：

```
Authorization: Bearer <jwt_token>
```

トークンは NextAuth.js（フロントエンド）から取得します。

## 🗄️ データベース管理

### Prisma Studio でデータを確認

```bash
npm run prisma:studio
```

ブラウザで http://localhost:5555 が開きます。

### マイグレーションの作成

スキーマを変更した後：

```bash
npm run prisma:migrate
```

### データベースのリセット（開発時のみ）

```bash
cd prisma
npx prisma migrate reset
```

**警告**: すべてのデータが削除されます！

## 📦 ストレージ設定

### ローカルストレージ（デフォルト）

```env
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=./.storage
```

ファイルは `.storage/` ディレクトリに保存されます。

### S3/MinIO ストレージ

```env
STORAGE_DRIVER=s3
S3_ENDPOINT=http://localhost:9000
S3_REGION=ap-northeast-1
S3_BUCKET=album-media
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
```

## 🐛 トラブルシューティング

### データベース接続エラー

1. MySQL が起動しているか確認：
   ```bash
   docker compose ps
   ```

2. `DATABASE_URL` が正しいか確認

3. コンテナのログを確認：
   ```bash
   docker compose logs mysql
   ```

### Prisma エラー

Prisma クライアントを再生成：
```bash
npm run prisma:generate
```

### ポート衝突

`.env` で `PORT` を変更：
```env
PORT=3002
```

## 📚 参考リンク

- [Express.js ドキュメント](https://expressjs.com/)
- [Prisma ドキュメント](https://www.prisma.io/docs/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)

## 🤝 サポート

問題が発生した場合は、プロジェクトの README.md を参照してください。

