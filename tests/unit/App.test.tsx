import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { useWeather } from '../../src/hooks/useWeather';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: vi.fn(),
}));

const WEATHER_DATA: WeatherData = {
  city: {
    id: 1,
    name: 'Seattle',
    country: 'Estados Unidos',
    admin1: 'Washington',
    latitude: 47.6,
    longitude: -122.33,
  },
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
    {
      date: '2026-06-17',
      weatherCode: 61,
      max: 19,
      min: 11,
      precipitationProbability: 90,
    },
  ],
};

const hookActions = {
  search: vi.fn(),
  selectCity: vi.fn(),
  retry: vi.fn(),
};

const mockedUseWeather = vi.mocked(useWeather);

function mockWeatherState(overrides: Partial<ReturnType<typeof useWeather>> = {}) {
  mockedUseWeather.mockReturnValue({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
    ...hookActions,
    ...overrides,
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWeatherState();
  });

  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('renderiza o estado de carregamento', () => {
    mockWeatherState({ status: 'loading' });

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(/carregando o clima/i);
  });

  it('renderiza o estado vazio com a consulta atual', () => {
    mockWeatherState({ status: 'empty', query: 'Atlantis' });

    render(<App />);

    expect(screen.getByText(/nenhuma cidade encontrada para "Atlantis"/i)).toBeInTheDocument();
  });

  it('renderiza o erro e chama retry', async () => {
    const user = userEvent.setup();
    mockWeatherState({ status: 'error', error: 'Falha de rede.' });

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(hookActions.retry).toHaveBeenCalledTimes(1);
  });

  it('renderiza clima e previsão do hook no estado de sucesso', () => {
    mockWeatherState({ status: 'success', data: WEATHER_DATA });

    render(<App />);

    expect(screen.getByRole('region', { name: /clima atual/i })).toHaveTextContent('Seattle');
    expect(screen.getByRole('region', { name: /previsão de 5 dias/i })).toBeInTheDocument();
  });
});
