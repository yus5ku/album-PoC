## 動かし方（API）

### 前提
- Node.js 22 / npm (Voltaで管理推奨)
- Docker & Docker Compose
- `.env` を `api/` 直下に作成（`.env.example` をコピー）

### セットアップ
```bash
# DB 起動（プロジェクトルートから）
docker compose up -d mysql

# APIディレクトリへ移動
cd api

# 依存関係のインストール
npm install

# Prisma クライアント生成
npm run prisma:generate

# データベースマイグレーション
npm run prisma:migrate

# 開発サーバー起動
npm run dev
```

### 本番ビルド
```bash
npm run build
npm start
```

### 環境変数
`.env.example` をコピーして `.env` を作成し、以下の値を設定してください：

```env
DATABASE_URL="mysql://album:album@localhost:3306/album"
NEXTAUTH_SECRET=your_random_secret_here
JWT_SECRET=your_random_secret_here
PORT=3001
STORAGE_DRIVER=local
```

### API エンドポイント
- `GET /health` - ヘルスチェック
- `GET /albums` - アルバム一覧取得
- `POST /albums` - アルバム作成
- `GET /albums/:id` - アルバム詳細取得
- `PATCH /albums/:id` - アルバム更新
- `DELETE /albums/:id` - アルバム削除
- `POST /media/upload` - メディアアップロード
- `GET /media/:id` - メディア詳細取得
- `DELETE /media/:id` - メディア削除
- `POST /slideshow` - スライドショー生成
- `GET /slideshow/:jobId` - スライドショージョブ状態取得

詳細は `/api/openapi/openapi.yaml` を参照してください。