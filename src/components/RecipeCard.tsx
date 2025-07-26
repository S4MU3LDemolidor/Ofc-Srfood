import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FichaTecnica, Cliente } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Weight, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';

interface RecipeCardProps {
  ficha: FichaTecnica;
  cliente: Cliente;
  onDelete: (id: string) => void;
  onGeneratePDF: (id: string) => void;
}

export function RecipeCard({ ficha, cliente, onDelete, onGeneratePDF }: RecipeCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete(ficha.id);
      toast({
        title: "Receita excluída",
        description: "A receita foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir a receita.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await onGeneratePDF(ficha.id);
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

  return (
    <Card className="bg-white border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gray-50 rounded-t-lg overflow-hidden">
          {ficha.fotoProduto ? (
            <img
              src={ficha.fotoProduto}
              alt={ficha.nomeReceita}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-white border-0">
              {ficha.tipoFicha}
            </Badge>
          </div>
          {cliente.logo && (
            <div className="absolute top-3 left-3">
              <img
                src={cliente.logo}
                alt={cliente.nomeCliente}
                className="h-8 w-8 rounded bg-white/90 p-1"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{ficha.nomeReceita}</h3>
            <p className="text-sm text-gray-600">{cliente.nomeCliente}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-primary" />
              <span>{ficha.tempoPreparo}min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-primary" />
              <span>{ficha.rendimento}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Weight className="h-4 w-4 text-primary" />
              <span>{ficha.pesoPorcao}g</span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Por:</strong> {ficha.realizadoPor}
            </p>
            <p className="text-xs text-gray-500">
              <strong>Empresa:</strong> {ficha.empresa}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          <Link to={`/receita/${ficha.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          <Link to={`/editar-receita/${ficha.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>

        <Button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-gray-300 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir receita</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a receita "{ficha.nomeReceita}"? 
                Esta ação não pode ser desfeita e todos os ingredientes e passos 
                relacionados também serão excluídos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}