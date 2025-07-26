import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { RecipeFormData, Cliente, Ingrediente, Passo } from '@/types';
import { fichaStorage, clienteStorage, ingredienteStorage, passoStorage, fileToBase64 } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IngredienteForm {
  ingrediente: string;
  quantidade: string;
  medidaCaseira: string;
}

interface PassoForm {
  passo: string;
  foto?: File;
}

export default function NovaReceita() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([
    { ingrediente: '', quantidade: '', medidaCaseira: '' }
  ]);
  const [passos, setPassos] = useState<PassoForm[]>([
    { passo: '' }
  ]);
  const [fotoProdutoPreview, setFotoProdutoPreview] = useState<string>('');
  const [passoPhotoPreviews, setPassoPhotoPreviews] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<RecipeFormData>({
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
    }
  });

  useEffect(() => {
    const allClientes = clienteStorage.getAll();
    setClientes(allClientes);
  }, []);

  const handleFotoProdutoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFotoProdutoPreview(base64);
        form.setValue('fotoProduto', file);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao processar a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePassoPhotoChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPassoPhotoPreviews(prev => ({ ...prev, [index]: base64 }));
        
        const newPassos = [...passos];
        newPassos[index] = { ...newPassos[index], foto: file };
        setPassos(newPassos);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao processar a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  const addIngrediente = () => {
    setIngredientes([...ingredientes, { ingrediente: '', quantidade: '', medidaCaseira: '' }]);
  };

  const removeIngrediente = (index: number) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter((_, i) => i !== index));
    }
  };

  const updateIngrediente = (index: number, field: keyof IngredienteForm, value: string) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = { ...newIngredientes[index], [field]: value };
    setIngredientes(newIngredientes);
  };

  const addPasso = () => {
    setPassos([...passos, { passo: '' }]);
  };

  const removePasso = (index: number) => {
    if (passos.length > 1) {
      setPassos(passos.filter((_, i) => i !== index));
      setPassoPhotoPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
    }
  };

  const updatePasso = (index: number, value: string) => {
    const newPassos = [...passos];
    newPassos[index] = { ...newPassos[index], passo: value };
    setPassos(newPassos);
  };

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!data.clienteId) {
        toast({
          title: "Erro",
          description: "Selecione um cliente.",
          variant: "destructive",
        });
        return;
      }

      if (ingredientes.some(ing => !ing.ingrediente || !ing.quantidade || !ing.medidaCaseira)) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos dos ingredientes.",
          variant: "destructive",
        });
        return;
      }

      if (passos.some(passo => !passo.passo)) {
        toast({
          title: "Erro",
          description: "Preencha todos os passos.",
          variant: "destructive",
        });
        return;
      }

      // Process product photo
      let fotoProdutoBase64 = '';
      if (data.fotoProduto) {
        fotoProdutoBase64 = await fileToBase64(data.fotoProduto);
      }

      // Create ficha técnica
      const novaFicha = fichaStorage.create({
        tipoFicha: data.tipoFicha,
        nomeReceita: data.nomeReceita,
        pesoPreparacao: parseFloat(data.pesoPreparacao),
        pesoPorcao: parseFloat(data.pesoPorcao),
        utensilhosNecessarios: data.utensilhosNecessarios.split(',').map(u => u.trim()).filter(u => u),
        aprovadoPor: data.aprovadoPor,
        tempoPreparo: parseInt(data.tempoPreparo),
        rendimento: parseInt(data.rendimento),
        realizadoPor: data.realizadoPor,
        empresa: data.empresa,
        clienteId: data.clienteId,
        fotoProduto: fotoProdutoBase64,
      });

      // Create ingredientes
      for (const ing of ingredientes) {
        ingredienteStorage.create({
          fichaId: novaFicha.id,
          ingrediente: ing.ingrediente,
          quantidade: parseFloat(ing.quantidade),
          medidaCaseira: ing.medidaCaseira,
        });
      }

      // Create passos
      for (let i = 0; i < passos.length; i++) {
        const passo = passos[i];
        let fotoBase64 = '';
        if (passo.foto) {
          fotoBase64 = await fileToBase64(passo.foto);
        }
        
        passoStorage.create({
          fichaId: novaFicha.id,
          passo: passo.passo,
          foto: fotoBase64,
        });
      }

      toast({
        title: "Receita criada",
        description: "A ficha técnica foi criada com sucesso.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar a receita.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Receita</h1>
        <p className="text-muted-foreground">
          Crie uma nova ficha técnica de receita
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoFicha">Tipo de Ficha</Label>
              <Select onValueChange={(value) => form.setValue('tipoFicha', value)}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione o tipo de ficha" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="Subficha">Subficha</SelectItem>
                  <SelectItem value="Prato principal">Prato principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeReceita">Nome da Receita</Label>
              <Input
                id="nomeReceita"
                {...form.register('nomeReceita', { required: true })}
                placeholder="Digite o nome da receita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesoPreparacao">Peso da Preparação (g)</Label>
              <Input
                id="pesoPreparacao"
                type="number"
                {...form.register('pesoPreparacao', { required: true })}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesoPorcao">Peso por Porção (g)</Label>
              <Input
                id="pesoPorcao"
                type="number"
                {...form.register('pesoPorcao', { required: true })}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempoPreparo">Tempo de Preparo (min)</Label>
              <Input
                id="tempoPreparo"
                type="number"
                {...form.register('tempoPreparo', { required: true })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rendimento">Rendimento (porções)</Label>
              <Input
                id="rendimento"
                type="number"
                {...form.register('rendimento', { required: true })}
                placeholder="6"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="utensilhosNecessarios">Utensílios Necessários</Label>
              <Input
                id="utensilhosNecessarios"
                {...form.register('utensilhosNecessarios', { required: true })}
                placeholder="Separe por vírgulas: Panela, Colher de pau, Forma"
              />
            </div>
          </CardContent>
        </Card>

        {/* Responsibility Information */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Informações de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                {...form.register('empresa', { required: true })}
                placeholder="Nome da empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="realizadoPor">Realizado por</Label>
              <Input
                id="realizadoPor"
                {...form.register('realizadoPor', { required: true })}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprovadoPor">Aprovado por</Label>
              <Input
                id="aprovadoPor"
                {...form.register('aprovadoPor', { required: true })}
                placeholder="Nome do aprovador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente</Label>
              <Select onValueChange={(value) => form.setValue('clienteId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nomeCliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product Photo */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Foto do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoProdutoChange}
                  className="flex-1"
                />
                {fotoProdutoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFotoProdutoPreview('');
                      form.setValue('fotoProduto', undefined);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {fotoProdutoPreview && (
                <img
                  src={fotoProdutoPreview}
                  alt="Preview do produto"
                  className="h-32 w-32 object-cover rounded border"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredientes</CardTitle>
            <Button type="button" onClick={addIngrediente} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {ingredientes.map((ingrediente, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="space-y-2">
                  <Label>Ingrediente</Label>
                  <Input
                    value={ingrediente.ingrediente}
                    onChange={(e) => updateIngrediente(index, 'ingrediente', e.target.value)}
                    placeholder="Nome do ingrediente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={ingrediente.quantidade}
                    onChange={(e) => updateIngrediente(index, 'quantidade', e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medida Caseira</Label>
                  <Input
                    value={ingrediente.medidaCaseira}
                    onChange={(e) => updateIngrediente(index, 'medidaCaseira', e.target.value)}
                    placeholder="2 xícaras"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngrediente(index)}
                  disabled={ingredientes.length === 1}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Modo de Preparo</CardTitle>
            <Button type="button" onClick={addPasso} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Passo
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {passos.map((passo, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Passo {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePasso(index)}
                    disabled={passos.length === 1}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição do Passo</Label>
                  <Textarea
                    value={passo.passo}
                    onChange={(e) => updatePasso(index, e.target.value)}
                    placeholder="Descreva detalhadamente este passo..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Foto do Passo (opcional)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePassoPhotoChange(index, e)}
                        className="flex-1"
                      />
                      {passoPhotoPreviews[index] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPassoPhotoPreviews(prev => {
                              const newPreviews = { ...prev };
                              delete newPreviews[index];
                              return newPreviews;
                            });
                            const newPassos = [...passos];
                            delete newPassos[index].foto;
                            setPassos(newPassos);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {passoPhotoPreviews[index] && (
                      <img
                        src={passoPhotoPreviews[index]}
                        alt={`Preview do passo ${index + 1}`}
                        className="h-24 w-24 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1 min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-primary min-h-[44px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Receita'}
          </Button>
        </div>
      </form>
    </div>
  );
}