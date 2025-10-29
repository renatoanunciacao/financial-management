"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@app/components/atoms/Input";
import { Button } from "@app/components/atoms/Button";
import { LoadingBubbles } from "@app/components/ui/LoadingBubles";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassord] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("E-mail e/ou senha incorretos.");
      }
    } catch {
      setError("Erro ao tentar logar.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setAlert({ type: "success", message: "Cadastro realizado com sucesso!" });
        form.reset();
        setView('login');
      } else {
        setAlert({ type: "error", message: "Erro no cadastro. Tente novamente." });
      }
    } catch {
      setAlert({ type: "error", message: "Erro inesperado. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlert({ type: "error", message: "Digite seu e-mail." });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setAlert({ type: "success", message: "Verifique seu e-mail para redefinir a senha!" });
      } else {
        setAlert({ type: "error", message: "Erro ao enviar e-mail. Tente novamente." });
      }
    } catch {
      setAlert({ type: "error", message: "Erro inesperado. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <LoadingBubbles />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="relative w-[350px] h-[460px] perspective">
        {/* Flip container só para login e register */}
        <div
          className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]
          ${view === 'register' ? "[transform:rotateY(180deg)]" : ""}
          `}
        >
          {/* Login (frente) */}
          <div className={`absolute inset-0 bg-white rounded-xl shadow-xl p-8 [backface-visibility:hidden] ${view === 'login' ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input type="password" placeholder="Senha" value={password} onChange={e => setPassord(e.target.value)} />
              <div className="flex justify-center">
                <Button type="submit" disabled={!email || !password} className="w-48 justify-center">
                  Entrar
                </Button>
              </div>
            </form>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="danger"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-48 flex gap-2 items-center justify-center"
              >
                <GoogleIcon />
                Google
              </Button>
            </div>
            <p className="mt-4 text-center text-sm">
              <button onClick={() => setView('forgot')} className="text-blue-600 underline cursor-pointer">Esqueci minha senha</button>
            </p>
            <p className="mt-2 text-center text-sm">
              Não tem conta? <button onClick={() => setView('register')} className="text-blue-600 underline cursor-pointer">Cadastre-se</button>
            </p>
            {error && <p className="text-red-500">{error}</p>}
          </div>

          {/* Cadastro (verso) */}
          <div className={`absolute inset-0 bg-white rounded-xl shadow-xl p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] ${view === 'register' ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-center text-green-800 mb-4">Cadastro</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input type="text" name="name" placeholder="Nome" />
              <Input type="email" name="email" placeholder="Email" />
              <Input type="password" name="password" placeholder="Senha" />
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm">
              Já tem conta? <button onClick={() => setView('login')} className="text-green-600 underline cursor-pointer">Fazer login</button>
            </p>
          </div>
        </div>

        {/* Forgot - tela independente, sem flip */}
        {view === 'forgot' && (
          <div className="absolute inset-0 bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center text-yellow-800 mb-4">Recuperar senha</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input type="email" placeholder="Digite seu e-mail" value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" variant="primary" disabled={!email || isLoading}>
                {isLoading ? "Enviando..." : "Enviar e-mail"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm">
              Lembrou? <button onClick={() => setView('login')} className="text-yellow-600 underline">Voltar ao login</button>
            </p>
            {alert && (
              <p className={`mt-2 text-${alert.type === 'success' ? 'green' : 'red'}-500`}>
                {alert.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.5 32.4 29.1 36 24 36c-6.6
        0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1
        7.8 2.9l5.9-5.9C34.4 6.3 29.5 4 24 4
        12.9 4 4 12.9 4 24s8.9 20 20
        20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16
        18.9 13 24 13c3 0 5.7 1.1
        7.8 2.9l5.9-5.9C34.4 6.3
        29.5 4 24 4c-7.5 0-13.9
        3.4-18.1 8.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.9-1.9
        13.5-5l-6.3-5.2C28.9 35.5
        26.5 36 24 36c-5 0-9.4-3.6-10.8-8.5l-6.6
        5C10.2 40.4 16.5 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.2
        3.1-4.1 5.7-7.3 6.8l6.3
        5.2C37.9 37.9 42 31.5 42 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}
