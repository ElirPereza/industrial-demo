import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{["a", "b", "c", "d", "e", "f"].map((key) => (
					<Skeleton key={key} className="h-40 rounded-xl" />
				))}
			</div>
		</div>
	)
}
