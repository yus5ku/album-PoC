# API統合記録

## 概要

2025年10月2日に、別々に管理されていたExpress.js APIサーバーとNext.jsウェブアプリケーションを統合しました。

## 統合前の構成

- **Web**: Next.js アプリケーション (ポート 3000)
- **API**: Express.js サーバー (ポート 3001)
- **DB**: MySQL (ポート 3306)

## 統合後の構成

- **Web**: Next.js アプリケーション + API Routes (ポート 3000)
- **DB**: MySQL (ポート 3306)

## 移行内容

### 1. データベーススキーマ統合
- APIサーバーのPrismaスキーマをWebアプリに統合
- 画像分析機能（category, confidence, colors, analyzed）を追加
- NextAuth用のテーブル（Account, Session）を維持

### 2. ライブラリ移行
- `src/lib/db.ts` - Prismaクライアント
- `src/lib/storage.ts` - ストレージ抽象化（S3/ローカル）
- `src/lib/image-analysis.ts` - 画像分析機能
- `src/types/api.ts` - 型定義

### 3. サービス層移行
- `src/lib/services/album.service.ts` - アルバム管理
- `src/lib/services/media.service.ts` - メディア管理

### 4. API Routes作成
- `/api/albums` - アルバムCRUD
- `/api/albums/[id]` - アルバム詳細操作
- `/api/media/upload` - メディアアップロード
- `/api/media/[id]` - メディア詳細操作
- `/api/media/category/[category]` - カテゴリ別取得
- `/api/media/stats/categories` - カテゴリ統計
- `/api/media/landscape` - 風景写真
- `/api/media/portrait` - 人物写真
- `/api/media/food` - 食べ物写真
- `/api/health` - ヘルスチェック

### 5. 認証統合
- `src/lib/auth-helpers.ts` - NextAuth統合認証ヘルパー
- JWT認証からNextAuthセッション認証に移行

### 6. フロントエンド更新
- `src/lib/api.ts` - 内部API Routes使用に変更
- 外部APIサーバーへの依存を削除

### 7. Docker設定更新
- `compose.yml` - APIサーバーコンテナを削除
- `compose.prod.yml` - プロダクション設定も更新
- 環境変数をWebアプリに統合

## メリット

1. **シンプルな構成**: 単一のNext.jsアプリケーション
2. **開発効率**: 1つのサーバーで完結
3. **デプロイ簡素化**: Vercel等への簡単デプロイ
4. **認証統合**: NextAuthとの完全統合
5. **型安全性**: フロントエンドとバックエンドの型共有

## 保存されたファイル

レガシーAPIサーバーの重要なファイルは以下に保存されています：

- `docs/legacy-api/ARCHITECTURE.md` - 元のアーキテクチャドキュメント
- `docs/legacy-api/CHANGES.md` - 変更履歴
- `docs/legacy-api/SETUP_GUIDE.md` - セットアップガイド
- `docs/legacy-api/openapi/` - OpenAPI仕様

## 次のステップ

1. 依存関係のインストール: `npm install`
2. Prismaマイグレーション: `npx prisma migrate dev`
3. 開発サーバー起動: `npm run dev`
4. 動作確認とテスト
5. 不要になったAPIディレクトリの削除

## 注意事項

- 画像分析機能には`sharp`パッケージが必要
- ストレージ機能にはS3またはローカルストレージの設定が必要
- 環境変数の設定を忘れずに行う
