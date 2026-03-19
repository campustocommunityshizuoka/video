'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FavoriteButton({ 
  videoId, 
  initialIsFavorited,
  textAdd,
  textRemove
}: { 
  videoId: string, 
  initialIsFavorited: boolean,
  textAdd: string,
  textRemove: string
}) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleFavorite = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
      if (res.ok) {
        setIsFavorited(!isFavorited)
        router.refresh()
      }
    } catch (error) {
      console.error('お気に入りの更新に失敗しました', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={toggleFavorite} disabled={isLoading} 
      className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors text-sm ${
        isFavorited ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      <span className={isFavorited ? "text-pink-500" : "text-gray-400"}>
        {isFavorited ? '♥' : '♡'}
      </span>
      {isFavorited ? textRemove : textAdd}
    </button>
  )
}