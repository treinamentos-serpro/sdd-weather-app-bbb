import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type LastOperation = { type: 'search'; name: string } | { type: 'selectCity'; city: City };

/**
 * Hook de orquestração: busca cidades, seleciona uma e carrega o clima.
 * Expõe uma máquina de estados simples (idle/loading/success/error/empty).
 */
export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const lastOperationRef = useRef<LastOperation | null>(null);

  const loadWeather = useCallback(async (city: City) => {
    setStatus('loading');
    setError(null);
    setData(null);
    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(toMessage(err));
    }
  }, []);

  const runSearch = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      setQuery(trimmed);
      setData(null);
      setCities([]);
      setError(null);

      if (!trimmed) {
        setStatus('empty');
        return;
      }

      setStatus('loading');
      try {
        const results = await searchCities(trimmed);
        if (results.length === 0) {
          setStatus('empty');
          return;
        }

        setCities(results);
        await loadWeather(results[0]);
      } catch (err) {
        setStatus('error');
        setError(toMessage(err));
      }
    },
    [loadWeather],
  );

  const search = useCallback(
    async (name: string) => {
      lastOperationRef.current = { type: 'search', name };
      await runSearch(name);
    },
    [runSearch],
  );

  const selectCity = useCallback(
    async (city: City) => {
      lastOperationRef.current = { type: 'selectCity', city };
      await loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(async () => {
    const lastOperation = lastOperationRef.current;
    if (!lastOperation) return;

    if (lastOperation.type === 'search') {
      await runSearch(lastOperation.name);
      return;
    }

    await loadWeather(lastOperation.city);
  }, [loadWeather, runSearch]);

  return { status, data, cities, error, query, search, selectCity, retry };
}

function toMessage(err: unknown): string {
  if (err instanceof WeatherServiceError) return err.message;
  return 'Algo deu errado. Tente novamente.';
}
