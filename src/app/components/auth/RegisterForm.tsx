'use client';

import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';


export function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form className="space-y-4">
      <Input
        label="Nome"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome completo"
      />
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
        placeholder="Crie uma senha"
      />
      <Button type="submit" variant="primary">
        Cadastrar
      </Button>

      <p className="text-sm text-center">
        Já tem conta?{' '}
        <button type="button" onClick={onSwitch} className="text-green-600 underline cursor-pointer">
          Fazer login
        </button>
      </p>
    </form>
  );
}
