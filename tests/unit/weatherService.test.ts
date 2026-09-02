import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Seattle');
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('converte timeout em erro de serviço e limpa o timer', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn((_url: string, init?: RequestInit) => {
          return new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Request timed out', 'AbortError'));
            });
          });
        }),
      );

      const request = searchCities('Seattle');
      const expectation = expect(request).rejects.toThrow(
        new WeatherServiceError('A requisição demorou demais.'),
      );
      await vi.advanceTimersByTimeAsync(10_000);

      await expectation;
      expect(vi.getTimerCount()).toBe(0);
    });

    it('converte falha de rede em erro de serviço', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')));
      await expect(searchCities('Seattle')).rejects.toThrow(
        new WeatherServiceError('Falha de rede.'),
      );
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          daily: {
            time: [
              '2026-06-16',
              '2026-06-17',
              '2026-06-18',
              '2026-06-19',
              '2026-06-20',
              '2026-06-21',
            ],
            weather_code: [3, 61, 80, 1, 0, 2],
            temperature_2m_max: [20, 19, 22, 24, 25, 26],
            temperature_2m_min: [12, 11, 13, 14, 15, 16],
            precipitation_probability_max: [20, 90, 70, 10, null, 30],
          },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.current.temperature).toBe(18);
      expect(data.forecast).toHaveLength(5);
      // precipitação nula vira 0 (resposta parcial)
      expect(data.forecast[4].precipitationProbability).toBe(0);
    });

    it('envia os parâmetros esperados para o endpoint de forecast', async () => {
      const fetchSpy = mockFetchOnce({
        current: {
          time: '2026-06-16T12:00',
          temperature_2m: 18,
          relative_humidity_2m: 80,
          wind_speed_10m: 10,
          surface_pressure: 1015,
          precipitation: 0,
          weather_code: 3,
        },
        daily: {
          time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
          weather_code: [3, 61, 80, 1, 0],
          temperature_2m_max: [20, 19, 22, 24, 25],
          temperature_2m_min: [12, 11, 13, 14, 15],
          precipitation_probability_max: [20, 90, 70, 10, null],
        },
      });
      vi.stubGlobal('fetch', fetchSpy);

      await getWeather(CITY);

      const requestUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(requestUrl.origin + requestUrl.pathname).toBe(
        'https://api.open-meteo.com/v1/forecast',
      );
      expect(requestUrl.searchParams.get('latitude')).toBe(String(CITY.latitude));
      expect(requestUrl.searchParams.get('longitude')).toBe(String(CITY.longitude));
      expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
      expect(requestUrl.searchParams.get('timezone')).toBe('auto');
      expect(requestUrl.searchParams.get('current')).toBe(
        'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
      );
      expect(requestUrl.searchParams.get('daily')).toBe(
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      );
    });

    it('lança erro quando a resposta está incompleta', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ current: null, daily: null }));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro quando os arrays da previsão têm menos de cinco itens', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          daily: {
            time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'],
            weather_code: [3, 61, 80, 1],
            temperature_2m_max: [20, 19, 22, 24],
            temperature_2m_min: [12, 11, 13, 14],
            precipitation_probability_max: [20, 90, 70, 10],
          },
        }),
      );

      await expect(getWeather(CITY)).rejects.toThrow(
        new WeatherServiceError('Resposta de clima incompleta. Tente novamente.'),
      );
    });
  });
});
