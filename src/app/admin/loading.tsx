import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="mt-5 h-10 w-full max-w-xl rounded-full" />
          <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full" />
          <Skeleton className="mt-2 h-5 w-2/3 rounded-full" />
          <div className="mt-5 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`admin-stat-skeleton-${index}`}
            className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`admin-chart-skeleton-${index}`}
            className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-soft"
          >
            <div className="border-b border-border/70 px-5 py-5">
              <Skeleton className="h-7 w-44 rounded-full" />
              <Skeleton className="mt-2 h-4 w-64 rounded-full" />
            </div>
            <div className="px-5 py-5">
              <Skeleton className="h-72 rounded-[24px]" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-border/80 bg-background shadow-soft">
        <div className="border-b border-border/70 px-5 py-5">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-full" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`admin-row-skeleton-${index}`} className="h-20 rounded-3xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
