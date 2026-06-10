import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('@CoreSync:token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Falha no login. Verifique as credenciais.');
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-md border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-100">
          CoreSync CRM
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-zinc-600 dark:text-zinc-400">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-4 border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="admin@alpha.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-zinc-600 dark:text-zinc-400">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-4 border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-zinc-950 dark:text-zinc-100 outline-none transition-colors focus:border-lime-400"
              placeholder="***"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 border-4 border-lime-400 bg-lime-400 p-4 text-xl font-black uppercase text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-lime-300 shadow-[6px_6px_0px_0px_rgba(163,230,53,1)]"
          >
            Entrar no Portal
          </button>
        </form>
      </div>
    </div>
  );
}
