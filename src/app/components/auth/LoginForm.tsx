'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Digite seu email"
      />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Digite sua senha"
      />
      <Button type="submit">Entrar</Button>

      <p className="text-sm text-center">
        Não tem conta?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 underline cursor-pointer">
          Cadastre-se
        </button>
      </p>
    </form>
  );
}
