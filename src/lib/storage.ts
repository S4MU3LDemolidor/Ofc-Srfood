import { v4 as uuidv4 } from 'uuid';
import { FichaTecnica, Cliente, Ingrediente, Passo } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  FICHAS: 'fichas_tecnicas',
  CLIENTES: 'clientes',
  INGREDIENTES: 'ingredientes',
  PASSOS: 'passos'
} as const;

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// File to base64 conversion
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// FichaTecnica CRUD
export const fichaStorage = {
  getAll: (): FichaTecnica[] => getFromStorage<FichaTecnica>(STORAGE_KEYS.FICHAS),
  
  getById: (id: string): FichaTecnica | undefined => {
    const fichas = getFromStorage<FichaTecnica>(STORAGE_KEYS.FICHAS);
    return fichas.find(ficha => ficha.id === id);
  },
  
  create: (ficha: Omit<FichaTecnica, 'id' | 'createdAt' | 'updatedAt'>): FichaTecnica => {
    const fichas = getFromStorage<FichaTecnica>(STORAGE_KEYS.FICHAS);
    const newFicha: FichaTecnica = {
      ...ficha,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fichas.push(newFicha);
    saveToStorage(STORAGE_KEYS.FICHAS, fichas);
    return newFicha;
  },
  
  update: (id: string, updates: Partial<FichaTecnica>): FichaTecnica | null => {
    const fichas = getFromStorage<FichaTecnica>(STORAGE_KEYS.FICHAS);
    const index = fichas.findIndex(ficha => ficha.id === id);
    if (index === -1) return null;
    
    fichas[index] = {
      ...fichas[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.FICHAS, fichas);
    return fichas[index];
  },
  
  delete: (id: string): boolean => {
    const fichas = getFromStorage<FichaTecnica>(STORAGE_KEYS.FICHAS);
    const filteredFichas = fichas.filter(ficha => ficha.id !== id);
    if (filteredFichas.length === fichas.length) return false;
    
    saveToStorage(STORAGE_KEYS.FICHAS, filteredFichas);
    
    // Also delete related ingredientes and passos
    ingredienteStorage.deleteByFichaId(id);
    passoStorage.deleteByFichaId(id);
    
    return true;
  }
};

// Cliente CRUD
export const clienteStorage = {
  getAll: (): Cliente[] => getFromStorage<Cliente>(STORAGE_KEYS.CLIENTES),
  
  getById: (id: string): Cliente | undefined => {
    const clientes = getFromStorage<Cliente>(STORAGE_KEYS.CLIENTES);
    return clientes.find(cliente => cliente.id === id);
  },
  
  create: (cliente: Omit<Cliente, 'id'>): Cliente => {
    const clientes = getFromStorage<Cliente>(STORAGE_KEYS.CLIENTES);
    const newCliente: Cliente = {
      ...cliente,
      id: uuidv4()
    };
    clientes.push(newCliente);
    saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
    return newCliente;
  },
  
  update: (id: string, updates: Partial<Cliente>): Cliente | null => {
    const clientes = getFromStorage<Cliente>(STORAGE_KEYS.CLIENTES);
    const index = clientes.findIndex(cliente => cliente.id === id);
    if (index === -1) return null;
    
    clientes[index] = { ...clientes[index], ...updates };
    saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
    return clientes[index];
  },
  
  delete: (id: string): boolean => {
    const clientes = getFromStorage<Cliente>(STORAGE_KEYS.CLIENTES);
    const filteredClientes = clientes.filter(cliente => cliente.id !== id);
    if (filteredClientes.length === clientes.length) return false;
    
    saveToStorage(STORAGE_KEYS.CLIENTES, filteredClientes);
    return true;
  }
};

// Ingrediente CRUD
export const ingredienteStorage = {
  getAll: (): Ingrediente[] => getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES),
  
  getByFichaId: (fichaId: string): Ingrediente[] => {
    const ingredientes = getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES);
    return ingredientes.filter(ingrediente => ingrediente.fichaId === fichaId);
  },
  
  create: (ingrediente: Omit<Ingrediente, 'id'>): Ingrediente => {
    const ingredientes = getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES);
    const newIngrediente: Ingrediente = {
      ...ingrediente,
      id: uuidv4()
    };
    ingredientes.push(newIngrediente);
    saveToStorage(STORAGE_KEYS.INGREDIENTES, ingredientes);
    return newIngrediente;
  },
  
  update: (id: string, updates: Partial<Ingrediente>): Ingrediente | null => {
    const ingredientes = getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES);
    const index = ingredientes.findIndex(ingrediente => ingrediente.id === id);
    if (index === -1) return null;
    
    ingredientes[index] = { ...ingredientes[index], ...updates };
    saveToStorage(STORAGE_KEYS.INGREDIENTES, ingredientes);
    return ingredientes[index];
  },
  
  delete: (id: string): boolean => {
    const ingredientes = getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES);
    const filteredIngredientes = ingredientes.filter(ingrediente => ingrediente.id !== id);
    if (filteredIngredientes.length === ingredientes.length) return false;
    
    saveToStorage(STORAGE_KEYS.INGREDIENTES, filteredIngredientes);
    return true;
  },
  
  deleteByFichaId: (fichaId: string): void => {
    const ingredientes = getFromStorage<Ingrediente>(STORAGE_KEYS.INGREDIENTES);
    const filteredIngredientes = ingredientes.filter(ingrediente => ingrediente.fichaId !== fichaId);
    saveToStorage(STORAGE_KEYS.INGREDIENTES, filteredIngredientes);
  }
};

// Passo CRUD
export const passoStorage = {
  getAll: (): Passo[] => getFromStorage<Passo>(STORAGE_KEYS.PASSOS),
  
  getByFichaId: (fichaId: string): Passo[] => {
    const passos = getFromStorage<Passo>(STORAGE_KEYS.PASSOS);
    return passos.filter(passo => passo.fichaId === fichaId);
  },
  
  create: (passo: Omit<Passo, 'id'>): Passo => {
    const passos = getFromStorage<Passo>(STORAGE_KEYS.PASSOS);
    const newPasso: Passo = {
      ...passo,
      id: uuidv4()
    };
    passos.push(newPasso);
    saveToStorage(STORAGE_KEYS.PASSOS, passos);
    return newPasso;
  },
  
  update: (id: string, updates: Partial<Passo>): Passo | null => {
    const passos = getFromStorage<Passo>(STORAGE_KEYS.PASSOS);
    const index = passos.findIndex(passo => passo.id === id);
    if (index === -1) return null;
    
    passos[index] = { ...passos[index], ...updates };
    saveToStorage(STORAGE_KEYS.PASSOS, passos);
    return passos[index];
  },
  
  delete: (id: string): boolean => {
    const passos = getFromStorage<Passo>(STORAGE_KEYS.PASSOS);
    const filteredPassos = passos.filter(passo => passo.id !== id);
    if (filteredPassos.length === passos.length) return false;
    
    saveToStorage(STORAGE_KEYS.PASSOS, filteredPassos);
    return true;
  },
  
  deleteByFichaId: (fichaId: string): void => {
    const passos = getFromStorage<Passo>(STORAGE_KEYS.PASSOS);
    const filteredPassos = passos.filter(passo => passo.fichaId !== fichaId);
    saveToStorage(STORAGE_KEYS.PASSOS, filteredPassos);
  }
};