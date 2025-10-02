"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Video, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Album } from "@/types"
import { albumsApi, mediaApi } from "@/lib/api"
import { formatFileSize, isImageFile, isVideoFile } from "@/lib/utils"

interface FileWithPreview extends File {
  preview?: string
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error'
  uploadProgress?: number
}

export default function UploadPage() {
  const { data: session } = useSession()
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchAlbums()
    }
  }, [session])

  const fetchAlbums = async () => {
    try {
      const response = await albumsApi.getAll()
      setAlbums(response.data)
    } catch (error) {
      console.error("アルバムの取得に失敗しました:", error)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      isImageFile(file.type) || isVideoFile(file.type)
    )

    const filesWithPreview = validFiles.map(file => {
      const fileWithPreview = file as FileWithPreview
      fileWithPreview.uploadStatus = 'pending'
      
      if (isImageFile(file.type)) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      
      return fileWithPreview
    })

    setFiles(prev => [...prev, ...filesWithPreview])
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.uploadStatus !== 'pending') continue

      try {
        // Update status to uploading
        setFiles(prev => {
          const newFiles = [...prev]
          newFiles[i].uploadStatus = 'uploading'
          return newFiles
        })

        const formData = new FormData()
        formData.append('file', file)
        if (selectedAlbumId) {
          formData.append('albumId', selectedAlbumId)
        }

        await mediaApi.upload(formData)

        // Update status to success
        setFiles(prev => {
          const newFiles = [...prev]
          newFiles[i].uploadStatus = 'success'
          return newFiles
        })
      } catch (error) {
        console.error(`ファイル ${file.name} のアップロードに失敗しました:`, error)
        
        // Update status to error
        setFiles(prev => {
          const newFiles = [...prev]
          newFiles[i].uploadStatus = 'error'
          return newFiles
        })
      }
    }

    setUploading(false)
  }

  const clearSuccessfulUploads = () => {
    setFiles(prev => prev.filter(file => file.uploadStatus !== 'success'))
  }

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
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
              Album Video
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold text-gray-700">メディアアップロード</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Album Selection */}
          <Card>
            <CardHeader>
              <CardTitle>アルバムを選択</CardTitle>
              <CardDescription>
                アップロードしたファイルを追加するアルバムを選択してください（任意）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">アルバムを選択しない</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>ファイルをアップロード</CardTitle>
              <CardDescription>
                写真やビデオをドラッグ&ドロップするか、クリックしてファイルを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  ファイルをここにドロップ
                </p>
                <p className="text-gray-500 mb-4">
                  または
                </p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    ファイルを選択
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  対応形式: JPG, PNG, GIF, MP4, MOV, AVI
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>選択されたファイル ({files.length})</CardTitle>
                    <CardDescription>
                      アップロードするファイルの一覧です
                    </CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={clearSuccessfulUploads}
                      variant="outline"
                      size="sm"
                      disabled={!files.some(f => f.uploadStatus === 'success')}
                    >
                      完了分をクリア
                    </Button>
                    <Button
                      onClick={uploadFiles}
                      disabled={uploading || files.every(f => f.uploadStatus !== 'pending')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? "アップロード中..." : "アップロード開始"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : isVideoFile(file.type) ? (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-500" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {file.uploadStatus === 'pending' && (
                          <span className="text-sm text-gray-500">待機中</span>
                        )}
                        {file.uploadStatus === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-blue-600">アップロード中</span>
                          </div>
                        )}
                        {file.uploadStatus === 'success' && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">完了</span>
                          </div>
                        )}
                        {file.uploadStatus === 'error' && (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">エラー</span>
                          </div>
                        )}
                        
                        {file.uploadStatus === 'pending' && (
                          <Button
                            onClick={() => removeFile(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
