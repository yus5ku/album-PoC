# 🖼️ 画像分析機能の使用例

## 📸 実際の使用例

### 1. 風景写真をアップロード

```bash
# 風景写真をアップロード
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sunset_mountain.jpg" \
  -F "albumId=album_vacation2024" \
  -F "caption=富士山の夕日"
```

**自動分析結果:**
```json
{
  "id": "media_abc123",
  "category": "landscape",
  "confidence": 0.92,
  "tags": ["風景", "景色", "自然", "mountain", "sunset"],
  "colors": ["#ff6b35", "#f7931e", "#4a90e2"],
  "width": 1920,
  "height": 1080,
  "analysis": {
    "category": "landscape",
    "confidence": 0.92,
    "suggestedTags": ["風景", "景色", "自然"]
  }
}
```

### 2. 人物写真をアップロード

```bash
# 家族写真をアップロード
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@family_portrait.jpg" \
  -F "albumId=album_family" \
  -F "caption=家族写真"
```

**自動分析結果:**
```json
{
  "category": "portrait",
  "confidence": 0.88,
  "tags": ["人物", "ポートレート", "family"],
  "colors": ["#d4a574", "#8b6f47", "#f5deb3"]
}
```

### 3. 食べ物写真をアップロード

```bash
# 料理写真をアップロード
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@delicious_ramen.jpg" \
  -F "albumId=album_food" \
  -F "caption=美味しいラーメン"
```

**自動分析結果:**
```json
{
  "category": "food",
  "confidence": 0.95,
  "tags": ["食べ物", "料理", "グルメ", "ramen"],
  "colors": ["#d2691e", "#ff4500", "#ffd700"]
}
```

## 🔍 カテゴリ別検索の使用例

### 1. 風景写真だけを表示

```bash
# 風景写真のみ取得
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/landscape?limit=20"
```

**レスポンス:**
```json
[
  {
    "id": "media_1",
    "category": "landscape",
    "tags": ["風景", "山", "自然"],
    "caption": "富士山の夕日",
    "album": {
      "id": "album_vacation2024",
      "title": "2024年旅行"
    },
    "url": "/media/local/album_vacation2024/uuid1.jpg"
  },
  {
    "id": "media_2", 
    "category": "landscape",
    "tags": ["風景", "海", "beach"],
    "caption": "沖縄の海",
    "album": {
      "id": "album_vacation2024",
      "title": "2024年旅行"
    },
    "url": "/media/local/album_vacation2024/uuid2.jpg"
  }
]
```

### 2. 人物写真だけを表示

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/portrait"
```

### 3. 食べ物写真だけを表示

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/food"
```

### 4. カテゴリ統計を確認

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/stats/categories"
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
  },
  {
    "category": "animal",
    "count": 8
  }
]
```

## 🎯 実用的なシナリオ

### シナリオ1: 旅行アルバムの整理

```bash
# 1. 旅行アルバムを作成
curl -X POST http://localhost:3001/albums \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "沖縄旅行2024",
    "description": "家族で行った沖縄旅行の写真"
  }'

# 2. 複数の写真をアップロード
curl -X POST http://localhost:3001/media/upload \
  -F "file=@beach_sunset.jpg" \
  -F "albumId=album_okinawa2024"

curl -X POST http://localhost:3001/media/upload \
  -F "file=@family_beach.jpg" \
  -F "albumId=album_okinawa2024"

curl -X POST http://localhost:3001/media/upload \
  -F "file=@okinawa_food.jpg" \
  -F "albumId=album_okinawa2024"

# 3. 風景写真だけを確認
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/landscape"
```

### シナリオ2: グルメ写真の管理

```bash
# 食べ物写真だけを取得してグルメアルバムを作成
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/food"

# 結果を使って専用アルバムに整理
```

### シナリオ3: 家族写真の整理

```bash
# 人物写真だけを取得
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/media/portrait"

# 家族写真を別アルバムに移動（今後の機能）
```

## 📱 フロントエンドでの活用例

### React コンポーネント例

```typescript
// CategoryFilter.tsx
import React, { useState, useEffect } from 'react';

const CategoryFilter = () => {
  const [stats, setStats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [photos, setPhotos] = useState([]);

  // カテゴリ統計を取得
  useEffect(() => {
    fetch('/api/media/stats/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setStats);
  }, []);

  // カテゴリ別写真を取得
  const loadPhotos = async (category) => {
    const url = category === 'all' 
      ? '/api/albums' 
      : `/api/media/category/${category}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setPhotos(data);
  };

  return (
    <div>
      {/* カテゴリフィルター */}
      <div className="category-filters">
        <button 
          onClick={() => loadPhotos('all')}
          className={selectedCategory === 'all' ? 'active' : ''}
        >
          すべて
        </button>
        
        <button 
          onClick={() => loadPhotos('landscape')}
          className={selectedCategory === 'landscape' ? 'active' : ''}
        >
          風景 ({stats.find(s => s.category === 'landscape')?.count || 0})
        </button>
        
        <button 
          onClick={() => loadPhotos('portrait')}
          className={selectedCategory === 'portrait' ? 'active' : ''}
        >
          人物 ({stats.find(s => s.category === 'portrait')?.count || 0})
        </button>
        
        <button 
          onClick={() => loadPhotos('food')}
          className={selectedCategory === 'food' ? 'active' : ''}
        >
          食べ物 ({stats.find(s => s.category === 'food')?.count || 0})
        </button>
      </div>

      {/* 写真グリッド */}
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <img src={photo.url} alt={photo.caption} />
            <div className="photo-info">
              <p>{photo.caption}</p>
              <div className="tags">
                {photo.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="category-badge">
                {photo.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### CSS例

```css
.category-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.category-filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
}

.category-filters button.active {
  background: #007bff;
  color: white;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.photo-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.photo-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.photo-info {
  padding: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 5px 0;
}

.tag {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.category-badge {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  display: inline-block;
}
```

## 🔧 開発者向けTips

### 1. 分析結果のデバッグ

```typescript
// アップロード時のログを確認
console.log("[画像分析] 結果:", {
  filename: file.originalname,
  category: result.category,
  confidence: result.confidence,
  suggestedTags: result.suggestedTags
});
```

### 2. カスタム分析ロジック

```typescript
// libs/image-analysis.ts をカスタマイズ
if (filename.includes('wedding')) {
  return {
    category: 'portrait',
    confidence: 0.9,
    suggestedTags: ['結婚式', 'wedding', '人物']
  };
}
```

### 3. バッチ処理での分析

```typescript
// 既存の画像を一括分析
const unanalyzedMedia = await prisma.media.findMany({
  where: { analyzed: false }
});

for (const media of unanalyzedMedia) {
  // 分析処理...
}
```

## 📊 パフォーマンス最適化

### 1. 分析の非同期化

```typescript
// アップロード完了後に分析を実行
setTimeout(async () => {
  const analysis = await analyzeImage(buffer, filename);
  await prisma.media.update({
    where: { id: mediaId },
    data: { ...analysis, analyzed: true }
  });
}, 100);
```

### 2. キューシステムの導入

```typescript
// BullMQ を使用した例
import Queue from 'bull';

const imageAnalysisQueue = new Queue('image analysis');

imageAnalysisQueue.process(async (job) => {
  const { mediaId, buffer, filename } = job.data;
  const analysis = await analyzeImage(buffer, filename);
  
  await prisma.media.update({
    where: { id: mediaId },
    data: { ...analysis, analyzed: true }
  });
});
```

これで**風景写真だけを簡単に取得**できる機能が完成しました！🎉
