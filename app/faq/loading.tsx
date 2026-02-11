export default function FaqLoading() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
          <div className="h-6 w-96 max-w-full bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* FAQ items skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
