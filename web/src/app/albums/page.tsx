"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Image as ImageIcon, Calendar, Lock, Globe } from "lucide-react"
import Link from "next/link"
import { Album } from "@/types"
import { albumApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function AlbumsPage() {
  const { data: session } = useSession()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAlbums()
    }
  }, [session])

  const fetchAlbums = async () => {
    try {
      const response = await albumApi.list()
      setAlbums(response)
    } catch (error) {
      console.error("アルバムの取得に失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">アルバムを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                Album Video
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-700">アルバム</h1>
            </div>
            <Link href="/albums/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新しいアルバム
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {albums.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              アルバムがありません
            </h2>
            <p className="text-gray-500 mb-8">
              最初のアルバムを作成して、写真やビデオを整理しましょう
            </p>
            <Link href="/albums/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                アルバムを作成
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <Link key={album.id} href={`/albums/${album.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {album.isPublic ? (
                        <Globe className="w-4 h-4 text-green-600 bg-white rounded-full p-0.5" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-600 bg-white rounded-full p-0.5" />
                      )}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate">{album.title}</CardTitle>
                    {album.description && (
                      <CardDescription className="line-clamp-2">
                        {album.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        <span>{album.mediaCount || 0}枚</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(album.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
