import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewLeadModal({ isOpen, onClose, onSuccess }: NewLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (isOpen) {
      api.get('/products').then(res => setProducts(res.data.filter((p: any) => p.active))).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    setPhone(v);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v === '') {
      setEstimatedValue('');
      return;
    }
    const num = Number(v) / 100;
    if (num > 999999999999.99) return; // Limite de trilhões
    setEstimatedValue(
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rawValue = estimatedValue.replace(/[^\d.]/g, '');
      await api.post('/leads', {
        name,
        email,
        phone,
        description,
        status: 'NEW',
        estimatedValue: rawValue ? Number(rawValue) : 0,
        productId: productId || undefined
      });
      onSuccess();
      onClose();
      setName('');
      setEmail('');
      setPhone('');
      setDescription('');
      setEstimatedValue('');
      setProductId('');
    } catch (err) {
      alert('Erro ao criar lead. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase text-zinc-950 dark:text-zinc-100">{t('pipeline.new_lead')}</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-zinc-600 dark:text-zinc-400 transition-colors hover:text-red-400"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">Nome da Empresa / Contato</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="Ex: Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="contato@acme.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">Telefone</label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">Valor Estimado (US$)</label>
            <input
              type="text"
              value={estimatedValue}
              onChange={handleCurrencyChange}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="US$ 5,000.00"
            />
            <span className="text-xs text-zinc-500">Limite máximo de trilhões.</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">Descrição / Notas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400 min-h-[80px]"
              placeholder="Detalhes da venda, produtos específicos, histórico breve..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-400">Produto / Serviço</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border-2 border-zinc-700 bg-zinc-100 dark:bg-zinc-950 p-2 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
            >
              <option value="">(Nenhum Produto Selecionado)</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 border-4 border-lime-400 bg-lime-400 p-3 text-lg font-black uppercase text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-lime-300 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]"
          >
            {loading ? 'Salvando...' : 'Salvar Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}
