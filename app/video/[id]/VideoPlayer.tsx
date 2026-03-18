'use client'

import { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'

export default function VideoPlayer({ videoId, alreadyViewed }: { videoId: string, alreadyViewed: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRecorded, setIsRecorded] = useState(alreadyViewed)

  useEffect(() => {
    // iframe（動画プレイヤー）が読み込まれていなければ何もしない
    if (!iframeRef.current) return

    // Vimeoプレイヤーを初期化
    const player = new Player(iframeRef.current)

    // 動画の再生位置が更新されるたびに発火するイベント
    const handleTimeUpdate = async (data: { percent: number }) => {
      // 再生位置が 80% (0.8) を超え、かつ未記録の場合のみ実行
      if (data.percent >= 0.8 && !isRecorded) {
        setIsRecorded(true) // 複数回APIを叩かないようにロックをかける
        
        try {
          // 先ほど作成した記録用APIを呼び出す
          await fetch('/api/record-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId }),
          })
          console.log('80%の視聴を検知し、完了として記録しました。')
        } catch (error) {
          console.error('記録エラー:', error)
          // 失敗した場合は再度記録できるようにロックを解除します
          setIsRecorded(false)
        }
      }
    }

    // イベントリスナーを登録
    player.on('timeupdate', handleTimeUpdate)

    // クリーンアップ関数（画面を離れたら監視を終了する）
    return () => {
      player.off('timeupdate', handleTimeUpdate)
    }
  }, [videoId, isRecorded])

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6 relative">
      <iframe 
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${videoId}`} 
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowFullScreen
      ></iframe>
      
      {/* 80%視聴を達成した際に、ユーザーに分かりやすくバッジを表示します */}
      {isRecorded && !alreadyViewed && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-bounce">
          ✓ 視聴完了
        </div>
      )}
    </div>
  )
}