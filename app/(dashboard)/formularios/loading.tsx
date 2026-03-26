import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<Skeleton className="h-8 w-48" />
			<div className="flex gap-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-9 w-24 rounded-full" />
				))}
			</div>
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-16 rounded-lg" />
				))}
			</div>
		</div>
	)
}
