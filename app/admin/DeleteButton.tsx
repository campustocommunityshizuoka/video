'use client'

export default function DeleteButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => {
        if(!confirm('本当に削除しますか？（視聴履歴も影響を受ける可能性があります）')) {
          e.preventDefault()
        }
      }}
      className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-500 px-3 py-1.5 rounded bg-gray-800 transition-colors"
    >
      削除
    </button>
  )
}