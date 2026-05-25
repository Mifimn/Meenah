// hooks/useOfflineData.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useOfflineData<T>(cacheKey: string, fetchFromSupabase: () => Promise<T | null>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function syncData() {
      // 1. INSTANT LOAD: Grab the data from the phone's physical memory first
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          setData(JSON.parse(cached));
          setLoading(false);
        }
      } catch (e) { console.log('Cache read error'); }

      // 2. BACKGROUND SYNC: Quietly reach out to Supabase for fresh data
      const freshData = await fetchFromSupabase();
      
      // 3. SAVE & RENDER: Update screen and overwrite cache
      if (freshData && isMounted) {
        setData(freshData);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(freshData));
      }
      if (isMounted) setLoading(false);
    }

    syncData();
    return () => { isMounted = false; };
  }, [cacheKey]);

  return { data, loading };
}
