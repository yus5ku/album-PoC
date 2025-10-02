"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

// Window型の拡張
declare global {
  interface Window {
    albumPhotoData?: {
      selectedFiles: File[]
      selectedPhotosData: any[]
      timestamp: number
    }
  }
}

// デバイスの写真ライブラリにアクセスする関数（モック）
const accessPhotoLibrary = async (): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*,video/*'
    
    let isResolved = false
    
    // フォーカスが戻った時の処理（キャンセルの代替検出）
    const handleFocus = () => {
      setTimeout(() => {
        if (!isResolved) {
          // ファイルが選択されていない場合のみキャンセルとみなす
          const hasFiles = input.files && input.files.length > 0
          if (!hasFiles) {
            console.log('Focus returned, no files selected - treating as cancel')
            isResolved = true
            resolve([]) // キャンセルとみなして空の配列を返す
          } else {
            console.log('Focus returned, files were selected:', input.files?.length)
          }
        }
      }, 1000) // 1秒後にチェック（時間を延長）
    }
    
    // ページの可視性が変わった時の処理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          if (!isResolved) {
            const hasFiles = input.files && input.files.length > 0
            if (!hasFiles) {
              console.log('Visibility changed, no files selected - treating as cancel')
              isResolved = true
              document.removeEventListener('visibilitychange', handleVisibilityChange)
              resolve([]) // キャンセルとみなして空の配列を返す
            } else {
              console.log('Visibility changed, files were selected:', input.files?.length)
            }
          }
        }, 1000) // 1秒後にチェック（時間を延長）
      }
    }
    
    // ファイル選択時の処理
    input.onchange = (e) => {
      if (isResolved) return
      isResolved = true
      const files = Array.from((e.target as HTMLInputElement).files || [])
      console.log('Files selected in input:', files.length)
      
      // イベントリスナーをクリーンアップ
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      resolve(files)
    }
    
    // キャンセル時の処理
    input.oncancel = () => {
      if (isResolved) return
      isResolved = true
      console.log('File selection cancelled')
      
      // イベントリスナーをクリーンアップ
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      resolve([]) // 空の配列を返す
    }
    
    window.addEventListener('focus', handleFocus, { once: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    input.click()
    
    // 10秒後にタイムアウト
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        resolve([]) // タイムアウト時も空の配列を返す
      }
    }, 10000)
  })
}

interface PhotoItem {
  id: string
  file: File
  preview: string
  selected: boolean
}

export default function PhotoPickerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  
  // 実際の選択数を計算（デバッグ用）
  const actualSelectedCount = photos.filter(p => p.selected).length

  // 状態変更を監視
  useEffect(() => {
    console.log('Photos state changed:', photos.length)
    console.log('Selected photos:', photos.filter(p => p.selected).length)
    console.log('State selectedCount:', selectedCount)
    console.log('Actual selectedCount:', actualSelectedCount)
  }, [photos, selectedCount, actualSelectedCount])

  useEffect(() => {
    console.log('Selected count state changed:', selectedCount)
  }, [selectedCount])

  // 写真ライブラリを開く
  const openPhotoLibrary = async () => {
    console.log('openPhotoLibrary called')
    setLoading(true)
    try {
      const files = await accessPhotoLibrary()
      console.log('Files received:', files.length)
      
      // キャンセルされた場合（空の配列）は何もしない
      if (files.length === 0) {
        console.log('写真選択がキャンセルされました')
        return
      }
      
      console.log('Creating photo items...')
      const newPhotoItems: PhotoItem[] = files.map((file, index) => ({
        id: `photo-new-${Date.now()}-${index}`, // ユニークなIDを生成
        file,
        preview: URL.createObjectURL(file),
        selected: false
      }))
      
      console.log('New photo items created:', newPhotoItems.length)
      
      // 重複チェック: ファイル名、サイズ、最終更新日時で判定
      setPhotos(prevPhotos => {
        console.log('Previous photos:', prevPhotos.length)
        const existingFiles = new Set(
          prevPhotos.map(photo => `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`)
        )
        
        const uniqueNewPhotos = newPhotoItems.filter(newPhoto => {
          const fileKey = `${newPhoto.file.name}-${newPhoto.file.size}-${newPhoto.file.lastModified}`
          return !existingFiles.has(fileKey)
        })
        
        console.log(`追加される新しい写真: ${uniqueNewPhotos.length}枚`)
        const updatedPhotos = [...prevPhotos, ...uniqueNewPhotos]
        console.log('Updated photos total:', updatedPhotos.length)
        
        // 選択数を更新
        const newSelectedCount = updatedPhotos.filter(p => p.selected).length
        setSelectedCount(newSelectedCount)
        console.log('Selected count updated to:', newSelectedCount)
        
        return updatedPhotos
      })
    } catch (error) {
      console.error("写真の読み込みに失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  // 写真の選択状態を切り替え
  const togglePhotoSelection = (photoId: string) => {
    setPhotos(prev => {
      const updated = prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, selected: !photo.selected }
          : photo
      )
      setSelectedCount(updated.filter(p => p.selected).length)
      return updated
    })
  }

  // 全ての選択を解除
  const clearAllSelections = () => {
    console.log('clearAllSelections called')
    console.log('Current photos before clear:', photos.length)
    console.log('Current selected count before clear:', selectedCount)
    
    setPhotos(prev => {
      const clearedPhotos = prev.map(photo => ({ ...photo, selected: false }))
      console.log('Photos after clearing selections:', clearedPhotos.length)
      console.log('Selected photos after clearing:', clearedPhotos.filter(p => p.selected).length)
      return clearedPhotos
    })
    
    setSelectedCount(0)
    console.log('Selected count set to 0')
  }

  // 選択した写真をアップロードページに渡す
  const confirmSelection = () => {
    console.log('confirmSelection called')
    console.log('Photos state:', photos.length)
    console.log('Photos type:', typeof photos)
    console.log('Photos is array:', Array.isArray(photos))
    
    if (!Array.isArray(photos)) {
      console.error('Photos is not an array:', photos)
      alert('写真データに問題があります')
      return
    }
    
    const selectedPhotos = photos.filter(p => p.selected)
    console.log('Selected photos:', selectedPhotos.length)
    console.log('Selected photos type:', typeof selectedPhotos)
    console.log('Selected photos is array:', Array.isArray(selectedPhotos))
    
    const selectedFiles = selectedPhotos.map(p => p.file)
    console.log('Selected files:', selectedFiles.length)
    console.log('Selected files type:', typeof selectedFiles)
    console.log('Selected files is array:', Array.isArray(selectedFiles))
    
    if (!Array.isArray(selectedFiles) || selectedFiles.length === 0) {
      alert('写真を選択してください')
      return
    }
    
    try {
      console.log('Selected files details:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
    } catch (error) {
      console.error('Error mapping selected files:', error)
      alert('ファイル情報の取得に失敗しました')
      return
    }
    
    // Base64エンコードを使用した確実なファイル転送
    console.log('Converting files to Base64...')
    
    try {
      const filesDataPromises = selectedFiles.map(async (file, index) => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              id: `selected-${index}`,
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              base64: reader.result as string
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
      
      const filesData = await Promise.all(filesDataPromises)
      console.log('Files converted to Base64:', filesData.length)
      
      // sessionStorageに保存
      sessionStorage.setItem('selectedPhotoFiles', JSON.stringify(filesData))
      sessionStorage.setItem('photoTransferTime', Date.now().toString())
      
      console.log('Data saved to sessionStorage')
      
      // 成功メッセージ
      alert(`${selectedFiles.length}枚の写真を選択しました。アップロードページに移動します。`)
      
      // アップロードページに移動
      router.push('/upload?from=picker&count=' + selectedFiles.length)
      
    } catch (error) {
      console.error('Error converting files:', error)
      alert('ファイルの変換中にエラーが発生しました')
      return
    }
  }

  // 自動で写真ライブラリを開く処理を削除
  // ユーザーが手動でボタンを押した時のみ開くようにする

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/upload">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">写真を選択</h1>
            </div>
            {actualSelectedCount > 0 && (
              <Button 
                onClick={() => {
                  console.log('Button clicked!')
                  confirmSelection()
                }}
                className="bg-green-600 hover:bg-green-700 relative z-10"
              >
                <Check className="w-4 h-4 mr-2" />
                {actualSelectedCount}枚を選択
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">写真を読み込み中...</p>
          </div>
        )}

        {!loading && photos.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle>写真を選択してください</CardTitle>
              <CardDescription>
                デバイスから写真を選択してアップロードしましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={openPhotoLibrary}
                className="bg-blue-600 hover:bg-blue-700"
              >
                写真ライブラリを開く
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && photos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {photos.length}枚の写真が見つかりました
                {actualSelectedCount > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    （{actualSelectedCount}枚選択中）
                  </span>
                )}
              </p>
              <div className="flex space-x-2">
                {actualSelectedCount > 0 && (
                  <Button 
                    onClick={() => {
                      console.log('Clear all selections button clicked')
                      clearAllSelections()
                    }}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    全て選択解除
                  </Button>
                )}
                <Button 
                  onClick={openPhotoLibrary}
                  variant="outline"
                >
                  他の写真を選択
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    photo.selected 
                      ? 'ring-4 ring-green-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.preview}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.selected && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
