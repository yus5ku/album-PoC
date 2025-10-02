import { getSession } from "next-auth/react";

// 内部API Routesを使用するため、ベースURLは不要
const API_BASE_URL = '';

// 美しい写真タイトルを生成する関数
function generatePhotoTitle(filename: string): string {
  // 拡張子を除去
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // スクリーンショットの場合は日時ベースのタイトルに変更
  if (nameWithoutExt.toLowerCase().includes('screenshot') || 
      nameWithoutExt.toLowerCase().includes('スクリーンショット')) {
    const now = new Date();
    const time = now.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `写真 ${time}`;
  }
  
  // IMG_やDSC_などのプレフィックスを除去
  const cleanName = nameWithoutExt
    .replace(/^(IMG_|DSC_|PHOTO_|PIC_|IMAGE_)/i, '')
    .replace(/^\d{8}_\d{6}/, '') // 日時形式を除去
    .replace(/^Screenshot_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/, '') // Screenshotタイムスタンプを除去
    .trim();
  
  // 空の場合は日時ベースのタイトル
  if (!cleanName) {
    const now = new Date();
    const time = now.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `写真 ${time}`;
  }
  
  // 数字のみの場合は「写真 + 数字」に変更
  if (/^\d+$/.test(cleanName)) {
    return `写真 ${cleanName}`;
  }
  
  return cleanName;
}

// APIクライアントのベース関数（内部API Routes用）
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // 204 No Contentの場合はnullを返す
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// メディア関連のAPI
export const mediaApi = {
  // 写真をアップロード
  upload: async (formData: FormData) => {
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // 写真を削除
  delete: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  },

  // 写真詳細を取得
  get: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}`);
  },

  // カテゴリ別写真を取得
  getByCategory: async (category: string, limit = 20, offset = 0) => {
    return apiRequest(`/media/category/${category}?limit=${limit}&offset=${offset}`);
  },

  // 風景写真を取得
  getLandscape: async (limit = 20, offset = 0) => {
    return apiRequest(`/media/landscape?limit=${limit}&offset=${offset}`);
  },

  // 人物写真を取得
  getPortrait: async (limit = 20, offset = 0) => {
    return apiRequest(`/media/portrait?limit=${limit}&offset=${offset}`);
  },

  // 食べ物写真を取得
  getFood: async (limit = 20, offset = 0) => {
    return apiRequest(`/media/food?limit=${limit}&offset=${offset}`);
  },

  // カテゴリ統計を取得
  getCategoryStats: async () => {
    return apiRequest('/media/stats/categories');
  },
};

// アルバム関連のAPI
export const albumApi = {
  // アルバム一覧を取得
  list: async () => {
    return apiRequest('/albums');
  },

  // アルバム詳細を取得
  get: async (albumId: string) => {
    return apiRequest(`/albums/${albumId}`);
  },

  // アルバムを作成
  create: async (data: { title: string; description?: string; isPublic?: boolean }) => {
    return apiRequest('/albums', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // アルバムを更新
  update: async (albumId: string, data: Partial<{ title: string; description: string; isPublic: boolean }>) => {
    return apiRequest(`/albums/${albumId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // アルバムを削除
  delete: async (albumId: string) => {
    return apiRequest(`/albums/${albumId}`, {
      method: 'DELETE',
    });
  },
};


// エラーハンドリング用のユーティリティ
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  return '予期しないエラーが発生しました';
}