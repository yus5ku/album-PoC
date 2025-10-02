import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

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

// APIクライアントのベース関数
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 認証が必要な場合はトークンを追加
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// メディア関連のAPI
export const mediaApi = {
  // 写真をアップロード
  upload: async (formData: FormData) => {
    // モック実装：実際のAPIサーバーがない場合のテスト用
    return new Promise((resolve, reject) => {
      const file = formData.get('file') as File;
      
      if (!file) {
        reject(new Error('ファイルが選択されていません'));
        return;
      }

      console.log('ファイルアップロード開始:', file.name, file.type, file.size);

      // ファイルをBase64に変換
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        console.log('Base64変換完了:', base64Url.substring(0, 50) + '...');
        
        const finalResponse = {
          id: Date.now(),
          filename: file.name,
          size: file.size,
          type: file.type,
          url: base64Url, // 最初からBase64 URLを使用
          uploadedAt: new Date().toISOString(),
          title: generatePhotoTitle(file.name),
          date: new Date().toLocaleDateString('ja-JP'),
          comment: '',
          originalName: file.name
        };
        
        // localStorageに保存
        const savedPhotos = localStorage.getItem('uploadedPhotos');
        const photos = savedPhotos ? JSON.parse(savedPhotos) : [];
        photos.unshift(finalResponse);
        localStorage.setItem('uploadedPhotos', JSON.stringify(photos));
        
        console.log('写真保存完了:', finalResponse.title);
        setTimeout(() => resolve(finalResponse), 500); // 短い遅延
      };
      
      reader.onerror = (error) => {
        console.error('ファイル読み込みエラー:', error);
        reject(new Error('ファイルの読み込みに失敗しました'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // 写真を削除
  delete: async (mediaId: string) => {
    // モック実装：localStorageから削除
    const savedPhotos = localStorage.getItem('uploadedPhotos');
    if (savedPhotos) {
      const photos = JSON.parse(savedPhotos);
      const updatedPhotos = photos.filter((photo: any) => photo.id !== parseInt(mediaId));
      localStorage.setItem('uploadedPhotos', JSON.stringify(updatedPhotos));
    }
  },

  // 写真を更新
  update: async (mediaId: string, updateData: { title?: string; comment?: string; date?: string }) => {
    // モック実装：localStorageで更新
    const savedPhotos = localStorage.getItem('uploadedPhotos');
    if (savedPhotos) {
      const photos = JSON.parse(savedPhotos);
      const photoIndex = photos.findIndex((photo: any) => photo.id === parseInt(mediaId));
      if (photoIndex !== -1) {
        photos[photoIndex] = { ...photos[photoIndex], ...updateData };
        localStorage.setItem('uploadedPhotos', JSON.stringify(photos));
        return photos[photoIndex];
      }
    }
    throw new Error('写真が見つかりません');
  },

  // 写真一覧を取得
  list: async () => {
    // モック実装：localStorageから保存された写真を取得
    const savedPhotos = localStorage.getItem('uploadedPhotos');
    if (savedPhotos) {
      return JSON.parse(savedPhotos);
    }
    return [];
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
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('削除に失敗しました');
    }
  },
};

// 認証ヘッダーを取得
async function getAuthHeaders() {
  const session = await getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return headers;
}

// エラーハンドリング用のユーティリティ
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  return '予期しないエラーが発生しました';
}