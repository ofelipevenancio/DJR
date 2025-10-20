"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"
import type { Transaction } from "@/app/page"

type EditTransactionDialogProps = {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Omit<Transaction, "id" | "status">) => void
}

const BANK_ACCOUNTS = [
  { value: "sicoob-aracoop", label: "Sicoob Aracoop - Ag. 4264 - C/C 66433-2" },
  { value: "sicoob-aracredi", label: "Sicoob Aracredi - Ag. 3093 - C/C 6610-9" },
]

export function EditTransactionDialog({ transaction, open, onOpenChange, onSave }: EditTransactionDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    orderNumber: transaction.orderNumber,
    saleDate: transaction.saleDate,
    company: transaction.company,
    client: transaction.client,
    saleValue: transaction.saleValue.toString(),
    invoiceNumbers: transaction.invoiceNumbers,
    invoiceTotal: transaction.invoiceTotal.toString(),
    totalReceived: transaction.totalReceived.toString(),
    paymentMethod: transaction.paymentMethod,
    bankAccount: transaction.bankAccount,
    observations: transaction.observations,
  })

  useEffect(() => {
    setFormData({
      orderNumber: transaction.orderNumber,
      saleDate: transaction.saleDate,
      company: transaction.company,
      client: transaction.client,
      saleValue: transaction.saleValue.toString(),
      invoiceNumbers: transaction.invoiceNumbers,
      invoiceTotal: transaction.invoiceTotal.toString(),
      totalReceived: transaction.totalReceived.toString(),
      paymentMethod: transaction.paymentMethod,
      bankAccount: transaction.bankAccount,
      observations: transaction.observations,
    })
  }, [transaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleConfirmSave = () => {
    onSave({
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
    setShowConfirmation(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Lançamento</DialogTitle>
            <DialogDescription>
              Altere as informações do lançamento. Uma confirmação será solicitada antes de salvar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-orderNumber">Nº do Pedido</Label>
                <Input
                  id="edit-orderNumber"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  placeholder="PED-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-saleDate">Data da Venda</Label>
                <Input
                  id="edit-saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-company">Empresa</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData({ ...formData, company: value })}
                >
                  <SelectTrigger id="edit-company">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Klabin">Klabin</SelectItem>
                    <SelectItem value="Jaepel">Jaepel</SelectItem>
                    <SelectItem value="Fernandez">Fernandez</SelectItem>
                    <SelectItem value="Vale Tambau">Vale Tambau</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-client">Cliente</Label>
                <Input
                  id="edit-client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-saleValue">
                  Valor da Venda (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="edit-saleValue"
                  type="number"
                  step="0.01"
                  value={formData.saleValue}
                  onChange={(e) => setFormData({ ...formData, saleValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNumbers">Nº NF(s)</Label>
                <Input
                  id="edit-invoiceNumbers"
                  value={formData.invoiceNumbers}
                  onChange={(e) => setFormData({ ...formData, invoiceNumbers: e.target.value })}
                  placeholder="NF-1001, NF-1002"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-invoiceTotal">
                  Total NF (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="edit-invoiceTotal"
                  type="number"
                  step="0.01"
                  value={formData.invoiceTotal}
                  onChange={(e) => setFormData({ ...formData, invoiceTotal: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-totalReceived">
                  Total Recebido (R$) <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="edit-totalReceived"
                  type="number"
                  step="0.01"
                  value={formData.totalReceived}
                  onChange={(e) => setFormData({ ...formData, totalReceived: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">
                  Forma de Recebimento <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger id="edit-paymentMethod">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Depósito">Depósito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bankAccount">
                  Banco/Conta <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Select
                  value={formData.bankAccount}
                  onValueChange={(value) => setFormData({ ...formData, bankAccount: value })}
                >
                  <SelectTrigger id="edit-bankAccount">
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_ACCOUNTS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.label}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-observations">Observações</Label>
                <Input
                  id="edit-observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Informações adicionais"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDialogTitle>Confirmar Alteração</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Você está prestes a alterar as informações deste lançamento. Esta ação modificará os dados registrados no
              sistema.
              <br />
              <br />
              <strong>Deseja realmente continuar com esta alteração?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Confirmar Alteração</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
