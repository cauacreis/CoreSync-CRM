import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        active: true
      });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '' });
      fetchProducts();
    } catch (err) {
      alert('Erro ao salvar produto');
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        active: !product.active
      });
      fetchProducts();
    } catch (err) {
      alert('Erro ao alterar status do produto');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center text-2xl font-bold">CARREGANDO...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Catálogo de Produtos</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Novo Produto
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className={`flex flex-col border-4 transition-all duration-300 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] ${p.active ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-60 grayscale'}`}>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white">{p.name}</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{p.description || 'Sem descrição'}</p>
            <p className={`mt-4 text-3xl font-black ${p.active ? 'text-lime-400' : 'text-zinc-500'}`}>{formatCurrency(p.price)}</p>
            <div className="mt-auto border-t-4 border-zinc-950 dark:border-zinc-800 pt-4 flex justify-between items-center mt-6">
              <span className={`font-bold uppercase ${p.active ? 'text-lime-400' : 'text-zinc-600'}`}>
                {p.active ? 'Ativo' : 'Inativo'}
              </span>
              <button 
                onClick={() => toggleProductStatus(p)}
                className={`border-4 px-4 py-2 font-black uppercase transition-transform active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${p.active ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'border-zinc-950 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-700 hover:text-zinc-950 dark:text-white'}`}
              >
                {p.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-8 shadow-[12px_12px_0px_0px_rgba(163,230,53,1)]">
            <h2 className="mb-6 text-3xl font-black uppercase text-zinc-950 dark:text-white">Cadastrar Produto</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block font-bold uppercase text-zinc-600 dark:text-zinc-400">Nome</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-4 py-2 font-bold text-zinc-950 dark:text-white outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="mb-2 block font-bold uppercase text-zinc-600 dark:text-zinc-400">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-4 py-2 font-bold text-zinc-950 dark:text-white outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="mb-2 block font-bold uppercase text-zinc-600 dark:text-zinc-400">Preço (USD)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-4 py-2 font-bold text-zinc-950 dark:text-white outline-none focus:border-lime-400"
                />
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-500 py-3 font-bold text-zinc-950 dark:text-white transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-400"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 py-3 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300"
                >
                  SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
