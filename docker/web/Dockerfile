# ベースイメージ
FROM node:22-alpine AS base

# 依存関係インストールステージ
FROM base AS deps
WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# 開発依存関係のインストール
FROM base AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

# ビルドステージ
FROM base AS builder
WORKDIR /app

# 開発依存関係をコピー
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Next.jsビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 本番用ステージ
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# セキュリティ: 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Next.jsの本番ファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 非rootユーザーに切り替え
USER nextjs

# ポート公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 本番起動
CMD ["node", "server.js"]

# 開発用ステージ
FROM base AS development
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# 開発依存関係をインストール
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

# ソースコードをコピー
COPY . .

# ポート公開
EXPOSE 3000

# 開発モードで起動
CMD ["npm", "run", "dev"]