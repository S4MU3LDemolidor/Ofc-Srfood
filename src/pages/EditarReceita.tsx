import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FichaTecnica, Cliente, Ingrediente, Passo } from '@/types';
import { fichaStorage, clienteStorage, ingredienteStorage, passoStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fichaSchema = z.object({
  tipoFicha: z.string().min(1, 'Tipo da ficha é obrigatório'),
  nomeReceita: z.string().min(1, 'Nome da receita é obrigatório'),
  pesoPreparacao: z.string().min(1, 'Peso da preparação é obrigatório'),
  pesoPorcao: z.string().min(1, 'Peso da porção é obrigatório'),
  utensilhosNecessarios: z.string().min(1, 'Utensílios são obrigatórios'),
  aprovadoPor: z.string().min(1, 'Aprovado por é obrigatório'),
  tempoPreparo: z.string().min(1, 'Tempo de preparo é obrigatório'),
  rendimento: z.string().min(1, 'Rendimento é obrigatório'),
  realizadoPor: z.string().min(1, 'Realizado por é obrigatório'),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
});

export default function EditarReceita() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [fotoProduto, setFotoProduto] = useState<string>('');

  const form = useForm<z.infer<typeof fichaSchema>>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      tipoFicha: '',
      nomeReceita: '',
      pesoPreparacao: '',
      pesoPorcao: '',
      utensilhosNecessarios: '',
      aprovadoPor: '',
      tempoPreparo: '',
      rendimento: '',
      realizadoPor: '',
      empresa: '',
      clienteId: '',
    },
  });

  useEffect(() => {
    setClientes(clienteStorage.getAll());
    if (id) {
      loadRecipeData(id);
    }
  }, [id]);

  const loadRecipeData = (fichaId: string) => {
    const ficha = fichaStorage.getById(fichaId);
    if (ficha) {
      form.reset({
        tipoFicha: ficha.tipoFicha,
        nomeReceita: ficha.nomeReceita,
        pesoPreparacao: ficha.pesoPreparacao.toString(),
        pesoPorcao: ficha.pesoPorcao.toString(),
        utensilhosNecessarios: Array.isArray(ficha.utensilhosNecessarios) 
          ? ficha.utensilhosNecessarios.join(', ') 
          : ficha.utensilhosNecessarios,
        aprovadoPor: ficha.aprovadoPor,
        tempoPreparo: ficha.tempoPreparo.toString(),
        rendimento: ficha.rendimento.toString(),
        realizadoPor: ficha.realizadoPor,
        empresa: ficha.empresa,
        clienteId: ficha.clienteId,
      });
      setFotoProduto(ficha.fotoProduto || '');
      setIngredientes(ingredienteStorage.getByFichaId(fichaId));
      setPassos(passoStorage.getByFichaId(fichaId));
    }
  };

  const onSubmit = (values: z.infer<typeof fichaSchema>) => {
    if (!id) return;

    try {
      const updatedFicha: FichaTecnica = {
        id,
        tipoFicha: values.tipoFicha,
        nomeReceita: values.nomeReceita,
        pesoPreparacao: parseInt(values.pesoPreparacao),
        pesoPorcao: parseInt(values.pesoPorcao),
        utensilhosNecessarios: values.utensilhosNecessarios.split(',').map(u => u.trim()),
        aprovadoPor: values.aprovadoPor,
        tempoPreparo: parseInt(values.tempoPreparo),
        rendimento: parseInt(values.rendimento),
        realizadoPor: values.realizadoPor,
        empresa: values.empresa,
        clienteId: values.clienteId,
        fotoProduto,
        createdAt: fichaStorage.getById(id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fichaStorage.update(id, updatedFicha);

      // Update ingredients
      const existingIngredientes = ingredienteStorage.getByFichaId(id);
      existingIngredientes.forEach(ing => ingredienteStorage.delete(ing.id));
      ingredientes.forEach(ingrediente => {
        if (ingrediente.ingrediente && ingrediente.quantidade && ingrediente.medidaCaseira) {
          ingredienteStorage.create({
            ...ingrediente,
            fichaId: id
          });
        }
      });

      // Update steps
      const existingPassos = passoStorage.getByFichaId(id);
      existingPassos.forEach(passo => passoStorage.delete(passo.id));
      passos.forEach(passo => {
        if (passo.passo) {
          passoStorage.create({
            ...passo,
            fichaId: id
          });
        }
      });

      toast({
        title: "Receita atualizada",
        description: "A receita foi atualizada com sucesso.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar a receita.",
        variant: "destructive",
      });
    }
  };

  const addIngrediente = () => {
    setIngredientes([...ingredientes, {
      id: Date.now().toString(),
      fichaId: '',
      ingrediente: '',
      quantidade: 0,
      medidaCaseira: ''
    }]);
  };

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const updateIngrediente = (index: number, field: keyof Ingrediente, value: string | number) => {
    const updated = [...ingredientes];
    if (field === 'quantidade') {
      updated[index] = { ...updated[index], [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredientes(updated);
  };

  const addPasso = () => {
    setPassos([...passos, {
      id: Date.now().toString(),
      fichaId: '',
      passo: '',
      foto: ''
    }]);
  };

  const removePasso = (index: number) => {
    setPassos(passos.filter((_, i) => i !== index));
  };

  const updatePasso = (index: number, field: keyof Passo, value: string) => {
    const updated = [...passos];
    updated[index] = { ...updated[index], [field]: value };
    setPassos(updated);
  };

  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Receita</h1>
          <p className="text-muted-foreground">Atualize os dados da ficha técnica</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoFicha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo da Ficha</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="Subficha">Subficha</SelectItem>
                          <SelectItem value="Prato principal">Prato principal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map(cliente => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nomeCliente}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nomeReceita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Receita</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da receita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tempoPreparo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Preparo (min)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rendimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rendimento (porções)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pesoPorcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso por Porção (g)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pesoPreparacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso da Preparação (g)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utensilhosNecessarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utensílios Necessários</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Panela, colher de pau, liquidificador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="realizadoPor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Realizado por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aprovadoPor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprovado por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do aprovador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Foto do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, setFotoProduto);
                      }
                    }}
                  />
                </div>
                {fotoProduto && (
                  <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <img src={fotoProduto} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ingredientes</CardTitle>
                <Button type="button" onClick={addIngrediente} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ingrediente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Ingrediente"
                        value={ingrediente.ingrediente}
                        onChange={(e) => updateIngrediente(index, 'ingrediente', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Qtd"
                        type="number"
                        value={ingrediente.quantidade}
                        onChange={(e) => updateIngrediente(index, 'quantidade', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Medida"
                        value={ingrediente.medidaCaseira}
                        onChange={(e) => updateIngrediente(index, 'medidaCaseira', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngrediente(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Steps Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Modo de Preparo</CardTitle>
                <Button type="button" onClick={addPasso} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Passo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {passos.map((passo, index) => (
                  <div key={index} className="space-y-2 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Passo {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePasso(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Descreva o passo..."
                      value={passo.passo}
                      onChange={(e) => updatePasso(index, 'passo', e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => updatePasso(index, 'foto', url));
                          }
                        }}
                      />
                    </div>
                    {passo.foto && (
                      <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                        <img src={passo.foto} alt={`Passo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="bg-gradient-primary">
              Atualizar Receita
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/">Cancelar</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
