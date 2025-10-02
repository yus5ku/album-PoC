"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Edit3, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"
import { mediaApi } from "@/lib/api"

// 日付変換のヘルパー関数
const convertToInputDate = (dateString: string): string => {
  try {
    // 日本語形式 (2025/10/2) を処理
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const year = parts[0].padStart(4, '0')
        const month = parts[1].padStart(2, '0')
        const day = parts[2].padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    }
    
    // ISO形式やその他の形式を処理
    const dateObj = new Date(dateString)
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0]
    }
    
    // フォールバック: 今日の日付
    return new Date().toISOString().split('T')[0]
  } catch (error) {
    console.error('Date conversion error:', error)
    return new Date().toISOString().split('T')[0]
  }
}

interface PhotoData {
  id: number
  url: string
  title: string
  date: string
  comment?: string
  originalName?: string
  uploadedAt?: string
}

export default function PhotoDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const photoId = params.id as string

  const [photo, setPhoto] = useState<PhotoData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editComment, setEditComment] = useState('')
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 写真データを取得
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const photos = await mediaApi.list()
        const foundPhoto = photos.find((p: PhotoData) => p.id === parseInt(photoId))
        if (foundPhoto) {
          setPhoto(foundPhoto)
          setEditTitle(foundPhoto.title)
          setEditComment(foundPhoto.comment || '')
          // 日付をYYYY-MM-DD形式に変換
          setEditDate(convertToInputDate(foundPhoto.date))
        } else {
          console.error('Photo not found')
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to fetch photo:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (photoId) {
      fetchPhoto()
    }
  }, [photoId, router])

  // 保存処理
  const handleSave = async () => {
    if (!photo) return

    setSaving(true)
    try {
      // 日付を日本語形式に変換
      const formattedDate = new Date(editDate).toLocaleDateString('ja-JP')
      
      const updatedPhoto = await mediaApi.update(photoId, {
        title: editTitle,
        comment: editComment,
        date: formattedDate
      })
      setPhoto(updatedPhoto)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update photo:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 編集キャンセル
  const handleCancel = () => {
    if (photo) {
      setEditTitle(photo.title)
      setEditComment(photo.comment || '')
      // 日付をYYYY-MM-DD形式に戻す
      setEditDate(convertToInputDate(photo.date))
    }
    setIsEditing(false)
  }

  // ログイン要求を削除 - 写真詳細はログインなしで閲覧可能

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">写真が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-700">写真詳細</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  編集
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 写真表示 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-auto object-contain max-h-[70vh]"
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>

            {/* 詳細情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="写真のタイトルを入力"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{photo.title}</p>
                  )}
                </div>

                {/* 日付 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    撮影日
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-600">{photo.date}</p>
                  )}
                </div>

                {/* コメント */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    コメント
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="この写真についてのコメントを入力してください..."
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {photo.comment || 'コメントはありません'}
                    </p>
                  )}
                </div>

                {/* メタデータ */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">詳細情報</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {photo.originalName && (
                      <div>
                        <span className="font-medium">元ファイル名:</span> {photo.originalName}
                      </div>
                    )}
                    {photo.uploadedAt && (
                      <div>
                        <span className="font-medium">アップロード日時:</span>{' '}
                        {new Date(photo.uploadedAt).toLocaleString('ja-JP')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
