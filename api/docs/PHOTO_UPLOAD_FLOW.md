# 写真アップロードと配置の仕組み

## 📸 概要

このAPIでは、写真をアップロードすると自動的に適切な場所に保存・配置されます。

## 🔄 写真アップロードのフロー

```
┌─────────────┐
│ クライアント │
└──────┬──────┘
       │ 1. POST /media/upload
       │    - file: 写真ファイル
       │    - albumId: アルバムID
       │    - caption: キャプション（任意）
       │    - tags: タグ（任意）
       ↓
┌──────────────────┐
│  API Server      │
│  (media.ts)      │
└────────┬─────────┘
         │ 2. 認証チェック
         │    requireAuth ミドルウェア
         ↓
┌──────────────────┐
│  Multer          │
│  (メモリ保存)    │
└────────┬─────────┘
         │ 3. ファイルをメモリに読み込み
         │    → req.file.buffer
         ↓
┌──────────────────────┐
│  media.service.ts    │
│  uploadMedia()       │
└────────┬─────────────┘
         │ 4. アルバムの存在確認
         │ 5. 権限チェック
         ↓
┌──────────────────────┐
│  storage.ts          │
│  putObject()         │
└────────┬─────────────┘
         │ 6. ファイル保存
         │    ↓
         ├─ ローカルストレージ
         │  └→ .storage/[albumId]/[uuid].jpg
         │
         └─ S3ストレージ
            └→ s3://bucket/[albumId]/[uuid].jpg
         ↓
┌──────────────────────┐
│  Prisma (DB)         │
│  media.create()      │
└────────┬─────────────┘
         │ 7. メタデータをDBに保存
         │    - albumId
         │    - ownerId
         │    - storageKey
         │    - mime
         │    - caption
         │    - tags
         ↓
┌─────────────┐
│ クライアント │ ← 8. レスポンス
└─────────────┘    {
                     id: "...",
                     url: "/media/local/...",
                     storageKey: "local:...",
                     caption: "...",
                     tags: [...]
                   }
```

## 📂 ファイル配置構造

### ローカルストレージの場合

```
.storage/
├── [albumId1]/
│   ├── [uuid1].jpg        # 写真1
│   ├── [uuid2].png        # 写真2
│   └── [uuid3].heic       # 写真3
├── [albumId2]/
│   ├── [uuid4].jpg
│   └── [uuid5].png
└── slideshows/
    └── [albumId1]/
        └── [jobId].mp4    # 生成された動画
```

**ポイント:**
- アルバムごとにディレクトリが自動作成される
- ファイル名はUUID（ランダムな一意のID）で衝突を防ぐ
- 拡張子は元のファイルから維持される

### S3ストレージの場合

```
s3://album-media/
├── [albumId1]/
│   ├── [uuid1].jpg
│   ├── [uuid2].png
│   └── [uuid3].heic
├── [albumId2]/
│   ├── [uuid4].jpg
│   └── [uuid5].png
└── slideshows/
    └── [albumId1]/
        └── [jobId].mp4
```

## 💾 データベース構造

### Media テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | メディアID（自動生成） |
| albumId | String | 所属するアルバムID |
| ownerId | String | 所有者のユーザーID |
| storageKey | String | 保存先のキー（例: `local:albumId/uuid.jpg`） |
| mime | String | MIMEタイプ（例: `image/jpeg`） |
| caption | String? | キャプション（任意） |
| tags | Json | タグの配列（例: `["family", "2024"]`） |
| createdAt | DateTime | アップロード日時 |

## 🔐 セキュリティ

### 1. 認証・認可
- JWTトークンで認証
- アルバムの所有者のみアップロード可能

### 2. ファイルサイズ制限
- 最大50MB（multer設定）
```typescript
multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 } 
})
```

### 3. ファイル名の安全性
- UUIDを使用してファイル名を生成
- パストラバーサル攻撃を防ぐ

## 📝 実装コード解説

### 1. ルート定義（`routes/media.ts`）

```typescript
mediaRouter.post("/upload", requireAuth, upload.single("file"), 
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { albumId, caption, tags } = req.body;
    const file = req.file!;
    
    const media = await svc.uploadMedia(userId, { 
      albumId, caption, tags, file 
    });
    
    res.status(201).json(media);
  }
);
```

