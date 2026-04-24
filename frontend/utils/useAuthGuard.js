import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from './auth';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace('/');
    }
  }, [router]);
}