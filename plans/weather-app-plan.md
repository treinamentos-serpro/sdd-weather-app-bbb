# Plano Técnico: Weather App

Este plano deriva de `specs/weather-app-spec.md`, que é a fonte da verdade para
escopo, comportamento e critérios de aceite. O plano define decisões de
arquitetura e contratos; a implementação deve ser feita posteriormente a
partir das tarefas derivadas deste documento.

## Architecture

A aplicação será uma SPA React responsiva, organizada em camadas simples:

```text
SearchBar / UnitToggle
        |
        v
     App + useWeather  <---- Unit state (session)
        |
        +--> weatherService --> Open-Meteo geocoding
        |                  \--> Open-Meteo forecast
        v
CurrentWeather + ForecastList + estados de feedback
```

- `App` compõe a tela e decide qual estado de interface renderizar.
- `useWeather` coordena o fluxo de busca, seleção e carregamento, sem conter
  detalhes de HTTP.
- `weatherService` encapsula URLs, timeout, validação mínima e mapeamento das
  respostas externas para tipos de domínio.
- Componentes de apresentação recebem dados e callbacks por props. A
  conversão de temperatura fica em funções puras reutilizáveis.
- O fluxo de busca mostra resultados para desambiguação e só carrega o clima
  depois de uma seleção explícita do usuário.

Essa divisão atende FR01-FR05 e FR08, mantendo a troca de unidade local e sem
novo request, conforme FR06-FR07.

## Tech Stack

- **TypeScript strict:** contratos explícitos e validação de dados externos.
- **React + React DOM:** composição da SPA e estado local do fluxo.
- **Vite:** desenvolvimento e build da aplicação web.
- **Tailwind CSS:** layout responsivo, foco visível e tema visual consistente.
- **Open-Meteo:** geocoding e previsão, sem credencial no cliente, conforme a
  decisão de produto.
- **Vitest + Testing Library:** testes de funções, serviço, componentes e
  estados observáveis.
- **Playwright:** cobertura do fluxo principal em desktop e mobile.
- **Biome:** lint e formatação já definidos no projeto.

Não será introduzida biblioteca de gerenciamento global de estado, cliente HTTP
ou cache: o escopo de uma única tela não justifica essa complexidade.

## Project Structure

```text
src/
  App.tsx                         Composição da tela e estados visuais
  main.tsx                        Ponto de entrada React
  components/
    SearchBar.tsx                 Campo e envio da busca
    UnitToggle.tsx                Controle exclusivo C/F
    CurrentWeather.tsx            Condições atuais
    ForecastList.tsx              Lista com cinco dias
    ForecastCard.tsx              Item diário
    states/                        Loading, vazio e erro
  hooks/
    useWeather.ts                 Orquestração do fluxo e concorrência
  services/
    weatherService.ts             Open-Meteo, timeout e mapeamento
  lib/
    format.ts                     Datas, números e textos de apresentação
    temperature.ts                Conversão e arredondamento C/F
    weatherCodes.ts               Código meteorológico para texto/ícone
  types/
    weather.ts                    Contratos de domínio
  styles/
    index.css                     Estilos globais e responsividade
tests/
  unit/                            Testes unitários e de componentes
  e2e/                             Fluxos de aceite no navegador
```

Os nomes refletem a estrutura já existente e respeitam a separação entre
componentes, hooks, serviços, funções puras e tipos compartilhados.

## Data Model

As temperaturas são armazenadas em Celsius no domínio. A unidade selecionada é
uma preocupação de apresentação e sessão.

```ts
type Unit = 'celsius' | 'fahrenheit';

interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface CurrentWeather {
  time: string;
  temperature: number;       // Celsius
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
}

interface ForecastDay {
  date: string;               // ISO date local da cidade
  min: number;                // Celsius
  max: number;                // Celsius
  weatherCode: number;
  precipitationProbability: number;
}

interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];   // exatamente cinco itens
}
```

Contrato de serviço:

```ts
searchCities(name: string): Promise<City[]>;
getWeather(city: City): Promise<WeatherData>;
```

O serviço deve rejeitar HTTP malsucedido, JSON inválido e campos obrigatórios
ausentes. Uma previsão com menos de cinco dias é inválida para este produto e
deve resultar em erro, em vez de exibir dados parciais. Campos opcionais de
localização podem ser ausentes, mas a UI deve manter informação suficiente para
desambiguação usando os campos disponíveis.

## Data Flow

1. `SearchBar` normaliza espaços e envia o nome por botão ou Enter.
2. O hook valida consulta vazia, limpa resultados anteriores e muda para
   `loading` imediatamente.
3. `weatherService.searchCities` envia o nome codificado à API de geocoding e
   devolve `City[]` normalizado.
4. Lista vazia produz `empty`; múltiplos resultados ficam disponíveis para
   seleção e não carregam clima automaticamente.
5. Ao selecionar uma cidade, o hook invalida o resultado anterior, busca o
   agregado `WeatherData` e só publica dados após validação completa.
6. `App` passa o agregado aos componentes atuais e de previsão. Os cinco itens
   são renderizados em ordem cronológica.
7. `UnitToggle` altera apenas `Unit`; funções de temperatura formatam os dados
   Celsius para Celsius ou Fahrenheit sem alterar `WeatherData` nem fazer
   requisições.
8. Uma nova busca limpa o resultado visível enquanto carrega. Respostas de uma
   operação anterior não podem substituir o estado da operação mais recente;
   o hook deve usar um identificador de requisição ou cancelamento para
   ignorar respostas obsoletas.

## External APIs

### Geocoding

- Base: `https://geocoding-api.open-meteo.com/v1/search`
- Parâmetros: `name`, `count` limitado a uma quantidade pequena, `language=pt`
  e `format=json`.
