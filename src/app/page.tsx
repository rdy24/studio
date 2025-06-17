
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  // This line will not be reached, as redirect() will throw an error to interrupt rendering.
  // To make Next.js happy with a return type for a Server Component,
  // you can return null or an empty fragment if redirect wasn't guaranteed to throw.
  // However, since redirect() throws, this is fine.
}
