# 🖼️ 画像分析機能ガイド

## 📋 概要

写真をアップロードすると、自動的に画像を分析して以下を行います：

- **カテゴリ分類**: 風景、人物、食べ物、動物、建築物など
- **自動タグ付け**: 画像内容に基づいたタグの自動生成
- **色分析**: 支配的な色の抽出
- **メタデータ取得**: 画像サイズ、アスペクト比など

## 🎯 対応カテゴリ

| カテゴリ | 英語名 | 説明 | 自動タグ例 |
|---------|--------|------|-----------|
| 風景 | landscape | 自然の景色、風景写真 | 風景, 景色, 自然 |
| 人物 | portrait | 人物写真、ポートレート | 人物, ポートレート |
| 食べ物 | food | 料理、食事、飲み物 | 食べ物, 料理, グルメ |
| 動物 | animal | ペット、動物写真 | 動物, ペット |
| 建築物 | architecture | 建物、街並み | 建築, 建物, 街並み |
| 乗り物 | vehicle | 車、電車、飛行機など | 乗り物, 交通, 旅行 |
| 自然 | nature | 植物、花、自然物 | 自然, 植物, 花 |
| 物体 | object | その他の物体 | - |
| 文書 | document | 文書、テキスト | - |
| その他 | other | 分類不明 | - |

## 🔄 アップロード時の自動分析

### 1. 通常のアップロード

```bash
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@landscape.jpg" \
  -F "albumId=album_123" \
  -F "caption=美しい夕日"
```

**レスポンス例:**
```json
{
  "id": "media_abc123",
  "albumId": "album_123",
  "storageKey": "local:album_123/uuid.jpg",
  "mime": "image/jpeg",
  "width": 1920,
  "height": 1080,
  "caption": "美しい夕日",
  "tags": ["風景", "景色", "自然", "sunset"],
  "category": "landscape",
  "confidence": 0.85,
  "colors": ["#ff6b35", "#f7931e", "#ffcc02"],
  "analyzed": true,
  "url": "/media/local/album_123/uuid.jpg",
  "analysis": {
    "category": "landscape",
    "confidence": 0.85,
    "suggestedTags": ["風景", "景色", "自然"]
  }
}
```

### 2. 分析結果の詳細

- **category**: 推定されたカテゴリ
- **confidence**: 分析の信頼度（0.0-1.0）
- **tags**: ユーザータグ + 自動生成タグ
- **colors**: 支配的な色の配列
- **width/height**: 画像の実際のサイズ
- **analyzed**: 分析が完了したかのフラグ

## 📊 カテゴリ別取得API

### 1. 風景写真のみ取得

```bash
GET /media/landscape?limit=10&offset=0
```

**レスポンス:**
```json
[
  {
    "id": "media_1",
    "category": "landscape",
    "confidence": 0.9,
    "tags": ["風景", "山", "自然"],
    "colors": ["#4a90e2", "#7ed321"],
    "album": {
      "id": "album_1",
      "title": "旅行写真"
    },
    "url": "/media/local/album_1/uuid1.jpg"
  }
]
```

### 2. 人物写真のみ取得

```bash
GET /media/portrait?limit=10&offset=0
```

### 3. 食べ物写真のみ取得

```bash
GET /media/food?limit=10&offset=0
```

### 4. 任意のカテゴリで取得

```bash
GET /media/category/animal?limit=10&offset=0
```

### 5. カテゴリ統計を取得

```bash
GET /media/stats/categories
```

**レスポンス:**
```json
[
  {
    "category": "landscape",
    "count": 45
  },
  {
    "category": "portrait", 
    "count": 23
  },
  {
    "category": "food",
    "count": 12
  }
]
```

## 🧠 分析ロジック

### 1. ファイル名による分析

ファイル名から内容を推測：

```typescript
// 例: "sunset_landscape_2024.jpg"
// → キーワード: ["landscape", "nature"]
// → カテゴリ: landscape (信頼度: 0.9)
```

### 2. アスペクト比による推測

```typescript
// 横長画像 (ratio > 1.5) → 風景の可能性
// 縦長画像 (ratio < 0.8) → 人物の可能性
```

