import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6 py-8 sm:py-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-[28rem] max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-14" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </aside>

        <section className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border/80 bg-background/95"
              >
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="border-t border-border/70 p-4">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

