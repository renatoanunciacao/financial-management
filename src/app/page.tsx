// src/app/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';


export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
