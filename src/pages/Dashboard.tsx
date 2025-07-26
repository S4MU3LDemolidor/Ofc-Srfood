import { useState, useEffect } from 'react';
import { FichaTecnica, Cliente, Ingrediente, Passo } from '@/types';
import { fichaStorage, clienteStorage, ingredienteStorage, passoStorage } from '@/lib/storage';
import { generateRecipePDF } from '@/lib/pdf-generator';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, FileText, Users, Tag, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredFichas, setFilteredFichas] = useState<FichaTecnica[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<string>('all');
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFichas();
  }, [fichas, searchTerm, selectedCliente, selectedTipo]);

  const loadData = () => {
    const allFichas = fichaStorage.getAll();
    const allClientes = clienteStorage.getAll();
    setFichas(allFichas);
    setClientes(allClientes);
  };

  const filterFichas = () => {
    let filtered = [...fichas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ficha =>
        ficha.nomeReceita.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ficha.realizadoPor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ficha.empresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Cliente filter
    if (selectedCliente !== 'all') {
      filtered = filtered.filter(ficha => ficha.clienteId === selectedCliente);
    }

    // Tipo filter
    if (selectedTipo !== 'all') {
      filtered = filtered.filter(ficha => ficha.tipoFicha === selectedTipo);
    }

    setFilteredFichas(filtered);
  };

  const handleDeleteRecipe = (id: string) => {
    fichaStorage.delete(id);
    loadData();
  };

  const handleGeneratePDF = async (fichaId: string) => {
    try {
      const ficha = fichaStorage.getById(fichaId);
      if (!ficha) throw new Error('Receita não encontrada');

      const cliente = clienteStorage.getById(ficha.clienteId);
      if (!cliente) throw new Error('Cliente não encontrado');

      const ingredientes = ingredienteStorage.getByFichaId(fichaId);
      const passos = passoStorage.getByFichaId(fichaId);

      await generateRecipePDF({
        ficha,
        cliente,
        ingredientes,
        passos
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const getClienteForFicha = (fichaId: string): Cliente => {
    const ficha = fichas.find(f => f.id === fichaId);
    return clientes.find(c => c.id === ficha?.clienteId) || {
      id: '',
      nomeCliente: 'Cliente não encontrado',
      email: '',
      telefone: ''
    };
  };

  const uniqueTipos = [...new Set(fichas.map(f => f.tipoFicha))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Gerencie suas fichas técnicas de receitas com facilidade
            </p>
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <Link to="/nova-receita">
              <Plus className="h-5 w-5 mr-2" />
              Nova Receita
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50 space-y-5">
        <div className="flex items-center gap-3 text-lg font-semibold text-primary">
          <Filter className="h-5 w-5" />
          Filtros de Busca
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por nome, empresa ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-border/60 focus:border-primary transition-colors"
            />
          </div>

          <Select value={selectedCliente} onValueChange={setSelectedCliente}>
            <SelectTrigger className="h-11 border-border/60 focus:border-primary">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nomeCliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger className="h-11 border-border/60 focus:border-primary">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {uniqueTipos.map(tipo => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{fichas.length}</div>
              <div className="text-sm text-gray-600">Total de Receitas</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{clientes.length}</div>
              <div className="text-sm text-gray-600">Clientes Ativos</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{uniqueTipos.length}</div>
              <div className="text-sm text-gray-600">Tipos de Ficha</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredFichas.length}</div>
              <div className="text-sm text-gray-600">Receitas Filtradas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Cards */}
      {filteredFichas.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-12 max-w-md mx-auto border border-primary/20">
            <div className="text-8xl mb-6">🍳</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Nenhuma receita encontrada</h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              {fichas.length === 0 
                ? "Comece sua jornada culinária criando sua primeira ficha técnica de receita."
                : "Tente ajustar os filtros de busca ou criar uma nova receita para expandir seu catálogo."
              }
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
              <Link to="/nova-receita">
                <Plus className="h-5 w-5 mr-2" />
                Criar Nova Receita
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {filteredFichas.length === fichas.length ? 'Todas as Receitas' : 'Resultados da Busca'}
            </h2>
            <div className="text-sm text-muted-foreground bg-primary/5 px-3 py-1 rounded-full">
              {filteredFichas.length} de {fichas.length} receitas
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFichas.map(ficha => (
              <RecipeCard
                key={ficha.id}
                ficha={ficha}
                cliente={getClienteForFicha(ficha.id)}
                onDelete={handleDeleteRecipe}
                onGeneratePDF={handleGeneratePDF}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}