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

# Prismaクライアント生成
RUN cd prisma && npx prisma generate

# TypeScriptビルド
RUN npm run build

# 本番用ステージ
FROM base AS production
WORKDIR /app

# セキュリティ: 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 本番依存関係とビルド成果物をコピー
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

# Prismaクライアント生成（本番用）
RUN cd prisma && npx prisma generate

# 非rootユーザーに切り替え
USER nodejs

# ポート公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 本番起動
CMD ["node", "dist/index.js"]

# 開発用ステージ
FROM base AS development
WORKDIR /app

# 開発依存関係をインストール
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

# ソースコードをコピー
COPY . .

# Prismaクライアント生成
RUN cd prisma && npx prisma generate

# ポート公開
EXPOSE 3000

# 開発モードで起動
CMD ["npm", "run", "dev"]