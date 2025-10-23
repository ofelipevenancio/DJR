"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Building2, CreditCard, Wallet } from "lucide-react"
import {
  fetchEmpresas,
  addEmpresa,
  editEmpresa,
  removeEmpresa,
  fetchContasBancarias,
  addContaBancaria,
  editContaBancaria,
  removeContaBancaria,
  fetchFormasRecebimento,
  addFormaRecebimento,
  editFormaRecebimento,
  removeFormaRecebimento,
} from "@/app/actions"

export type MasterDataItem = {
  id: string
  nome: string
  ativo: boolean
}

export function SettingsView() {
  const [empresas, setEmpresas] = useState<MasterDataItem[]>([])
  const [contas, setContas] = useState<MasterDataItem[]>([])
  const [formas, setFormas] = useState<MasterDataItem[]>([])

  const [newEmpresa, setNewEmpresa] = useState("")
  const [newConta, setNewConta] = useState("")
  const [newForma, setNewForma] = useState("")

  const [editingEmpresa, setEditingEmpresa] = useState<{ id: string; nome: string } | null>(null)
  const [editingConta, setEditingConta] = useState<{ id: string; nome: string } | null>(null)
  const [editingForma, setEditingForma] = useState<{ id: string; nome: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [empresasData, contasData, formasData] = await Promise.all([
      fetchEmpresas(),
      fetchContasBancarias(),
      fetchFormasRecebimento(),
    ])
    setEmpresas(empresasData)
    setContas(contasData)
    setFormas(formasData)
  }

  const handleAddEmpresa = async () => {
    if (!newEmpresa.trim()) return
    await addEmpresa(newEmpresa)
    setNewEmpresa("")
    loadData()
  }

  const handleEditEmpresa = async () => {
    if (!editingEmpresa) return
    await editEmpresa(editingEmpresa.id, editingEmpresa.nome)
    setEditingEmpresa(null)
    loadData()
  }

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return
    await removeEmpresa(id)
    loadData()
  }

  const handleAddConta = async () => {
    if (!newConta.trim()) return
    await addContaBancaria(newConta)
    setNewConta("")
    loadData()
  }

  const handleEditConta = async () => {
    if (!editingConta) return
    await editContaBancaria(editingConta.id, editingConta.nome)
    setEditingConta(null)
    loadData()
  }

  const handleDeleteConta = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta bancária?")) return
    await removeContaBancaria(id)
    loadData()
  }

  const handleAddForma = async () => {
    if (!newForma.trim()) return
    await addFormaRecebimento(newForma)
    setNewForma("")
    loadData()
  }

  const handleEditForma = async () => {
    if (!editingForma) return
    await editFormaRecebimento(editingForma.id, editingForma.nome)
    setEditingForma(null)
    loadData()
  }

  const handleDeleteForma = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta forma de recebimento?")) return
    await removeFormaRecebimento(id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cadastros</h2>
        <p className="text-muted-foreground">Gerencie empresas, contas bancárias e formas de recebimento</p>
      </div>

      <Tabs defaultValue="empresas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empresas" className="gap-2">
            <Building2 className="w-4 h-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="contas" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Contas Bancárias
          </TabsTrigger>
          <TabsTrigger value="formas" className="gap-2">
            <Wallet className="w-4 h-4" />
            Formas de Recebimento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <Card>
            <CardHeader>
              <CardTitle>Empresas</CardTitle>
              <CardDescription>Gerencie as empresas cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-empresa">Nova Empresa</Label>
                  <Input
                    id="new-empresa"
                    placeholder="Nome da empresa"
                    value={newEmpresa}
                    onChange={(e) => setNewEmpresa(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddEmpresa()}
                  />
                </div>
                <Button onClick={handleAddEmpresa} className="mt-auto gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        {editingEmpresa?.id === empresa.id ? (
                          <Input
                            value={editingEmpresa.nome}
                            onChange={(e) => setEditingEmpresa({ ...editingEmpresa, nome: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleEditEmpresa()}
                            autoFocus
                          />
                        ) : (
                          empresa.nome
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingEmpresa?.id === empresa.id ? (
                            <>
                              <Button size="sm" onClick={handleEditEmpresa}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingEmpresa(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingEmpresa({ id: empresa.id, nome: empresa.nome })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteEmpresa(empresa.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias</CardTitle>
              <CardDescription>Gerencie as contas bancárias cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-conta">Nova Conta Bancária</Label>
                  <Input
                    id="new-conta"
                    placeholder="Nome da conta bancária"
                    value={newConta}
                    onChange={(e) => setNewConta(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddConta()}
                  />
                </div>
                <Button onClick={handleAddConta} className="mt-auto gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        {editingConta?.id === conta.id ? (
                          <Input
                            value={editingConta.nome}
                            onChange={(e) => setEditingConta({ ...editingConta, nome: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleEditConta()}
                            autoFocus
                          />
                        ) : (
                          conta.nome
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingConta?.id === conta.id ? (
                            <>
                              <Button size="sm" onClick={handleEditConta}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingConta(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingConta({ id: conta.id, nome: conta.nome })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteConta(conta.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formas">
          <Card>
            <CardHeader>
              <CardTitle>Formas de Recebimento</CardTitle>
              <CardDescription>Gerencie as formas de recebimento cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-forma">Nova Forma de Recebimento</Label>
                  <Input
                    id="new-forma"
                    placeholder="Nome da forma de recebimento"
                    value={newForma}
                    onChange={(e) => setNewForma(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddForma()}
                  />
                </div>
                <Button onClick={handleAddForma} className="mt-auto gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formas.map((forma) => (
                    <TableRow key={forma.id}>
                      <TableCell>
                        {editingForma?.id === forma.id ? (
                          <Input
                            value={editingForma.nome}
                            onChange={(e) => setEditingForma({ ...editingForma, nome: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleEditForma()}
                            autoFocus
                          />
                        ) : (
                          forma.nome
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingForma?.id === forma.id ? (
                            <>
                              <Button size="sm" onClick={handleEditForma}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingForma(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingForma({ id: forma.id, nome: forma.nome })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteForma(forma.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
