import { redirect } from 'next/navigation';

/** Sign-up is for customers and suppliers, which happens on the website. */
export default function Page() {
  redirect('/register');
}
