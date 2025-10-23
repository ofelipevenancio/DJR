"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Transaction } from "@/app/page"

type TransactionFormProps = {
  onSubmit: (transaction: Omit<Transaction, "id" | "status">) => void
}

type MasterData = {
  empresas: Array<{ id: number; nome: string }>
  contasBancarias: Array<{ id: number; nome: string; agencia: string; conta: string }>
  formasRecebimento: Array<{ id: number; nome: string }>
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: "",
    saleDate: "",
    company: "",
    client: "",
    saleValue: "",
    invoiceNumbers: "",
    invoiceTotal: "",
    totalReceived: "",
    paymentMethod: "",
    bankAccount: "",
    observations: "",
  })

  const [masterData, setMasterData] = useState<MasterData>({
    empresas: [],
    contasBancarias: [],
    formasRecebimento: [],
  })

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [empresasRes, contasRes, formasRes] = await Promise.all([
          fetch("/api/master-data/empresas"),
          fetch("/api/master-data/contas-bancarias"),
          fetch("/api/master-data/formas-recebimento"),
        ])

        const empresas = await empresasRes.json()
        const contasBancarias = await contasRes.json()
        const formasRecebimento = await formasRes.json()

        setMasterData({ empresas, contasBancarias, formasRecebimento })
      } catch (error) {
        console.error("[v0] Error fetching master data:", error)
      }
    }

    fetchMasterData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      orderNumber: formData.orderNumber,
      saleDate: formData.saleDate,
      company: formData.company,
      client: formData.client,
      saleValue: Number.parseFloat(formData.saleValue) || 0,
      invoiceNumbers: formData.invoiceNumbers,
      invoiceTotal: Number.parseFloat(formData.invoiceTotal) || 0,
      totalReceived: Number.parseFloat(formData.totalReceived) || 0,
      paymentMethod: formData.paymentMethod,
      bankAccount: formData.bankAccount,
      observations: formData.observations,
    })

    // Reset form
    setFormData({
      orderNumber: "",
      saleDate: "",
      company: "",
      client: "",
      saleValue: "",
      invoiceNumbers: "",
      invoiceTotal: "",
      totalReceived: "",
      paymentMethod: "",
      bankAccount: "",
      observations: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Nº do Pedido</Label>
          <Input
            id="orderNumber"
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            placeholder="PED-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saleDate">Data da Venda</Label>
          <Input
            id="saleDate"
            type="date"
            value={formData.saleDate}
            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Select
            value={formData.company}
            onValueChange={(value) => setFormData({ ...formData, company: value })}
            required
          >
            <SelectTrigger id="company">
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              {masterData.empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.nome}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Cliente</Label>
          <Input
            id="client"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Nome do cliente"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saleValue">
            Valor da Venda (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="saleValue"
            type="number"
            step="0.01"
            value={formData.saleValue}
            onChange={(e) => setFormData({ ...formData, saleValue: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumbers">Nº NF(s) / Nº Ticket</Label>
          <Input
            id="invoiceNumbers"
            value={formData.invoiceNumbers}
            onChange={(e) => setFormData({ ...formData, invoiceNumbers: e.target.value })}
            placeholder="NF-1001, NF-1002"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceTotal">
            Total NF (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="invoiceTotal"
            type="number"
            step="0.01"
            value={formData.invoiceTotal}
            onChange={(e) => setFormData({ ...formData, invoiceTotal: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalReceived">
            Total Recebido (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="totalReceived"
            type="number"
            step="0.01"
            value={formData.totalReceived}
            onChange={(e) => setFormData({ ...formData, totalReceived: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">
            Forma de Recebimento <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {masterData.formasRecebimento.map((forma) => (
                <SelectItem key={forma.id} value={forma.nome}>
                  {forma.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankAccount">
            Banco/Conta <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Select
            value={formData.bankAccount}
            onValueChange={(value) => setFormData({ ...formData, bankAccount: value })}
          >
            <SelectTrigger id="bankAccount">
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              {masterData.contasBancarias.map((conta) => (
                <SelectItem key={conta.id} value={`${conta.nome} - Ag. ${conta.agencia} - C/C ${conta.conta}`}>
                  {conta.nome} - Ag. {conta.agencia} - C/C {conta.conta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="observations">Observações</Label>
          <Input
            id="observations"
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            placeholder="Informações adicionais"
          />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto gap-2">
        <Plus className="w-4 h-4" />
        Adicionar Lançamento
      </Button>
    </form>
  )
}
