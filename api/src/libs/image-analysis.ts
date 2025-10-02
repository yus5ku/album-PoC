import sharp from "sharp";

// 画像分析結果の型定義
export interface ImageAnalysisResult {
  category: string;
  confidence: number;
  suggestedTags: string[];
  colors: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

// 画像カテゴリの定義
export const IMAGE_CATEGORIES = {
  LANDSCAPE: "landscape",      // 風景
  PORTRAIT: "portrait",        // 人物
  FOOD: "food",               // 食べ物
  ANIMAL: "animal",           // 動物
  ARCHITECTURE: "architecture", // 建築物
  NATURE: "nature",           // 自然
  VEHICLE: "vehicle",         // 乗り物
  OBJECT: "object",           // 物体
  DOCUMENT: "document",       // 文書
  OTHER: "other"              // その他
} as const;

// 色の分析結果
interface ColorAnalysis {
  dominant: string;
  palette: string[];
}

/**
 * 画像バッファを分析してカテゴリとタグを推定
 */
export async function analyzeImage(buffer: Buffer, filename: string): Promise<ImageAnalysisResult> {
  try {
    // Sharp で画像情報を取得
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // 基本的な画像情報
    const dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0
    };

    // アスペクト比による初期分類
    const aspectRatio = dimensions.width / dimensions.height;
    
    // ファイル名による分析
    const filenameAnalysis = analyzeFilename(filename);
    
    // 色の分析
    const colorAnalysis = await analyzeColors(image);
    
    // アスペクト比とファイル名から画像カテゴリを推定
    const categoryResult = categorizeImage(aspectRatio, filenameAnalysis, dimensions);
    
    // 推奨タグの生成
    const suggestedTags = generateSuggestedTags(categoryResult, colorAnalysis, filenameAnalysis);

    return {
      category: categoryResult.category,
      confidence: categoryResult.confidence,
      suggestedTags,
      colors: colorAnalysis.palette,
      dimensions
    };

  } catch (error) {
    console.warn("Image analysis failed:", error);
    
    // 分析に失敗した場合のフォールバック
    return {
      category: IMAGE_CATEGORIES.OTHER,
      confidence: 0.1,
      suggestedTags: [],
      colors: [],
      dimensions: { width: 0, height: 0 }
    };
  }
}

/**
 * ファイル名から内容を推測
 */
function analyzeFilename(filename: string): {
  keywords: string[];
  datePattern?: string;
} {
  const name = filename.toLowerCase();
  const keywords: string[] = [];

  // 風景関連のキーワード
  if (name.match(/(landscape|scenery|view|mountain|sea|ocean|beach|sunset|sunrise|sky|cloud)/)) {
    keywords.push("landscape", "nature");
  }

  // 人物関連
  if (name.match(/(portrait|person|people|family|friend|selfie|face)/)) {
    keywords.push("portrait", "people");
  }

  // 食べ物関連
  if (name.match(/(food|meal|lunch|dinner|breakfast|restaurant|cafe|drink)/)) {
    keywords.push("food");
  }

  // 動物関連
  if (name.match(/(pet|dog|cat|animal|bird|fish)/)) {
    keywords.push("animal", "pet");
  }

  // 建築物関連
  if (name.match(/(building|house|architecture|city|street|bridge)/)) {
    keywords.push("architecture", "building");
  }

  // 乗り物関連
  if (name.match(/(car|train|plane|bike|vehicle|travel)/)) {
    keywords.push("vehicle", "travel");
  }

  // 日付パターンの検出
  const dateMatch = name.match(/(\d{4}[-_]\d{2}[-_]\d{2}|\d{8})/);
  const datePattern = dateMatch ? dateMatch[0] : undefined;

  return { keywords, datePattern };
}

/**
 * 色の分析
 */
async function analyzeColors(image: sharp.Sharp): Promise<ColorAnalysis> {
  try {
    // 画像を小さくリサイズして色を抽出
    const { data } = await image
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 簡易的な色の分析（実際にはより高度なアルゴリズムを使用）
    const colors = extractDominantColors(data);
    
    return {
      dominant: colors[0] || "#000000",
      palette: colors.slice(0, 5)
    };
  } catch (error) {
    return {
      dominant: "#000000",
      palette: []
    };
  }
}

/**
 * 支配的な色を抽出（簡易版）
 */
