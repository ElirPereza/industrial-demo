import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-4 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
			<Skeleton className="h-64 rounded-xl" />
		</div>
	)
}
