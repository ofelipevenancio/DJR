"use client"

import { Button } from "@/components/ui/button"
import { LogOut, FileText, Clock, LayoutDashboard, FileBarChart } from "lucide-react"
import Image from "next/image"

type HeaderProps = {
  currentView: "transactions" | "pendentes" | "dashboard" | "reports"
  onViewChange: (view: "transactions" | "pendentes" | "dashboard" | "reports") => void
  onLogout?: () => void
}

export function Header({ currentView, onViewChange, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image src="/logo.png" alt="DJR Reciclagem" fill className="object-contain" priority />
            </div>
            <div className="border-l border-border pl-4">
              <h1 className="text-xl font-bold text-foreground leading-tight">Controle de Notas - DJR Recicláveis</h1>
              <p className="text-sm text-muted-foreground">Sistema de Auditoria de Vendas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            {onLogout && (
              <Button
                variant="ghost"
                onClick={onLogout}
                className="gap-2 h-11 px-4 text-muted-foreground hover:text-foreground ml-2 border-l border-border"
                size="lg"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
