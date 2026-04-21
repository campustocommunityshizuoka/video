export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* くるくる回るシンプルなスピナー */}
      <div className="animate-spin h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
    </div>
  )
}