### 2. ビジネスロジック（`services/media.service.ts`）

```typescript
export async function uploadMedia(userId: string, input: UploadInput) {
  // 1. アルバムの存在確認
  const album = await prisma.album.findUnique({ 
    where: { id: input.albumId } 
  });
  if (!album) throw createError(404, "album not found");
  
  // 2. 権限チェック
  if (album.ownerId !== userId) throw createError(403, "forbidden");
  
  // 3. ファイル名生成（UUID + 拡張子）
  const ext = path.extname(input.file.originalname) || ".bin";
  const key = `${album.id}/${randomUUID()}${ext}`;
  
  // 4. ストレージに保存
  const storageKey = await putObject(input.file.buffer, key);
  
  // 5. タグの処理
  const tags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string" && input.tags.length
    ? input.tags.split(",").map(s => s.trim())
    : [];
  
  // 6. DBに保存
  const media = await prisma.media.create({
    data: {
      albumId: album.id,
      ownerId: userId,
      storageKey,
      mime: input.file.mimetype,
      caption: input.caption ?? null,
      tags
    }
  });
  
  // 7. URLを付加してレスポンス
  return { ...media, url: getObjectUrl(storageKey) };
}
```

### 3. ストレージ抽象化（`libs/storage.ts`）

```typescript
// ローカルストレージ保存
export async function localPut(buffer: Buffer, key: string): Promise<string> {
  await ensureLocalDir();
  const file = path.join(localDir, key);
  
  // ディレクトリを自動作成
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  
  // ファイル書き込み
  await fs.writeFile(file, buffer);
  
  return `local:${key}`;
}

// ストレージドライバーの選択
export async function putObject(buffer: Buffer, key: string): Promise<string> {
  if (driver === "s3") return s3Put(buffer, key);
  return localPut(buffer, key);
}
```

## 🌐 APIリクエスト例

### アップロードリクエスト

```bash
curl -X POST http://localhost:3001/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/photo.jpg" \
  -F "albumId=album_abc123" \
  -F "caption=家族旅行の写真" \
  -F "tags=family,vacation,2024"
```

### レスポンス例

```json
{
  "id": "clx1234567890",
  "albumId": "album_abc123",
  "ownerId": "user_xyz789",
  "storageKey": "local:album_abc123/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.jpg",
  "mime": "image/jpeg",
  "caption": "家族旅行の写真",
  "tags": ["family", "vacation", "2024"],
  "url": "/media/local/album_abc123/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.jpg",
  "createdAt": "2024-10-02T12:34:56.789Z",
  "updatedAt": "2024-10-02T12:34:56.789Z"
}
```

## 🎯 配置の特徴

### 1. 自動ディレクトリ作成
アルバムごとのディレクトリが自動的に作成されるため、手動での準備は不要です。

### 2. ファイル名の一意性保証
UUIDを使用することで、同じファイル名の写真をアップロードしても衝突しません。

### 3. 拡張子の保持
元のファイルの拡張子を保持することで、ファイルタイプが明確になります。

### 4. メタデータとファイルの分離
- **ファイル**: `.storage/`または S3 に保存
- **メタデータ**: MySQL データベースに保存

この分離により：
- 高速な検索が可能
- タグやキャプションでの絞り込みが効率的
- バックアップが容易

## 📊 写真の取得

### 写真一覧を取得

```bash
GET /albums/:albumId
```

レスポンスにメディアが含まれます：

```json
{
  "id": "album_abc123",
  "title": "家族旅行",
  "media": [
    {
      "id": "media_1",
      "storageKey": "local:album_abc123/uuid1.jpg",
      "caption": "海岸の写真",
      "tags": ["beach", "sunset"]
    },
    {
      "id": "media_2",
      "storageKey": "local:album_abc123/uuid2.jpg",
      "caption": "ホテルの部屋",
      "tags": ["hotel", "room"]
    }
  ]
}
```

### 個別の写真を取得

```bash
GET /media/:id
```

## 🔄 まとめ

1. **アップロード**: POST /media/upload にファイルを送信
2. **認証**: JWTトークンで認証
3. **保存**: アルバムIDごとのディレクトリに UUID 付きで保存
4. **DB記録**: メタデータをデータベースに保存
5. **URL返却**: アクセス用のURLを返す

この仕組みにより、写真は**自動的に整理され、安全に保存**されます！

