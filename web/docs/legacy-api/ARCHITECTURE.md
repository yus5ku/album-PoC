# Album Video API - アーキテクチャ

## 📁 ディレクトリ構造

```
api/
├── src/
│   ├── index.ts              # アプリケーションエントリーポイント
│   ├── routes/               # ルート定義（エンドポイント）
│   │   ├── health.ts         # ヘルスチェック
│   │   ├── albums.ts         # アルバム CRUD
│   │   ├── media.ts          # メディアアップロード・管理
│   │   └── slideshow.ts      # スライドショー生成
│   ├── services/             # ビジネスロジック
│   │   ├── album.service.ts
│   │   ├── media.service.ts
│   │   └── slideshow.service.ts
│   └── libs/                 # ユーティリティ・共通機能
│       ├── db.ts             # Prisma クライアント
│       ├── auth.ts           # 認証ミドルウェア（JWT検証）
│       ├── storage.ts        # ストレージ抽象化（S3/ローカル）
│       ├── slideshow.ts      # スライドショージョブ管理
│       └── types.ts          # TypeScript 型定義
├── prisma/
│   ├── schema.prisma         # データベーススキーマ定義
│   ├── migrations/           # マイグレーションファイル
│   ├── seed.ts               # 初期データ投入スクリプト
│   └── package.json          # Prisma 専用スクリプト
├── openapi/
│   └── openapi.yaml          # API ドキュメント（OpenAPI仕様）
├── package.json              # npm 設定・依存関係
├── tsconfig.json             # TypeScript 設定
├── Makefile                  # 開発用コマンド
├── README.md                 # 簡易ドキュメント
├── SETUP_GUIDE.md            # セットアップガイド
└── ARCHITECTURE.md           # このファイル
```

## 🏗️ レイヤーアーキテクチャ

### 1. Routes（ルート層）
- HTTPリクエストの受付
- リクエストバリデーション
- レスポンスの返却
- エラーハンドリング

**責務**:
- Express の Router を使用
- 認証ミドルウェアの適用
- Service 層の呼び出し

### 2. Services（サービス層）
- ビジネスロジックの実装
- データの加工・検証
- 複数のDB操作の調整

**責務**:
- Prisma を使用したDB操作
- ストレージ操作の調整
- エラーハンドリング（http-errors）

### 3. Libs（ライブラリ層）
- 共通機能の提供
- 外部サービスとの連携

**責務**:
- 認証・認可
- ストレージ抽象化
- ジョブ管理

## 🔄 データフロー

```
Client Request
    ↓
[Route Layer] - 認証チェック
    ↓
[Service Layer] - ビジネスロジック
    ↓
[Prisma/DB] - データ永続化
    ↓
[Storage] - ファイル保存（必要に応じて）
    ↓
[Service Layer] - レスポンス整形
    ↓
[Route Layer] - JSON 返却
    ↓
Client Response
```

## 🗄️ データモデル

### User（ユーザー）
- LINE認証で自動作成
- アルバム・メディアの所有者

### Album（アルバム）
- ユーザーが作成
- 複数のメディアを含む
- 公開/非公開設定

### Media（メディア）
- 画像または動画
- アルバムに紐づく
- S3またはローカルに保存

### SlideshowJob（スライドショージョブ）
- アルバムから動画生成
- ステータス管理（queued/processing/done/failed）

詳細は `prisma/schema.prisma` を参照。

## 🔐 認証フロー

1. フロントエンド（Next.js）が LINE 認証
2. NextAuth.js が JWT トークン発行
3. クライアントがリクエストヘッダーにトークン含める
4. API が `requireAuth` ミドルウェアでトークン検証
5. ユーザー情報を `req.user` に格納
6. Service 層でユーザーIDを使用

```typescript
// libs/auth.ts
export async function requireAuth(req, res, next) {
  // JWT 検証
  // payload から user 情報を抽出
  // req.user に格納
}
```

## 📦 ストレージ抽象化

`libs/storage.ts` で実装：

```typescript
export async function putObject(buffer: Buffer, key: string)
export function getObjectUrl(storedKey: string)
```

### ローカルストレージ
- `.storage/` ディレクトリに保存
- 開発環境向け

### S3互換ストレージ
- AWS S3 または MinIO
- 本番環境推奨

環境変数 `STORAGE_DRIVER` で切り替え。

## 🎬 スライドショー生成

### ジョブフロー

1. クライアントが `/slideshow` に POST
2. `SlideshowJob` レコード作成（status: queued）
3. バックグラウンドでジョブ実行
4. FFmpeg で画像から動画生成（実装予定）
5. 結果を S3/ローカルに保存
6. ジョブステータスを done に更新
7. クライアントが `/slideshow/:jobId` でポーリング

現在は疑似実装（`libs/slideshow.ts`）。本番では BullMQ + Redis 推奨。

## 🧪 テスト戦略（今後）

### 単体テスト
- Services 層のロジック
- Jest + ts-jest

### 統合テスト
- ルート全体のテスト
- Supertest

### E2Eテスト
- 実際のDBを使用
- Docker Compose で環境構築

## 🚀 デプロイ

### 開発環境
- Docker Compose
- ローカルストレージ

### 本番環境
- Nginx + PM2
- MySQL（本番DB）
- S3 互換ストレージ
- 環境変数で設定切り替え

## 📊 パフォーマンス考慮事項

### データベース
- インデックス設定済み（`schema.prisma` 参照）
- N+1問題対策: Prisma の `include` を活用

### ファイルアップロード
- Multer で 50MB 制限
- ストリーミング処理で大容量対応

### スライドショー生成
- バックグラウンドジョブで非同期処理
- 進捗管理で UX 向上

## 🔧 拡張性

### 将来の拡張ポイント

1. **キューシステム**: BullMQ + Redis
2. **キャッシュ**: Redis でメディアメタデータ
3. **CDN**: CloudFront/CloudFlare
4. **画像処理**: Sharp でサムネイル生成
5. **動画トランスコード**: FFmpeg ラッパー
6. **通知**: WebSocket/SSE でリアルタイム更新
7. **検索**: Elasticsearch でメディア検索

## 📚 使用技術

- **Node.js**: v22（Volta管理）
- **Express.js**: Webフレームワーク
- **TypeScript**: 型安全性
- **Prisma**: ORMとマイグレーション
- **MySQL**: リレーショナルDB
- **jose**: JWT検証
- **multer**: ファイルアップロード
- **AWS SDK**: S3操作
- **p-limit**: 並行処理制御

## 🤝 開発ガイドライン

### コーディング規約
- ESLint + TypeScript
- 非同期処理は async/await
- エラーは http-errors で統一

### コミット規約
- feat: 新機能
- fix: バグ修正
- refactor: リファクタリング
- docs: ドキュメント

### ブランチ戦略
- main: 本番
- develop: 開発
- feature/*: 機能開発

## 📞 サポート

質問・問題があれば、プロジェクトのメインREADMEを参照してください。

