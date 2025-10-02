export interface User {
  id: string
  name: string
  email?: string
  image?: string
}

export interface Album {
  id: string
  title: string
  description?: string
  coverImageUrl?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  userId: string
  mediaCount?: number
}

export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  albumId?: string
  userId: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SlideshowJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  resultUrl?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAlbumData {
  title: string
  description?: string
  isPublic?: boolean
}

export interface UpdateAlbumData {
  title?: string
  description?: string
  isPublic?: boolean
}

export interface CreateSlideshowData {
  albumId: string
  transition?: string
  duration?: number
  music?: string
}