- Saída consumida: `id`, `name`, `country`, `admin1`, `latitude` e `longitude`.
- A consulta deve usar `encodeURIComponent` ou `URLSearchParams`; entrada do
  usuário é sempre não confiável.

### Forecast

- Base: `https://api.open-meteo.com/v1/forecast`
- Parâmetros: `latitude`, `longitude`, `current` com temperatura, umidade,
  vento, pressão, precipitação e código meteorológico; `daily` com código,
  máxima, mínima e probabilidade de precipitação; `forecast_days=5` e
  `timezone=auto`.
- A resposta deve conter `current` e arrays diários com pelo menos cinco
  posições alinhadas. O mapeador corta explicitamente a previsão para cinco
  itens caso a API retorne mais.
- A camada de serviço define timeout com `AbortController`, traduz falhas de
  rede/timeout/HTTP para erro de domínio e não expõe detalhes técnicos à UI.
- Antes da publicação, confirmar limites de uso e requisitos de atribuição da
  Open-Meteo, conforme a pergunta aberta da especificação.

## State Management

O estado será local, dividido entre o hook de dados e o componente de tela:

- `useWeather`: `status`, `data`, `cities`, `error`, `query`, cidade selecionada
  e informações necessárias para retry.
- `App`: `unit`, inicializada como `celsius`, e mantida durante a sessão atual.
- Status permitido: `idle | loading | success | error | empty`.
- `success` exige `WeatherData` completo; `empty` exige ausência de cidades;
  `error` exige mensagem pt-BR e ação de retry.

Não haverá localStorage, histórico, favoritos, contexto global ou persistência
de servidor, em concordância com as assumptions e o out of scope da spec.

## Error Handling

- Consulta vazia ou só com espaços: não chamar a API; manter o formulário
  utilizável e orientar a entrada em pt-BR.
- Nenhuma cidade: `empty`, mensagem clara e campo pronto para nova tentativa.
- Cidade ambígua: exibir nome mais país/estado/região disponível, sem dados
  meteorológicos até a seleção.
- Timeout, offline e falha de rede: `error` com mensagem compreensível e
  `retry`.
- HTTP não-2xx, JSON inválido, campos ausentes ou menos de cinco dias:
  `error`; não renderizar clima parcial.
- Nova busca durante carregamento: mostrar o carregamento da nova consulta,
  limpar o resultado antigo e ignorar respostas tardias.
- Troca de unidade durante carregamento ou sem cidade: atualizar somente a
  preferência; não iniciar busca e aplicar a unidade quando houver dados.
- Códigos meteorológicos sem mapeamento: usar texto genérico acessível, nunca
  depender apenas de cor ou ícone.
- Os controles de retry e seleção devem ser botões reais, focáveis, com rótulos
  acessíveis. Mensagens de estado devem ser anunciadas adequadamente e o
  layout móvel não pode exigir rolagem horizontal.

## Testing Strategy

Os testes devem rastrear os critérios `AC01.1` a `AC09.4` e cobrir o contrato
de cada camada:

- **Funções puras:** conversão C/F, arredondamento consistente, formatação de
  data/temperatura e mapeamento de códigos meteorológicos, incluindo negativos,
  valores iguais e caracteres/idioma pt-BR.
- **Serviço:** mock de `fetch` para URL/parâmetros, resultados vazios,
  resultados ambíguos, timeout, erro HTTP, JSON inválido, campos ausentes e
  arrays diários insuficientes.
- **Componentes:** envio por botão e Enter, rótulos acessíveis, seleção de
  cidade, estados distinguíveis, retry e exatamente cinco cards.
- **Integração/App:** unidade inicial Celsius, alternância sem nova busca,
  persistência da unidade entre cidades e substituição completa dos dados ao
  pesquisar novamente.
- **E2E Playwright:** fluxo válido, ambiguidade, vazio, erro/retry, troca de
  unidade e fluxo completo em viewport desktop e mobile, verificando ausência
  de rolagem horizontal e legibilidade básica.

Validação local esperada antes da entrega: `pnpm lint`, `pnpm build` e
`pnpm test`; executar também `pnpm test:e2e` quando o ambiente permitir.

## Risks & Trade-offs

| Risco/decisão | Trade-off e mitigação |
| --- | --- |
| Dependência de disponibilidade, latência e limites da Open-Meteo | Não há cache ou fallback offline no escopo; timeout, erro explícito, retry e monitoramento reduzem o impacto. |
| Desambiguação de cidades | Exibir país/estado/região melhora a escolha; limitar resultados mantém a interface simples, mas pode omitir opções menos relevantes. |
| Dados externos inconsistentes | Validar contrato e rejeitar previsão incompleta evita dados enganadores, ao custo de mostrar erro em respostas parciais. |
| Temperaturas normalizadas em Celsius | Facilita conversão sem novo request e garante consistência; exige disciplina para converter apenas na apresentação. |
| Estado local em vez de solução global | Menor complexidade e superfície de bugs; adequado a uma única tela, mas não serviria diretamente para histórico ou múltiplas rotas. |
| Ignorar respostas obsoletas | Um identificador/cancelamento evita mistura entre cidades; a operação antiga pode continuar consumindo rede se não for cancelada. |
| Layout responsivo com cinco itens | Cards podem ocupar mais espaço em telas estreitas; usar composição empilhável ou rolagem interna controlada, sem rolagem horizontal da página. |
| Ícones e códigos meteorológicos | Texto sempre acompanha o ícone e há fallback desconhecido, atendendo acessibilidade sem depender de uma biblioteca visual adicional. |
| Open questions da spec | Limites/atribuição, campos extras, sugestões, cidade padrão e navegadores devem ser decididos antes da publicação; não expandir o MVP enquanto isso não for aprovado. |