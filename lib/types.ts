/**
 * Standard return type for all Server Actions.
 * Server Actions MUST return this type — never throw errors.
 */
export type ActionResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string }