### 3. 色分析

```typescript
// 支配的な色を抽出
// 緑・青が多い → 自然・風景
// 暖色系が多い → 食べ物・夕日
```

## 🎨 自動タグ生成

### カテゴリベースのタグ

```typescript
landscape → ["風景", "景色", "自然"]
portrait  → ["人物", "ポートレート"] 
food      → ["食べ物", "料理", "グルメ"]
animal    → ["動物", "ペット"]
```

### ファイル名ベースのタグ

```typescript
"beach_sunset.jpg" → ["beach", "sunset", "landscape", "nature"]
"family_dinner.jpg" → ["family", "food", "meal"]
"pet_dog.jpg" → ["pet", "dog", "animal"]
```

### 色ベースのタグ

```typescript
赤系 → "赤"
青系 → "青" 
緑系 → "緑"
```

## 🔧 設定とカスタマイズ

### 1. 分析の無効化

画像分析を無効にしたい場合：

```typescript
// libs/image-analysis.ts で分析をスキップ
if (process.env.DISABLE_IMAGE_ANALYSIS === 'true') {
  return defaultResult;
}
```

### 2. カスタムカテゴリの追加

```typescript
// libs/image-analysis.ts
export const IMAGE_CATEGORIES = {
  // 既存のカテゴリ...
  SPORT: "sport",        // スポーツ
  EVENT: "event",        // イベント
  WORK: "work"           // 仕事
} as const;
```

### 3. 分析精度の調整

```typescript
// より厳しい信頼度しきい値
if (categoryResult.confidence < 0.7) {
  return { category: "other", confidence: 0.1 };
}
```

## 📈 パフォーマンス

### 処理時間

- **小さい画像** (< 1MB): ~100-300ms
- **中程度の画像** (1-5MB): ~300-800ms  
- **大きい画像** (> 5MB): ~800-2000ms

### メモリ使用量

- Sharp による画像処理: 一時的に画像サイズの2-3倍
- 分析完了後は自動的にメモリ解放

### 最適化のヒント

1. **リサイズ**: 分析用に画像を小さくリサイズ
2. **非同期処理**: アップロードと分析を分離
3. **キャッシュ**: 分析結果をDBに保存

## 🐛 トラブルシューティング

### 1. 分析が失敗する場合

```typescript
// ログで確認
console.log("[画像分析] エラー:", error);

// フォールバック処理
return {
  category: "other",
  confidence: 0.1,
  suggestedTags: [],
  colors: [],
  dimensions: { width: 0, height: 0 }
};
```

### 2. 不正確な分類

- ファイル名にキーワードを含める
- 手動でタグを追加
- 信頼度を確認して判断

### 3. パフォーマンス問題

```bash
# Sharp のインストール確認
npm list sharp

# ネイティブバイナリの再ビルド
npm rebuild sharp
```

## 🔮 今後の拡張

### 1. 機械学習モデルの統合

```typescript
// TensorFlow.js や OpenCV.js の利用
import * as tf from '@tensorflow/tfjs-node';

// 事前訓練済みモデルで分類
const predictions = await model.predict(imageData);
```

### 2. 顔認識

```typescript
// 人物写真での顔検出・認識
const faces = await detectFaces(imageBuffer);
if (faces.length > 0) {
  tags.push(`${faces.length}人`, "顔認識");
}
```

### 3. OCR（文字認識）

```typescript
// 文書やテキストの認識
const text = await extractText(imageBuffer);
if (text.length > 10) {
  category = "document";
  tags.push("テキスト", "文書");
}
```

## 📝 まとめ

画像分析機能により：

✅ **自動分類**: 風景、人物、食べ物などに自動分類  
✅ **スマートタグ**: 内容に基づいた自動タグ付け  
✅ **効率的検索**: カテゴリ別での高速検索  
✅ **統計情報**: 写真の傾向分析  
✅ **ユーザビリティ**: 手動分類の手間を削減  

これで写真が自動的に整理され、**風景写真だけを簡単に見つける**ことができます！
