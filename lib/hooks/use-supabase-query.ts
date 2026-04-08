"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type TableName = keyof Database["public"]["Tables"]

interface UseSupabaseQueryOptions {
	select?: string
	order?: { column: string; ascending?: boolean }
	enabled?: boolean
}

interface UseSupabaseQueryResult<T> {
	data: T[] | null
	error: string | null
	isLoading: boolean
	refetch: () => void
}

export function useSupabaseQuery<T>(
	tableName: TableName,
	mapper: (row: Record<string, unknown>) => T,
	options?: UseSupabaseQueryOptions,
): UseSupabaseQueryResult<T> {
	const [data, setData] = useState<T[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [fetchCount, setFetchCount] = useState(0)

	const refetch = () => setFetchCount((c) => c + 1)

	useEffect(() => {
		if (options?.enabled === false) {
			setIsLoading(false)
			return
		}

		let cancelled = false
		const supabase = createClient()

		const fetchData = async () => {
			setIsLoading(true)
			setError(null)

			const { data: rows, error: queryError } = await supabase
				.from(tableName)
				.select(options?.select ?? "*")

			if (cancelled) return

			if (queryError) {
				setError(queryError.message)
				setData(null)
				setIsLoading(false)
				return
			}

			const mapped = (rows ?? []).map((row) =>
				mapper(row as unknown as Record<string, unknown>),
			)
			setData(mapped)
			setIsLoading(false)
		}

		void fetchData()

		return () => {
			cancelled = true
		}
	}, [tableName, fetchCount, options?.enabled])

	return { data, error, isLoading, refetch }
}
