import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FichaTecnica, Cliente, Ingrediente, Passo } from '@/types';
import { fichaStorage, clienteStorage, ingredienteStorage, passoStorage } from '@/lib/storage';
import { generateRecipePDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Clock, Users, Weight, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VisualizarReceita() {
  const { id } = useParams<{ id: string }>();
  const [ficha, setFicha] = useState<FichaTecnica | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = (fichaId: string) => {
    const fichaData = fichaStorage.getById(fichaId);
    if (fichaData) {
      setFicha(fichaData);
      const clienteData = clienteStorage.getById(fichaData.clienteId);
      setCliente(clienteData);
      setIngredientes(ingredienteStorage.getByFichaId(fichaId));
      setPassos(passoStorage.getByFichaId(fichaId));
    }
  };

  const handleGeneratePDF = async () => {
    if (!ficha || !cliente) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateRecipePDF({
        ficha,
        cliente,
        ingredientes,
        passos
      });
      toast({
        title: "PDF gerado",
        description: "O PDF da receita foi gerado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!ficha) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Receita não encontrada</h2>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{ficha.nomeReceita}</h1>
            <p className="text-muted-foreground">{cliente?.nomeCliente}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/editar-receita/${ficha.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "PDF"}
          </Button>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Receita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Tipo de Ficha</p>
                <Badge variant="secondary">{ficha.tipoFicha}</Badge>
              </div>
              <div>
                <p className="font-medium">Empresa</p>
                <p className="text-muted-foreground">{ficha.empresa}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Tempo</p>
                  <p className="text-sm text-muted-foreground">{ficha.tempoPreparo} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Rendimento</p>
                  <p className="text-sm text-muted-foreground">{ficha.rendimento} porções</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Peso/Porção</p>
                  <p className="text-sm text-muted-foreground">{ficha.pesoPorcao}g</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium">Utensílios Necessários</p>
              <p className="text-muted-foreground">{ficha.utensilhosNecessarios}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Realizado por</p>
                <p className="text-muted-foreground">{ficha.realizadoPor}</p>
              </div>
              <div>
                <p className="font-medium">Aprovado por</p>
                <p className="text-muted-foreground">{ficha.aprovadoPor}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Foto do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {ficha.fotoProduto ? (
                <img
                  src={ficha.fotoProduto}
                  alt={ficha.nomeReceita}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredientes.length > 0 ? (
            <div className="space-y-2">
              {ingredientes.map((ingrediente) => (
                <div key={ingrediente.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{ingrediente.ingrediente}</span>
                  <div className="text-sm text-muted-foreground">
                    {ingrediente.quantidade} {ingrediente.medidaCaseira}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum ingrediente cadastrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Modo de Preparo</CardTitle>
        </CardHeader>
        <CardContent>
          {passos.length > 0 ? (
            <div className="space-y-6">
              {passos.map((passo, index) => (
                <div key={passo.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p>{passo.passo}</p>
                    {passo.foto && (
                      <div className="w-full max-w-md">
                        <img
                          src={passo.foto}
                          alt={`Passo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum passo cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}