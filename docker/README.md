# Docker設定ドキュメント

このディレクトリには、Album Videoプロジェクトのすべてのコンテナ設定が含まれています。

## 📁 ディレクトリ構成

```
docker/
├── api/
│   ├── Dockerfile           # APIサーバー用Dockerfile（マルチステージビルド）
│   └── .dockerignore        # APIビルド時の除外ファイル
├── web/
│   ├── Dockerfile           # Webフロントエンド用Dockerfile（マルチステージビルド）
│   └── .dockerignore        # Webビルド時の除外ファイル
├── mysql/
│   └── init/
│       └── 01_create_tables.sql  # データベース初期化スクリプト
├── nginx/
│   ├── nginx.conf           # Nginxメイン設定
│   └── conf.d/
│       └── default.conf     # バーチャルホスト設定
└── README.md
```

## 🐳 Dockerfileの特徴

### APIとWebの共通機能
- **マルチステージビルド**: 開発用と本番用を分離
- **レイヤーキャッシュ最適化**: 依存関係を先にインストール
- **非rootユーザー実行**: セキュリティ強化
- **ヘルスチェック**: コンテナの状態監視

### API Dockerfile (`api/Dockerfile`)
```dockerfile
# ステージ構成:
# 1. base        - ベースイメージ
# 2. deps        - 本番依存関係
# 3. dev-deps    - 開発依存関係
# 4. builder     - ビルドステージ
# 5. production  - 本番実行環境
# 6. development - 開発実行環境
```

**本番ビルド**:
```bash
docker build -f docker/api/Dockerfile --target production -t album-api:prod ./api
```

**開発ビルド**:
```bash
docker build -f docker/api/Dockerfile --target development -t album-api:dev ./api
```

### Web Dockerfile (`web/Dockerfile`)
```dockerfile
# ステージ構成:
# 1. base        - ベースイメージ
# 2. deps        - 本番依存関係
# 3. dev-deps    - 開発依存関係
# 4. builder     - Next.jsビルド
# 5. production  - 本番実行環境（standalone出力）
# 6. development - 開発実行環境（HMR対応）
```

**本番ビルド**:
```bash
docker build -f docker/web/Dockerfile --target production -t album-web:prod ./web
```

**開発ビルド**:
```bash
docker build -f docker/web/Dockerfile --target development -t album-web:dev ./web
```

## 🚀 使用方法

### 開発環境
```bash
# 起動（開発モード）
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down

# 完全クリーンアップ（ボリュームも削除）
docker compose down -v
```

### 本番環境
```bash
# 起動（本番モード）
docker compose -f compose.prod.yml up -d

# ログ確認
docker compose -f compose.prod.yml logs -f

# 停止
docker compose -f compose.prod.yml down
```

## 🔧 環境変数

### 必須環境変数
プロジェクトルートに `.env` ファイルを作成:

```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=album_video
MYSQL_USER=app_user
MYSQL_PASSWORD=your_secure_password

# API
JWT_SECRET=your_jwt_secret_key
STORAGE_DRIVER=local  # or s3

# Web
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret
LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret
```

## 📊 ヘルスチェック

すべてのサービスにヘルスチェックが設定されています：

- **MySQL**: `mysqladmin ping`（10秒間隔）
- **API**: `/health` エンドポイント（30秒間隔）
- **Web**: ルートパス確認（30秒間隔）
- **Nginx**: 設定ファイル検証（30秒間隔）

ヘルスチェック状態確認:
```bash
docker compose ps
```

## 🗄️ ボリューム管理

### 永続化データ
- `mysql_data`: データベースデータ
- `api_uploads`: アップロードファイル
- `mysql_logs`: MySQLログ（本番環境）
- `nginx_logs`: Nginxログ（本番環境）

### ボリューム確認
```bash
docker volume ls | grep album-video
```

### ボリュームバックアップ
```bash
# データベースバックアップ
docker compose exec mysql mysqldump -u root -p album_video > backup.sql

# ボリュームバックアップ
docker run --rm -v album-video-main_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_data_backup.tar.gz /data
```

## 🔒 セキュリティ設定

### 実装済みセキュリティ機能
1. **非rootユーザー実行**: すべてのコンテナで非rootユーザーを使用
2. **読み取り専用ボリューム**: 設定ファイルは `:ro` フラグ付き
3. **ローカルバインド**: 本番環境ではポートを `127.0.0.1` にバインド
4. **セキュリティヘッダー**: Nginxで追加
5. **環境変数分離**: `.env` ファイルで機密情報管理

### 本番環境での推奨事項
- 強力なパスワードを使用
- 定期的なセキュリティアップデート
- SSL/TLS証明書の設定（Let's Encrypt推奨）
- ファイアウォール設定
- 定期的なバックアップ

## 🔍 トラブルシューティング

### コンテナが起動しない
```bash
# ログ確認
docker compose logs [service_name]

# コンテナ状態確認
docker compose ps -a

# イメージ再ビルド
docker compose build --no-cache [service_name]
```

### データベース接続エラー
```bash
# MySQLコンテナ内でテスト
docker compose exec mysql mysql -u root -p

# ネットワーク確認
docker network inspect album-video-main_album-video-network
```

### ポート競合
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3001
lsof -i :3306

# .envファイルでポート変更
WEB_PORT=3002
API_PORT=3003
MYSQL_PORT=3307
```

### ボリューム権限エラー
```bash
# ボリューム削除して再作成
docker compose down -v
docker compose up -d
```

## 📈 パフォーマンス最適化

### MySQL設定
- `innodb_buffer_pool_size`: 512M（本番）
- `max_connections`: 200
- スロークエリログ有効化

### Nginx設定
- Gzip圧縮有効化
- キープアライブ接続
- 静的ファイルキャッシュ
- ワーカープロセス自動設定

### Node.jsコンテナ
- マルチステージビルドでイメージサイズ削減
- npm ciで決定的インストール
- キャッシュクリアでサイズ削減

## 🔄 CI/CD統合

### GitHub Actions用
```yaml
- name: Build Docker images
  run: |
    docker compose -f compose.prod.yml build
    
- name: Run tests
  run: |
    docker compose -f compose.yml up -d
    docker compose exec -T api npm test
```

## 📝 メンテナンス

### イメージ更新
```bash
# ベースイメージ更新
docker compose pull

# 再ビルド
docker compose build

# 再起動
docker compose up -d
```

### ログローテーション
本番環境では自動的に設定されています：
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🌐 Nginx設定

### 開発環境
- HTTPのみ（ポート80）
- API: `http://localhost/api/*`
- Web: `http://localhost/*`

### 本番環境（SSL有効化時）
1. `docker/nginx/conf.d/default.conf` でHTTPS設定のコメント解除
2. SSL証明書を配置: `ssl_certs` ボリュームまたは `docker/nginx/ssl/`
3. ドメイン名を設定

### Let's Encrypt設定例
```bash
# Certbot設定（compose.prod.ymlに追加）
certbot:
  image: certbot/certbot
  volumes:
    - ssl_certs:/etc/letsencrypt
    - certbot_www:/var/www/certbot
  command: certonly --webroot --webroot-path=/var/www/certbot --email your@email.com --agree-tos --no-eff-email -d your-domain.com
```

## 📞 サポート

問題が解決しない場合：
1. プロジェクトのIssueを確認
2. ログを添付して新しいIssueを作成
3. `docker compose config` の出力を共有

