"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Upload, Plus, Grid, List, Search, Filter, Trash2, X } from "lucide-react"
import Link from "next/link"
import { mediaApi, handleApiError } from "@/lib/api"

// サンプル写真データ
const samplePhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    title: "美しい山の風景",
    date: "2024-01-15"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    title: "森の小道",
    date: "2024-01-14"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    title: "湖の夕日",
    date: "2024-01-13"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop",
    title: "雪山の頂上",
    date: "2024-01-12"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop",
    title: "海岸線",
    date: "2024-01-11"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    title: "花畑",
    date: "2024-01-10"
  }
]

export default function Home() {
  const { data: session, status } = useSession()
  const [photos, setPhotos] = useState([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, photo: { id: number; url: string; title: string; date: string } | null}>({isOpen: false, photo: null})
  const [isDeleting, setIsDeleting] = useState(false)

  // 写真を取得する関数
  const fetchPhotos = async () => {
    try {
      const response = await mediaApi.list()
      console.log('取得した写真データ:', response)
      
      // 古いURL.createObjectURLのデータをフィルタリング
      const validPhotos = response.filter((photo: any) => {
        const isValidUrl = photo.url && (photo.url.startsWith('data:') || photo.url.startsWith('http'))
        if (!isValidUrl) {
          console.warn('無効なURL:', photo.title, photo.url)
        }
        return isValidUrl
      })
      
      console.log('有効な写真データ:', validPhotos.length, '件')
      setPhotos(validPhotos)
    } catch (error) {
      console.error("写真の取得に失敗しました:", error)
      // エラーの場合は空の配列を設定
      setPhotos([])
    }
  }


  useEffect(() => {
    // 開発者向け：古いデータクリア機能をwindowオブジェクトに追加
    if (typeof window !== 'undefined') {
      (window as any).clearPhotoData = () => {
        localStorage.removeItem('uploadedPhotos')
        setPhotos([])
        console.log('写真データをクリアしました。ページをリロードしてください。')
      }
      
      (window as any).debugPhotoData = () => {
        const data = localStorage.getItem('uploadedPhotos')
        if (data) {
          const photos = JSON.parse(data)
          console.log('現在の写真データ:', photos)
          photos.forEach((photo: any, index: number) => {
            console.log(`写真${index + 1}:`, {
              id: photo.id,
              title: photo.title,
              urlType: photo.url?.startsWith('data:') ? 'Base64' : photo.url?.startsWith('blob:') ? 'Blob URL (無効)' : 'その他',
              urlLength: photo.url?.length || 0,
              urlPreview: photo.url?.substring(0, 100) + '...'
            })
          })
        } else {
          console.log('写真データがありません')
        }
      }
      
      (window as any).testImageDisplay = () => {
        const data = localStorage.getItem('uploadedPhotos')
        if (data) {
          const photos = JSON.parse(data)
          if (photos.length > 0) {
            const testImg = document.createElement('img')
            testImg.src = photos[0].url
            testImg.style.width = '200px'
            testImg.style.height = '200px'
            testImg.style.border = '2px solid red'
            testImg.onload = () => console.log('テスト画像読み込み成功')
            testImg.onerror = () => console.log('テスト画像読み込み失敗')
            document.body.appendChild(testImg)
            console.log('テスト画像を追加しました')
          }
        }
      }
    }

    if (session) {
      fetchPhotos()
    }
  }, [session])

  // 削除確認モーダルを開く
  const openDeleteModal = (photo: { id: number; url: string; title: string; date: string }) => {
    setDeleteModal({isOpen: true, photo})
  }

  // 削除確認モーダルを閉じる
  const closeDeleteModal = () => {
    setDeleteModal({isOpen: false, photo: null})
  }

  // 写真を削除する
  const deletePhoto = async () => {
    if (!deleteModal.photo) return
    
    setIsDeleting(true)
    try {
      // 実際のAPI呼び出し
      await mediaApi.delete(String(deleteModal.photo.id))
      
      // ローカルの状態から削除
      setPhotos(prevPhotos => prevPhotos.filter((p: { id: number }) => p.id !== deleteModal.photo?.id))
      
      closeDeleteModal()
      
      // 成功メッセージ（オプション）
      // toast.success('写真を削除しました')
    } catch (error) {
      console.error('削除に失敗しました:', error)
      const errorMessage = handleApiError(error)
      alert(`削除に失敗しました: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            Album Video
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
            写真とビデオを整理し、スライドショーを作成できるアルバムアプリケーション
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => signIn("line")} 
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              LINEでログイン
            </Button>
            <div className="text-sm text-gray-500 max-w-md mx-auto">
              <p className="mb-2">LINEアカウントでログインして、写真アルバムを作成・管理できます</p>
              <p className="text-xs mb-2">※ 誰でもご利用いただけます</p>
              <details className="text-xs text-left">
                <summary className="cursor-pointer hover:text-gray-700 mb-2">初回セットアップが必要な場合</summary>
                <div className="bg-gray-100 p-3 rounded text-xs space-y-1">
                  <p>1. <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LINE Developers Console</a> でアプリを作成</p>
                  <p>2. Channel ID と Channel Secret を取得</p>
                  <p>3. コールバックURL: <code className="bg-white px-1">http://localhost:3000/api/auth/callback/line</code></p>
                  <p>4. 環境変数を設定してサーバー再起動</p>
                  <p className="text-green-600">詳細は docs/LINE_AUTH_SETUP.md を参照</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Album Video</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">こんにちは、{session.user?.name}さん</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ナビゲーションバー */}
      <nav className="bg-green-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-6">
              <span className="font-semibold">アルバム一覧</span>
              <Link href="/upload" className="hover:bg-green-600 px-3 py-1 rounded transition-colors">
                投稿する
              </Link>
              <Link href="/slideshow" className="hover:bg-green-600 px-3 py-1 rounded transition-colors">
                スライドショーの再生
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {/* 表示切り替えボタンを削除してグリッド表示のみに */}
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        {/* 検索・フィルター */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="写真を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              フィルター
            </Button>
            <Link href="/upload">
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                写真を追加
              </Button>
            </Link>
          </div>
        </div>

        {/* 写真グリッド */}
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              写真がありません
            </h2>
            <p className="text-gray-500 mb-8">
              最初の写真をアップロードして、アルバムを作成しましょう
            </p>
            <Link href="/upload">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                <Upload className="w-5 h-5 mr-2" />
                写真をアップロード
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
            {photos.map((photo: { id: number; url: string; title: string; date: string }) => (
              <div key={photo.id} className="w-full">
                <Link href={`/photo/${photo.id}`}>
                  <div className="group cursor-pointer relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="eager"
                        style={{
                          height: 'auto',
                          maxHeight: '350px',
                          minHeight: '120px',
                          aspectRatio: 'auto',
                          backgroundColor: '#f3f4f6' // 読み込み中の背景色
                        }}
                        onLoadStart={() => {
                          console.log('画像読み込み開始:', photo.title);
                        }}
                        onLoad={(e) => {
                          // 画像読み込み完了時の処理
                          const img = e.target as HTMLImageElement;
                          const aspectRatio = img.naturalWidth / img.naturalHeight;
                          
                          // 縦長画像の場合は高さを制限
                          if (aspectRatio < 0.75) {
                            img.style.height = '280px';
                            img.style.objectFit = 'cover';
                          }
                          // 横長画像の場合
                          else if (aspectRatio > 1.5) {
                            img.style.height = '180px';
                            img.style.objectFit = 'cover';
                          }
                          // 正方形に近い画像
                          else {
                            img.style.height = 'auto';
                            img.style.maxHeight = '250px';
                          }
                        }}
                        onError={(e) => {
                          console.error(`画像読み込みエラー: ${photo.title}`, {
                            url: photo.url?.substring(0, 50) + '...',
                            urlType: photo.url?.startsWith('data:') ? 'Base64' : photo.url?.startsWith('blob:') ? 'Blob URL (無効)' : 'その他'
                          });
                          // エラー時の代替表示
                          const img = e.target as HTMLImageElement;
                          img.style.backgroundColor = '#f3f4f6';
                          img.style.border = '2px dashed #d1d5db';
                          img.style.color = '#6b7280';
                          img.style.display = 'flex';
                          img.style.alignItems = 'center';
                          img.style.justifyContent = 'center';
                          img.style.fontSize = '12px';
                          img.style.textAlign = 'center';
                          img.style.padding = '20px';
                          img.alt = '画像を読み込めませんでした';
                          
                          // 親要素にメッセージを追加
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-xs';
                            errorDiv.innerHTML = '画像を<br>読み込めません';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                      {/* オーバーレイ */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                      
                      {/* 削除ボタン（ホバー時に表示） */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openDeleteModal(photo)
                        }}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform scale-90 group-hover:scale-100"
                        title="写真を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* 写真情報 */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 truncate mb-1">{photo.title}</p>
                      <p className="text-xs text-gray-500">{photo.date}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 削除確認モーダル */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">写真を削除</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {deleteModal.photo && (
                <div className="mb-6">
                  <img
                    src={deleteModal.photo.url}
                    alt={deleteModal.photo.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>{deleteModal.photo.title}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {deleteModal.photo.date}
                  </p>
                </div>
              )}
              
              <p className="text-gray-700 mb-6">
                この写真を削除してもよろしいですか？この操作は取り消すことができません。
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={deletePhoto}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      削除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除する
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
