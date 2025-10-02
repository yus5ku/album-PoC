# LINE認証セットアップガイド

## 概要
このアプリケーションでは、一般ユーザーがLINEアカウントでログインできます。

## セットアップ手順

### 1. LINE Developers Consoleでアプリを作成

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. 「新規プロバイダー作成」または既存のプロバイダーを選択
3. 「新規チャネル作成」→「LINEログイン」を選択
4. 必要な情報を入力：
   - チャネル名: `Album Video`
   - チャネル説明: `写真アルバム管理アプリ`
   - アプリタイプ: `ウェブアプリ`

### 2. チャネル設定

1. 作成したチャネルの「チャネル基本設定」タブで以下を取得：
   - **Channel ID** (チャネルID)
   - **Channel Secret** (チャネルシークレット)

2. 「LINEログイン設定」タブで以下を設定：
   - **コールバックURL**: `http://localhost:3000/api/auth/callback/line`
   - **スコープ**: `profile` にチェック

### 3. 環境変数の設定

プロジェクトのルートディレクトリ（`web/`フォルダ）に `.env.local` ファイルを作成：

\`\`\`env
# NextAuth.js設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# LINE認証設定
LINE_CLIENT_ID=取得したChannel ID
LINE_CLIENT_SECRET=取得したChannel Secret

# API設定
NEXT_PUBLIC_API_BASE=http://localhost:3001
\`\`\`

### 4. サーバー再起動

環境変数を設定後、開発サーバーを再起動：

\`\`\`bash
cd web
npm run dev
\`\`\`

## 一般ユーザーの利用について

- **誰でも利用可能**: 特別な設定は不要
- **LINEアカウント**: 通常のLINEアカウントでログイン可能
- **プライバシー**: 取得する情報はプロフィール情報（名前、アイコン）のみ

## トラブルシューティング

### ログインボタンが表示されない
- 環境変数が正しく設定されているか確認
- サーバーを再起動

### ログインエラーが発生する
- コールバックURLが正しく設定されているか確認
- Channel IDとChannel Secretが正しいか確認

### 本番環境での設定
本番環境では以下を変更：
- `NEXTAUTH_URL`: 本番ドメインに変更
- コールバックURL: `https://yourdomain.com/api/auth/callback/line`
