import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  current: {
    temperature: 23.4,
    weatherCode: 2,
    humidity: 68,
    windSpeed: 12.6,
    pressure: 1014.2,
    precipitation: 0,
    time: '2026-09-02T12:00',
  },
  forecast: [
    {
      date: '2026-09-02',
      min: 17.8,
      max: 25.6,
      weatherCode: 2,
      precipitationProbability: 20,
    },
    {
      date: '2026-09-03',
      min: 18.2,
      max: 26.4,
      weatherCode: 1,
      precipitationProbability: 10,
    },
    {
      date: '2026-09-04',
      min: 19.1,
      max: 27.2,
      weatherCode: 3,
      precipitationProbability: 30,
    },
    {
      date: '2026-09-05',
      min: 18.6,
      max: 24.8,
      weatherCode: 61,
      precipitationProbability: 65,
    },
    {
      date: '2026-09-06',
      min: 17.3,
      max: 23.9,
      weatherCode: 80,
      precipitationProbability: 55,
    },
  ],
};
