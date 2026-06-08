import { useEffect, useState } from 'react';
import { apiFetchLoose, apiOk, asApiEnvelope } from '@/api';
import { isUuid } from '@/utils/validation';

// In-memory cache to prevent duplicate fetches for the same user ID
const userCache = new Map<string, string>();

/**
 * Custom hook to fetch the full name of a user by their ID.
 * Returns the cached name immediately if available, otherwise fetches it asynchronously.
 */
export function useUserFullName(userId: string | undefined): string | null {
  const [fullName, setFullName] = useState<string | null>(() => {
    if (!userId) return null;
    return userCache.get(userId) || null;
  });

  useEffect(() => {
    if (!userId || !isUuid(userId)) {
      setFullName(null);
      return;
    }

    const cached = userCache.get(userId);
    if (cached) {
      setFullName(cached);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await apiOk<any>(
          asApiEnvelope<any>(
            apiFetchLoose.GET('/api/User/GetById', { params: { query: { id: userId } } })
          )
        );
        const data = res?.data ?? res?.Data ?? res;
        const name = data?.fullName ?? data?.FullName ?? data?.displayName ?? data?.DisplayName ?? data?.username ?? data?.username;
        if (name && typeof name === 'string' && name.trim()) {
          const trimmed = name.trim();
          userCache.set(userId, trimmed);
          if (!cancelled) setFullName(trimmed);
        }
      } catch (err) {
        console.warn('Failed to fetch user fullName by id:', userId, err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return fullName;
}

/**
 * Component that displays the user's fullName resolved asynchronously by their ID.
 * Falls back to a provided string (like username) or "Khách".
 */
export function ContributorName({
  userId,
  fallback,
}: {
  userId?: string;
  fallback?: string;
}) {
  const fullName = useUserFullName(userId);
  return <span>{fullName || fallback || 'Khách'}</span>;
}
