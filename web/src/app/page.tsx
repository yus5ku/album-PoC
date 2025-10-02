"use client"

import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Video, Image as ImageIcon, Play } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Album Video
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              写真とビデオを美しく整理し、思い出を素敵なスライドショーに変換できるアルバムアプリケーション
            </p>
            <Button 
              onClick={() => signIn("line")} 
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
            >
              LINEでログイン
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>写真管理</CardTitle>
                <CardDescription>
                  写真を簡単にアップロードし、アルバムごとに整理できます
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Video className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>動画対応</CardTitle>
                <CardDescription>
                  動画ファイルもサポート。写真と一緒に管理できます
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Play className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <CardTitle>スライドショー</CardTitle>
                <CardDescription>
                  写真から美しいスライドショー動画を自動生成します
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Album Video</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">こんにちは、{session.user?.name}さん</span>
              <Button variant="outline" onClick={() => signIn()}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/albums">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <ImageIcon className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>アルバム管理</CardTitle>
                <CardDescription>
                  写真とビデオを整理してアルバムを作成
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Camera className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>メディアアップロード</CardTitle>
                <CardDescription>
                  新しい写真やビデオをアップロード
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/slideshow">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Play className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>スライドショー</CardTitle>
                <CardDescription>
                  アルバムからスライドショーを作成
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
