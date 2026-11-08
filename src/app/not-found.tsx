import type { Metadata } from 'next';
import { NotFound } from '@/src/components/NotFound';

export const metadata: Metadata = {
  title: 'পেজটি পাওয়া যায়নি | পানি ওয়ালা',
};

export default function NotFoundPage() {
  return <NotFound />;
}
