"use client"

import { Button } from "@/components/ui/button"
import { LogOut, FileText, Clock, LayoutDashboard, FileBarChart, Settings } from "lucide-react"
import Image from "next/image"
import { MobileSidebar } from "@/components/mobile-sidebar"

type HeaderProps = {
  currentView: "transactions" | "pendentes" | "dashboard" | "reports" | "settings"
  onViewChange: (view: "transactions" | "pendentes" | "dashboard" | "reports" | "settings") => void
  onLogout?: () => void
  user?: { email: string; role: string; nome: string | null } | null
}

export function Header({ currentView, onViewChange, onLogout, user }: HeaderProps) {
  const isReadOnly = user?.role === "readonly"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-2 lg:gap-4">
            <MobileSidebar currentView={currentView} onViewChange={onViewChange} onLogout={onLogout} user={user} />

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative w-10 h-10 lg:w-16 lg:h-16">
                <Image src="/logo.png" alt="DJR Reciclagem" fill className="object-contain" priority />
              </div>
              <div className="border-l border-border pl-2 lg:pl-4">
                <h1 className="text-sm lg:text-xl font-bold text-foreground leading-tight">
                  <span className="hidden sm:inline">Controle de Notas - </span>DJR Recicláveis
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                  Sistema de Auditoria de Vendas
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant={currentView === "transactions" ? "default" : "ghost"}
              onClick={() => onViewChange("transactions")}
              className="gap-2 h-11 px-4"
              size="lg"
            >
              <FileText className="w-4 h-4" />
              Lançamentos
            </Button>
            <Button
              variant={currentView === "pendentes" ? "default" : "ghost"}
              onClick={() => onViewChange("pendentes")}
              className="gap-2 h-11 px-4"
              size="lg"
            >
              <Clock className="w-4 h-4" />
              Pendentes
            </Button>
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => onViewChange("dashboard")}
              className="gap-2 h-11 px-4"
              size="lg"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={currentView === "reports" ? "default" : "ghost"}
              onClick={() => onViewChange("reports")}
              className="gap-2 h-11 px-4"
              size="lg"
            >
              <FileBarChart className="w-4 h-4" />
              Relatórios
            </Button>
            {!isReadOnly && (
              <Button
                variant={currentView === "settings" ? "default" : "ghost"}
                onClick={() => onViewChange("settings")}
                className="gap-2 h-11 px-4"
                size="lg"
              >
                <Settings className="w-4 h-4" />
                Cadastros
              </Button>
            )}

            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="text-right">
                  <p className="text-xs font-medium">{user.nome || user.email}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {user.role === "admin" ? "Administrador" : "Visualização"}
                  </p>
                </div>
              </div>
            )}

            {onLogout && (
              <Button variant="ghost" onClick={onLogout} className="gap-2 h-11 px-4" size="lg">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <div className="text-right mr-1">
                <p className="text-xs font-medium truncate max-w-[100px]">{user.nome || user.email.split("@")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{user.role === "admin" ? "Admin" : "Visualização"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
