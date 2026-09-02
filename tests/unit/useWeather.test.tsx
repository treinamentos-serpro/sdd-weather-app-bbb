import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();
  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

const OTHER_CITY: City = {
  id: 2,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Oregon',
  latitude: 45.52,
  longitude: -122.68,
};

const WEATHER_DATA: WeatherData = {
  city: CITY,
  current: {
    time: '2026-06-16T12:00',
    temperature: 18,
    humidity: 80,
    windSpeed: 10,
    pressure: 1015,
    precipitation: 0,
    weatherCode: 3,
  },
  forecast: [
    {
      date: '2026-06-16',
      weatherCode: 3,
      max: 20,
      min: 12,
      precipitationProbability: 20,
    },
  ],
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicia em idle com valores vazios', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('busca cidades e carrega o clima da primeira cidade encontrada', async () => {
    mockedSearchCities.mockResolvedValue([CITY, OTHER_CITY]);
    mockedGetWeather.mockResolvedValue(WEATHER_DATA);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Seattle ');
    });

    expect(mockedSearchCities).toHaveBeenCalledWith('Seattle');
    expect(mockedGetWeather).toHaveBeenCalledWith(CITY);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(WEATHER_DATA);
    expect(result.current.cities).toEqual([CITY, OTHER_CITY]);
    expect(result.current.query).toBe('Seattle');
  });

  it('marca empty quando a busca não encontra cidades', async () => {
    mockedSearchCities.mockResolvedValue([]);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantis');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('seleciona uma cidade e carrega o clima dela', async () => {
    const selectedWeather = { ...WEATHER_DATA, city: OTHER_CITY };
    mockedGetWeather.mockResolvedValue(selectedWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(OTHER_CITY);
    });

    expect(mockedGetWeather).toHaveBeenCalledWith(OTHER_CITY);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(selectedWeather);
  });

  it('expõe erro tratável quando o serviço falha', async () => {
    mockedSearchCities.mockRejectedValue(new WeatherServiceError('Falha de rede.'));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');
  });

  it('retry refaz a última busca', async () => {
    mockedSearchCities
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([CITY]);
    mockedGetWeather.mockResolvedValue(WEATHER_DATA);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Seattle');
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
    expect(mockedSearchCities).toHaveBeenLastCalledWith('Seattle');
    expect(result.current.status).toBe('success');
  });

  it('retry refaz a última seleção de cidade', async () => {
    mockedGetWeather
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(WEATHER_DATA);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(CITY);
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
    expect(mockedGetWeather).toHaveBeenLastCalledWith(CITY);
    expect(result.current.status).toBe('success');
  });
});
