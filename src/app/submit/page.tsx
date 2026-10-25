import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SubmitRedirectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('dealflow_token');
  if (token) {
    redirect('/dashboard');
  }
  redirect('/login');
}
