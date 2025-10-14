'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Alert from './Alert';

export function SessionWatcher() {
    const router = useRouter();
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const { data: session, status } = useSession({
        required: false,
  onUnauthenticated: () => {
    setAlert({ type: "error", message: "Sessão expirada. Faça login novamente." });
            setTimeout(() => {
                router.push('/login')
            }, 3500)
  },

    });
    
    
    useEffect(() => { }, [status, router]);

    if (!alert) return null;

    return (
        <Alert
            alert={alert}
            onClose={() => setAlert(null)}
        />
    )
}