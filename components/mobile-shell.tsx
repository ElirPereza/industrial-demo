import {
	BellRinging,
	ClipboardText,
	House,
	UserCircle,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"

const NAV_ITEMS = [
	{ label: "Inicio", href: "/mobile/tecnico", icon: House },
	{ label: "Alertas", href: "/mobile/alertas", icon: BellRinging },
	{ label: "Órdenes", href: "/mobile/ordenes", icon: ClipboardText },
	{ label: "Perfil", href: "/mobile/contratista", icon: UserCircle },
]

export function MobileShell({
	children,
	activeTab,
}: {
	children: ReactNode
	activeTab: string
}) {
	return (
		<div className="flex min-h-svh items-center justify-center bg-[#1a1a1a] p-8">
			<div
				className="relative w-[430px] overflow-hidden rounded-[55px] border-[3px] border-[#2a2a2a] bg-background shadow-[0_0_80px_rgba(0,0,0,0.5)]"
				style={{ height: 932 }}
			>
				<div className="absolute left-1/2 top-3 z-50 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />

				<div className="relative z-40 flex items-center justify-between px-8 pt-[18px] text-xs font-semibold text-foreground">
					<span>9:41</span>
					<div className="flex items-center gap-1.5">
						<span className="text-[10px]">5G</span>
						<span className="text-[10px]">📶</span>
						<span className="text-[10px]">🔋</span>
					</div>
				</div>

				<div
					className="flex flex-col"
					style={{ height: "calc(932px - 54px - 34px)" }}
				>
					<div className="flex-1 overflow-y-auto">{children}</div>

					<div className="flex items-center justify-around border-t border-border bg-background/80 px-2 pb-2 pt-2 backdrop-blur-xl">
						{NAV_ITEMS.map((item) => {
							const isActive = activeTab === item.href
							return (
								<a
									key={item.href}
									href={item.href}
									className="flex flex-col items-center gap-1"
								>
									<item.icon
										className={
											isActive
												? "size-[22px] text-primary"
												: "size-[22px] text-muted-foreground"
										}
										weight={isActive ? "fill" : "regular"}
									/>
									<span
										className={
											isActive
												? "text-[11px] text-primary"
												: "text-[11px] text-muted-foreground"
										}
									>
										{item.label}
									</span>
								</a>
							)
						})}
					</div>
				</div>

				<div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
			</div>
		</div>
	)
}
