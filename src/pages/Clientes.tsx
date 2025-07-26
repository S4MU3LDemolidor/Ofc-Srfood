import { useState, useEffect } from 'react';
import { Cliente, ClienteFormData } from '@/types';
import { clienteStorage, fileToBase64 } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building, Mail, Phone, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<ClienteFormData>({
    defaultValues: {
      nomeCliente: '',
      email: '',
      telefone: '',
    }
  });

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (editingCliente) {
      form.reset({
        nomeCliente: editingCliente.nomeCliente,
        email: editingCliente.email,
        telefone: editingCliente.telefone,
      });
      setLogoPreview(editingCliente.logo || '');
    } else {
      form.reset({
        nomeCliente: '',
        email: '',
        telefone: '',
      });
      setLogoPreview('');
    }
  }, [editingCliente, form]);

  const loadClientes = () => {
    const allClientes = clienteStorage.getAll();
    setClientes(allClientes);
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setLogoPreview(base64);
        form.setValue('logo', file);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao processar a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      let logoBase64 = '';
      if (data.logo) {
        logoBase64 = await fileToBase64(data.logo);
      } else if (editingCliente && logoPreview) {
        logoBase64 = logoPreview;
      }

      if (editingCliente) {
        clienteStorage.update(editingCliente.id, {
          nomeCliente: data.nomeCliente,
          email: data.email,
          telefone: data.telefone,
          logo: logoBase64,
        });
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        clienteStorage.create({
          nomeCliente: data.nomeCliente,
          email: data.email,
          telefone: data.telefone,
          logo: logoBase64,
        });
        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso.",
        });
      }

      loadClientes();
      setIsDialogOpen(false);
      setEditingCliente(null);
      form.reset();
      setLogoPreview('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDeleteCliente = (id: string) => {
    clienteStorage.delete(id);
    loadClientes();
    toast({
      title: "Cliente excluído",
      description: "O cliente foi excluído com sucesso.",
    });
  };

  const openNewClienteDialog = () => {
    setEditingCliente(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes das fichas técnicas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewClienteDialog} className="bg-gradient-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  {...form.register('nomeCliente', { required: true })}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email', { required: true })}
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...form.register('telefone', { required: true })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Cliente</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="flex-1"
                    />
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoPreview('');
                          form.setValue('logo', undefined);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Preview do logo"
                        className="h-16 w-16 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 min-h-[44px]"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-primary min-h-[44px]">
                  {editingCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-card p-4 rounded-lg shadow-card">
        <div className="text-2xl font-bold text-primary">{clientes.length}</div>
        <div className="text-sm text-muted-foreground">Total de Clientes</div>
      </div>

      {/* Client Cards */}
      {clientes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando seu primeiro cliente para associar às fichas técnicas.
          </p>
          <Button onClick={openNewClienteDialog} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map(cliente => (
            <Card key={cliente.id} className="bg-gradient-card shadow-card hover:shadow-elegant transition-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {cliente.logo ? (
                      <img
                        src={cliente.logo}
                        alt={cliente.nomeCliente}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gradient-primary flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{cliente.nomeCliente}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{cliente.telefone}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCliente(cliente)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o cliente "{cliente.nomeCliente}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCliente(cliente.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}