"use client"

import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Image as ImageIcon, Play, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthSignin":
        return "OAuth認証でエラーが発生しました。もう一度お試しください。"
      case "OAuthCallback":
        return "認証処理中にエラーが発生しました。もう一度お試しください。"
      case "OAuthCreateAccount":
        return "アカウント作成中にエラーが発生しました。"
      case "EmailCreateAccount":
        return "メールアカウント作成中にエラーが発生しました。"
      case "Callback":
        return "認証コールバック中にエラーが発生しました。"
      case "OAuthAccountNotLinked":
        return "このアカウントは既に別の認証方法でリンクされています。"
      case "EmailSignin":
        return "メール認証でエラーが発生しました。"
      case "CredentialsSignin":
        return "認証情報が正しくありません。"
      case "SessionRequired":
        return "このページにアクセスするにはログインが必要です。"
      default:
        return error ? "認証中にエラーが発生しました。もう一度お試しください。" : null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Album Video
          </h1>
          <p className="text-gray-600">
            写真とビデオを整理し、スライドショーを作成
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm">{getErrorMessage(error)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* サインインカード */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-gray-900">ログイン</CardTitle>
            <CardDescription className="text-gray-600">
              アカウントにサインインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers && Object.values(providers).map((provider) => (
              <div key={provider.name}>
                {provider.id === "line" && (
                  <Button
                    onClick={() => signIn(provider.id, { callbackUrl })}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    size="lg"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    <span>LINEでログイン</span>
                  </Button>
                )}
              </div>
            ))}

            {!providers && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600">読み込み中...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            ホームに戻る
          </Link>
        </div>

        {/* 機能紹介 */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-600">アルバム管理</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Camera className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">メディア保存</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-purple-100 p-2 rounded-full">
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">スライドショー</span>
          </div>
        </div>
      </div>
    </div>
  )
}
