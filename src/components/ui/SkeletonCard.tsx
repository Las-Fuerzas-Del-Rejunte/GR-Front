interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard = ({ count = 1 }: SkeletonCardProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200 relative overflow-hidden"
        >
          {/* Efecto shimmer */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-neutral-200 rounded w-24 animate-pulse"></div>
            <div className="h-5 bg-neutral-200 rounded w-16 animate-pulse"></div>
          </div>

          {/* Title */}
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse"></div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-neutral-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-neutral-200 rounded w-5/6 animate-pulse"></div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-neutral-200 rounded-full animate-pulse"></div>
              <div className="h-3 bg-neutral-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-3 bg-neutral-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
};
