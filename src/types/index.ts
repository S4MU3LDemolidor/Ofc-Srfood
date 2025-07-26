export interface Cliente {
  id: string;
  nomeCliente: string;
  email: string;
  telefone: string;
  logo?: string; // base64 image string
}

export interface Ingrediente {
  id: string;
  fichaId: string;
  ingrediente: string;
  quantidade: number;
  medidaCaseira: string;
}

export interface Passo {
  id: string;
  fichaId: string;
  passo: string;
  foto?: string; // base64 image string
}

export interface FichaTecnica {
  id: string;
  tipoFicha: string;
  nomeReceita: string;
  pesoPreparacao: number;
  pesoPorcao: number;
  utensilhosNecessarios: string[];
  aprovadoPor: string;
  tempoPreparo: number; // minutes
  rendimento: number;
  realizadoPor: string;
  empresa: string;
  fotoProduto?: string; // base64 image string
  clienteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormData {
  tipoFicha: string;
  nomeReceita: string;
  pesoPreparacao: string;
  pesoPorcao: string;
  utensilhosNecessarios: string;
  aprovadoPor: string;
  tempoPreparo: string;
  rendimento: string;
  realizadoPor: string;
  empresa: string;
  clienteId: string;
  fotoProduto?: File;
}

export interface ClienteFormData {
  nomeCliente: string;
  email: string;
  telefone: string;
  logo?: File;
}