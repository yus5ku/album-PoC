"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { albumsApi } from "@/lib/api"
import { CreateAlbumData } from "@/types"

const albumSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").optional(),
  isPublic: z.boolean().default(false),
})

type AlbumFormData = z.infer<typeof albumSchema>

export default function NewAlbumPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: false,
    },
  })

  const onSubmit = async (data: AlbumFormData) => {
    if (!session) return

    setLoading(true)
    try {
      const albumData: CreateAlbumData = {
        title: data.title,
        description: data.description || undefined,
        isPublic: data.isPublic,
      }

      const response = await albumsApi.create(albumData)
      router.push(`/albums/${response.data.id}`)
    } catch (error) {
      console.error("アルバムの作成に失敗しました:", error)
      alert("アルバムの作成に失敗しました。もう一度お試しください。")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/albums" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
              Album Video
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/albums" className="text-gray-600 hover:text-blue-600">
              アルバム
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold text-gray-700">新規作成</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/albums">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              アルバム一覧に戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>新しいアルバムを作成</CardTitle>
            <CardDescription>
              写真やビデオを整理するためのアルバムを作成します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title")}
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="アルバムのタイトルを入力してください"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="アルバムの説明を入力してください（任意）"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  {...register("isPublic")}
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  このアルバムを公開する
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/albums">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      作成中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      アルバムを作成
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
