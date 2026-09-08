import { useRouter } from 'expo-router';
import { useSubscription } from './useSubscription';

/** Gate premium : si non premium, redirige vers le paywall avec un message. */
export function usePremium() {
  const { premium } = useSubscription();
  const router = useRouter();
  return {
    premium,
    goPremium: (message?: string) => {
      router.push({ pathname: '/paywall', params: message ? { message } : {} });
    },
  };
}
