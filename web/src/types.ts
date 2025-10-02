// アルバムの型定義
export interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  media?: Media[];
}

// メディアの型定義
export interface Media {
  id: string;
  albumId: string;
  ownerId: string;
  storageKey: string;
  mime: string;
  width?: number;
  height?: number;
  durationMs?: number;
  caption?: string;
  tags: string[];
  category?: string;
  confidence?: number;
  colors?: string[];
  analyzed: boolean;
  createdAt: string;
  updatedAt: string;
  url?: string;
  title: string;
  date: string;
  comment?: string;
  originalName?: string;
}

// スライドショージョブの型定義
export interface SlideshowJob {
  id: string;
  albumId: string;
  params: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
  resultKey?: string;
  errorMsg?: string;
  createdAt: string;
  updatedAt: string;
}

// ユーザーの型定義
export interface User {
  id: string;
  provider: string;
  providerId: string;
  name?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API レスポンスの型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// エラーレスポンスの型定義
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ファイルアップロード関連の型定義
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  success: boolean;
  media?: Media;
  error?: string;
}

// カテゴリ統計の型定義
export interface CategoryStats {
  category: string;
  count: number;
}

// 画像分析結果の型定義
export interface ImageAnalysis {
  category: string;
  confidence: number;
  suggestedTags: string[];
}

// アルバム作成データの型定義
export interface CreateAlbumData {
  title: string;
  description?: string;
  isPublic: boolean;
}
