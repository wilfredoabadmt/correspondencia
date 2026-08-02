import { Skeleton } from '~/components/ui/skeleton';

export default function DocumentsLoading() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
            </div>

            {/* Toolbar Skeleton */}
            <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
                <div className="p-4 space-y-2 border-b">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </main>
    );
}