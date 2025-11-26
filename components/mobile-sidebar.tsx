"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, FileText, Clock, LayoutDashboard, FileBarChart, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type MobileSidebarProps = {
  currentView: "transactions" | "pendentes" | "dashboard" | "reports" | "settings"
  onViewChange: (view: "transactions" | "pendentes" | "dashboard" | "reports" | "settings") => void
  onLogout?: () => void
  user?: { email: string; role: string; nome: string | null } | null
}

export function MobileSidebar({ currentView, onViewChange, onLogout, user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const isReadOnly = user?.role === "readonly"

  const menuItems = [
    { id: "transactions" as const, label: "Lançamentos", icon: FileText },
    { id: "pendentes" as const, label: "Pendentes", icon: Clock },
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "reports" as const, label: "Relatórios", icon: FileBarChart },
    ...(!isReadOnly ? [{ id: "settings" as const, label: "Cadastros", icon: Settings }] : []),
  ]

  const handleViewChange = (view: "transactions" | "pendentes" | "dashboard" | "reports" | "settings") => {
    onViewChange(view)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="DJR Reciclagem" fill className="object-contain" priority />
            </div>
            <div>
              <SheetTitle className="text-left text-base">DJR Recicláveis</SheetTitle>
              <p className="text-xs text-muted-foreground">Sistema de Auditoria</p>
            </div>
          </div>
        </SheetHeader>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b bg-muted/30">
            <p className="text-sm font-medium truncate">{user.nome || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.role === "admin" ? "Administrador" : "Visualização"}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col p-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`justify-start gap-3 h-12 text-base ${isActive ? "" : "text-muted-foreground"}`}
                onClick={() => handleViewChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
              onClick={() => {
                onLogout()
                setOpen(false)
              }}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
