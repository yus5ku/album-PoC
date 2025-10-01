# インストールガイド

## ⚠️ 重要: 初回セットアップ

APIディレクトリで現在表示されているTypeScriptエラーは、**依存関係がインストールされていない**ことが原因です。

以下の手順で解決できます：

## 🚀 セットアップ手順

### 1. APIディレクトリへ移動
```bash
cd /Users/watanabeyuusaku/Desktop/album-video-main/api
```

### 2. 依存関係をインストール
```bash
npm install
```

これにより、以下がインストールされます：
- Express.js（Webフレームワーク）
- Prisma（ORM）
- TypeScript型定義（@types/node, @types/express など）
- その他の依存パッケージ

### 3. 環境変数を設定
```bash
cp .env.example .env
```

`.env` ファイルを編集して、適切な値を設定してください：
```env
DATABASE_URL="mysql://album:album@localhost:3306/album"
NEXTAUTH_SECRET=your_random_secret_here
JWT_SECRET=your_random_secret_here
PORT=3001
STORAGE_DRIVER=local
```

**注意**: `.env.example` ファイルが存在しない場合は、上記の内容で `.env` を作成してください。

### 4. データベースを起動
プロジェクトルートから：
```bash
cd ..
docker compose up -d mysql
```

### 5. Prismaをセットアップ
```bash
cd api
npm run prisma:generate
npm run prisma:migrate
```

### 6. 開発サーバーを起動
```bash
npm run dev
```

## ✅ 確認方法

ブラウザまたはcurlで以下にアクセス：
```bash
curl http://localhost:3001/health
```

レスポンス例：
```json
{"ok":true,"ts":"2025-10-01T12:00:00.000Z"}
```

## 🐛 トラブルシューティング

### エラー: Cannot find module 'express'
→ `npm install` を実行してください

### エラー: モジュールが見つかりません
→ 依存関係が正しくインストールされていません。`npm install` を再実行してください

### エラー: DATABASE_URL が設定されていません
→ `.env` ファイルを作成して、`DATABASE_URL` を設定してください

### エラー: Port 3001 is already in use
→ `.env` で別のポートを指定するか、既存のプロセスを終了してください

### TypeScriptエラーが表示される
→ `npm install` 後、エディタを再起動してください

## 📚 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください：

- **SETUP_GUIDE.md**: 詳細なセットアップガイド
- **ARCHITECTURE.md**: アーキテクチャの説明
- **README.md**: 基本的な使い方
- **openapi/openapi.yaml**: API仕様

## 🔧 便利なコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Prisma Studio（DB GUI）
npm run prisma:studio

# すべてクリーンアップ
make clean
```

## 📝 メモ

- Node.js v22以上が必要です
- Voltaを使用している場合、自動的に正しいバージョンが使用されます
- 初回のマイグレーション実行時、マイグレーション名を聞かれたら `init` などと入力してください