function extractDominantColors(data: Buffer): string[] {
  // 簡易的な実装 - 実際にはk-meansクラスタリングなどを使用
  const colorCounts = new Map<string, number>();
  
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 色を16進数に変換（簡略化）
    const hex = `#${Math.round(r/32)*32}${Math.round(g/32)*32}${Math.round(b/32)*32}`.replace(/\d+/g, (n) => parseInt(n).toString(16).padStart(2, '0'));
    
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
  }
  
  // 頻度順にソート
  return Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
}

/**
 * 画像をカテゴリに分類
 */
function categorizeImage(
  aspectRatio: number, 
  filenameAnalysis: { keywords: string[] }, 
  dimensions: { width: number; height: number }
): { category: string; confidence: number } {
  
  const { keywords } = filenameAnalysis;
  
  // ファイル名のキーワードによる分類（高い信頼度）
  if (keywords.includes("landscape")) {
    return { category: IMAGE_CATEGORIES.LANDSCAPE, confidence: 0.9 };
  }
  if (keywords.includes("portrait") || keywords.includes("people")) {
    return { category: IMAGE_CATEGORIES.PORTRAIT, confidence: 0.9 };
  }
  if (keywords.includes("food")) {
    return { category: IMAGE_CATEGORIES.FOOD, confidence: 0.9 };
  }
  if (keywords.includes("animal")) {
    return { category: IMAGE_CATEGORIES.ANIMAL, confidence: 0.9 };
  }
  if (keywords.includes("architecture")) {
    return { category: IMAGE_CATEGORIES.ARCHITECTURE, confidence: 0.9 };
  }
  if (keywords.includes("vehicle")) {
    return { category: IMAGE_CATEGORIES.VEHICLE, confidence: 0.9 };
  }

  // アスペクト比による推測（中程度の信頼度）
  if (aspectRatio > 1.5) {
    // 横長の画像は風景の可能性が高い
    return { category: IMAGE_CATEGORIES.LANDSCAPE, confidence: 0.6 };
  } else if (aspectRatio < 0.8) {
    // 縦長の画像は人物の可能性が高い
    return { category: IMAGE_CATEGORIES.PORTRAIT, confidence: 0.6 };
  }

  // 解像度による推測
  const totalPixels = dimensions.width * dimensions.height;
  if (totalPixels > 8000000) { // 8MP以上
    // 高解像度は風景写真の可能性
    return { category: IMAGE_CATEGORIES.LANDSCAPE, confidence: 0.4 };
  }

  // デフォルト
  return { category: IMAGE_CATEGORIES.OTHER, confidence: 0.2 };
}

/**
 * 推奨タグを生成
 */
function generateSuggestedTags(
  categoryResult: { category: string; confidence: number },
  colorAnalysis: ColorAnalysis,
  filenameAnalysis: { keywords: string[]; datePattern?: string }
): string[] {
  const tags: string[] = [];

  // カテゴリベースのタグ
  switch (categoryResult.category) {
    case IMAGE_CATEGORIES.LANDSCAPE:
      tags.push("風景", "景色", "自然");
      break;
    case IMAGE_CATEGORIES.PORTRAIT:
      tags.push("人物", "ポートレート");
      break;
    case IMAGE_CATEGORIES.FOOD:
      tags.push("食べ物", "料理", "グルメ");
      break;
    case IMAGE_CATEGORIES.ANIMAL:
      tags.push("動物", "ペット");
      break;
    case IMAGE_CATEGORIES.ARCHITECTURE:
      tags.push("建築", "建物", "街並み");
      break;
    case IMAGE_CATEGORIES.VEHICLE:
      tags.push("乗り物", "交通", "旅行");
      break;
    case IMAGE_CATEGORIES.NATURE:
      tags.push("自然", "植物", "花");
      break;
  }

  // ファイル名のキーワードを追加
  tags.push(...filenameAnalysis.keywords);

  // 色ベースのタグ
  if (colorAnalysis.dominant) {
    const colorName = getColorName(colorAnalysis.dominant);
    if (colorName) tags.push(colorName);
  }

  // 日付があれば追加
  if (filenameAnalysis.datePattern) {
    tags.push("dated");
  }

  // 重複を除去して返す
  return [...new Set(tags)];
}

/**
 * 色の名前を取得（簡易版）
 */
function getColorName(hex: string): string | null {
  // 簡易的な色名マッピング
  const colorMap: Record<string, string> = {
    "#ff0000": "赤",
    "#00ff00": "緑", 
    "#0000ff": "青",
    "#ffff00": "黄色",
    "#ff00ff": "紫",
    "#00ffff": "水色",
    "#ffffff": "白",
    "#000000": "黒"
  };

  // 最も近い色を見つける（簡易版）
  return colorMap[hex] || null;
}
