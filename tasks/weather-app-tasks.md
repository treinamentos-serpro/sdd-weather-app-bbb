# Backlog de Tarefas: Weather App

Este backlog consome [plans/weather-app-plan.md](../plans/weather-app-plan.md) e
deve ser executado na ordem apresentada dentro de cada entrega. Os critérios
de aceite são verificáveis por inspeção, teste automatizado ou execução manual.
Cada tarefa referencia os requisitos da especificação para manter a
rastreabilidade até `specs/weather-app-spec.md`.

## Matriz de rastreabilidade funcional

| Requisito | Resumo | Tarefas que implementam | Tarefas que validam | Cobertura |
| --- | --- | --- | --- | --- |
| FR01 | Buscar cidades por nome em desktop e mobile | T-04, T-07, T-11, T-12 | T-06, T-14, T-15 | Completa: AC01.1-AC01.3 |
| FR02 | Desambiguar resultados e carregar a cidade selecionada | T-04, T-07, T-11, T-12 | T-06, T-14, T-15 | Completa: AC02.1-AC02.3 |
| FR03 | Representar loading, vazio e erro com recuperação | T-04, T-05, T-10, T-11, T-12 | T-06, T-14, T-15 | Completa: AC03.1-AC03.3 |
| FR04 | Exibir clima atual, localização, condição e unidade | T-01, T-02, T-03, T-05, T-09, T-12 | T-06, T-13, T-14, T-15 | Completa: AC04.1-AC04.4 |
| FR05 | Exibir previsão diária de hoje mais quatro dias | T-01, T-03, T-05, T-09, T-12 | T-06, T-14, T-15 | Completa: AC05.1-AC05.4 |
| FR06 | Alternar entre Celsius e Fahrenheit sem nova busca | T-01, T-02, T-08, T-09, T-12 | T-13, T-14, T-15 | Completa: AC06.1-AC06.4 |
| FR07 | Manter a unidade escolhida durante a sessão | T-01, T-02, T-08, T-12 | T-13, T-14, T-15 | Completa: AC07.1-AC07.3 |
| FR08 | Realizar novas consultas sem recarregar a página | T-04, T-05, T-07, T-10, T-11, T-12 | T-06, T-14, T-15 | Completa: AC08.1-AC08.4 |
| FR09 | Disponibilizar o fluxo completo em dispositivos móveis | T-07, T-08, T-09, T-12 | T-14, T-15, T-16 | Completa: AC09.1-AC09.4 |

### Requisitos sem tarefa correspondente

Nenhum requisito funcional está sem tarefa correspondente. Os requisitos
`FR01` a `FR09` têm pelo menos uma tarefa de implementação e uma tarefa de
validação. A verificação final de `T-16` também cobre a execução integrada e
os requisitos não funcionais de qualidade, compatibilidade, segurança e
privacidade.

## Entrega 1: Fundação e contratos

### T-01 - Consolidar contratos de domínio

- **Descrição:** Confirmar ou ajustar os tipos compartilhados de cidade, clima
  atual, previsão, agregado meteorológico e unidade conforme o plano. Garantir
  que temperaturas de domínio sejam sempre Celsius e que a previsão represente
  exatamente cinco dias.
- **Critérios de aceite:**
  - Existem `Unit`, `City`, `CurrentWeather`, `ForecastDay` e `WeatherData` com
    os campos definidos no plano.
  - `WeatherData.forecast` representa cinco itens válidos, sem contrato de
    unidade variável nos dados brutos.
  - Latitude, longitude e identificador da cidade estão disponíveis para o
    request de forecast.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR04, FR05, FR06, FR07.

### T-02 - Implementar funções de temperatura e apresentação

- **Descrição:** Centralizar conversão Celsius/Fahrenheit, arredondamento,
  símbolo da unidade e formatação de datas/números em funções puras.
- **Critérios de aceite:**
  - Celsius permanece inalterado e Fahrenheit usa a conversão correta.
  - Valores negativos, zero e conversões que arredondam para o mesmo valor são
    tratados sem perda de consistência.
  - A mesma regra de arredondamento e o símbolo `°C`/`°F` são reutilizáveis por
    clima atual e previsão.
  - Datas e textos de apresentação são formatados em pt-BR.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/format.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR04, FR05, FR06, FR07, NFR08.

### T-03 - Mapear códigos meteorológicos para texto acessível

- **Descrição:** Criar o mapeamento dos códigos da Open-Meteo para descrições
  em pt-BR e um fallback para códigos desconhecidos.
- **Critérios de aceite:**
  - Códigos usados pela API exibem condição meteorológica compreensível.
  - Todo código desconhecido produz texto genérico válido.
  - O contrato permite acompanhar qualquer ícone com texto, sem depender de
    cor ou imagem para comunicar a condição.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR04.3, FR05.3, NFR03.

## Entrega 2: Integração de dados

### T-04 - Implementar busca de cidades no Open-Meteo

- **Descrição:** Encapsular a chamada de geocoding, normalizar resultados para
  `City` e tratar consulta vazia, erros HTTP, rede, timeout e respostas sem
  resultados.
- **Critérios de aceite:**
  - Consulta vazia ou composta apenas por espaços não chama a API e retorna
    resultado vazio controlável pelo chamador.
  - O nome é codificado com segurança e os parâmetros incluem quantidade
    limitada, idioma pt e formato JSON.
  - Cada resultado contém nome, país/região quando disponíveis, coordenadas e
    identificador.
  - Nenhum resultado produz `City[]` vazio; falha HTTP, timeout, JSON inválido
    ou falha de rede produz erro de domínio tratável.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR01, FR02, FR03, NFR05, NFR07.

### T-05 - Implementar carregamento e validação do forecast

- **Descrição:** Buscar clima atual e previsão diária para uma cidade,
  normalizar a resposta e validar campos obrigatórios e os cinco dias.
- **Critérios de aceite:**
  - O request usa coordenadas, campos atuais e diários definidos no plano,
    `forecast_days=5` e `timezone=auto`.
  - O retorno contém clima atual e exatamente cinco dias em ordem cronológica.
  - Arrays desalinhados, campos ausentes, JSON inválido, HTTP malsucedido,
    timeout ou menos de cinco dias produzem erro de domínio, sem dados parciais.
  - Todas as temperaturas retornadas ao domínio estão em Celsius.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR04, FR05, FR08, NFR05.

### T-06 - Testar os contratos do serviço de dados

- **Descrição:** Criar testes unitários com `fetch` mockado para geocoding,
  forecast, validação e falhas da integração.
- **Critérios de aceite:**
  - Testes verificam URLs, parâmetros, codificação da busca e mapeamento dos
    campos para os tipos de domínio.
  - Há cobertura para vazio, múltiplos resultados, HTTP, timeout, rede, JSON
    inválido, campos ausentes e previsão insuficiente.
  - Os testes confirmam que o forecast publicado possui cinco itens e não
    contém resposta parcial.
- **Dependências:** T-04, T-05.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** FR01-FR05, NFR05.

## Entrega 3: UI base e acessibilidade

### T-07 - Implementar busca e seleção de cidade

- **Descrição:** Construir o formulário de busca e uma lista de resultados
  selecionáveis, operáveis por teclado e toque, com identificação de cidade e
  localização.
- **Critérios de aceite:**
  - O campo possui rótulo acessível e o envio funciona por botão e Enter.
  - O controle de envio fornece feedback de carregamento e evita submissão
    acidental de consulta vazia.
  - Cada resultado mostra nome e país, estado ou região quando disponível.
  - Selecionar um resultado chama o callback da cidade escolhida; a lista não
    carrega clima por conta própria.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** FR01, FR02, FR08, NFR02, NFR03, NFR08.

### T-08 - Implementar controle de unidade da sessão

- **Descrição:** Construir o controle com exatamente Celsius e Fahrenheit e
  contrato controlado por `value`/`onChange`.
- **Critérios de aceite:**
  - Apenas `°C` e `°F` são oferecidos, com rótulos acessíveis.
  - O controle funciona por teclado e toque.
  - Alterá-lo não chama serviço de geocoding nem forecast.
  - O valor selecionado pode ser usado por todos os componentes de temperatura.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** FR06, FR07, FR09, NFR03.

### T-09 - Implementar componentes de clima atual e previsão

- **Descrição:** Renderizar o agregado meteorológico com localização, condição
  textual, temperatura atual e lista de cinco dias usando a unidade recebida.
- **Critérios de aceite:**
  - O clima atual identifica cidade/localização, temperatura e unidade.
  - A previsão renderiza exatamente cinco itens, em ordem, com dia, condição,
    mínima e máxima.
  - Os componentes usam as funções de temperatura e códigos meteorológicos,
    sem duplicar conversões ou depender apenas de ícones.
  - O layout permanece legível em telas estreitas e não cria rolagem horizontal
    da página.
- **Dependências:** T-01, T-02, T-03.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `src/styles/index.css`.
- **Tipo:** UI
- **Rastreabilidade:** FR04, FR05, FR06, FR09, NFR01, NFR03.

### T-10 - Implementar estados visuais de feedback

- **Descrição:** Criar estados distintos para inicial, carregamento, vazio e
  erro, incluindo ação de retry e mensagens em pt-BR.
- **Critérios de aceite:**
  - Loading, vazio e erro são visual e semanticamente distinguíveis.
  - Vazio mantém a possibilidade de nova busca.
  - Erro apresenta mensagem compreensível e botão de nova tentativa acessível.
  - Nenhum estado de loading, erro ou vazio exibe clima incompleto como válido.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`, `src/components/states/LoadingState.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** FR01.3, FR03, FR08.2, NFR02, NFR03, NFR05.

## Entrega 4: Orquestração e fluxo da aplicação

### T-11 - Implementar máquina de estados do fluxo meteorológico

- **Descrição:** Implementar ou ajustar `useWeather` para coordenar busca,
  desambiguação, seleção, retry e carregamento sem misturar resultados antigos.
- **Critérios de aceite:**
  - O hook expõe `idle`, `loading`, `success`, `error` e `empty`, além de dados,
    cidades, consulta, seleção e callbacks necessários.
  - Busca vazia não chama serviço; busca sem resultado produz `empty`.
  - Resultado ambíguo mantém opções disponíveis e não carrega o clima antes da
    seleção explícita.
  - Uma busca nova limpa o resultado anterior enquanto carrega.
  - Resposta tardia de operação anterior não substitui a operação mais recente.
  - Retry repete a última operação relevante e preserva mensagens tratáveis.
- **Dependências:** T-04, T-05, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** FR01-FR03, FR08, NFR04, NFR05.

### T-12 - Integrar a tela principal e a unidade de sessão

- **Descrição:** Compor `App` com busca, seleção, estados, clima atual,
  previsão e unidade inicial Celsius, mantendo a unidade ao trocar de cidade.
- **Critérios de aceite:**
  - A tela inicial apresenta busca e controle de unidade sem exigir cidade
    padrão ou autenticação.
  - O resultado selecionado substitui completamente cidade, clima atual e
    previsão anteriores.
  - Alternar unidade atualiza temperatura atual e todos os cinco dias sem novo
    request ou novo envio do formulário.
  - A unidade escolhida permanece aplicada a novas cidades durante a sessão.
  - Todos os textos e mensagens da interface estão em pt-BR.
- **Dependências:** T-07, T-08, T-09, T-10, T-11.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** FR01-FR09, NFR01-NFR04, NFR08.

## Entrega 5: Testes e hardening

### T-13 - Testar conversão de unidade

- **Descrição:** Criar testes unitários dedicados para conversão, arredondamento
  e formatação de temperaturas em Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Celsius permanece inalterado e Fahrenheit usa a fórmula correta.
  - Há casos para zero, valores negativos e conversões com arredondamento.
  - O símbolo e a regra de arredondamento são consistentes para clima atual e
    previsão.
  - O teste demonstra que a conversão é local e não dispara qualquer request.
- **Dependências:** T-02, T-08, T-09.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** FR04, FR05, FR06, FR07, AC06.2-AC06.4, AC07.1-AC07.3.

### T-14 - Testar componentes e estados da interface

- **Descrição:** Criar testes unitários de componentes para busca, seleção,
  unidade, loading, erro, vazio e renderização da previsão.
- **Critérios de aceite:**
  - Busca funciona por botão e Enter, com rótulos acessíveis e seleção de
    cidade por teclado/toque simulado.
  - Loading, erro e vazio são distinguíveis; vazio permite nova busca e erro
    oferece retry.
  - O resultado renderiza exatamente cinco cards e condições meteorológicas com
    texto acessível.
  - Alternar unidade atualiza o conteúdo exibido sem chamar a API.
- **Dependências:** T-03, T-07, T-08, T-09, T-10, T-11, T-12.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`, `tests/unit/App.test.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** FR01-FR06, FR08, NFR02-NFR04.

### T-15 - Validar fluxo principal com testes E2E

- **Descrição:** Criar cenários Playwright para fluxo válido, ambiguidade,
  vazio, erro/retry, unidade e viewport mobile.
- **Critérios de aceite:**
  - Fluxo válido chega a cidade selecionada, clima atual e cinco dias.
  - Busca ambígua exige seleção; busca vazia e erro oferecem recuperação.
  - Alternância C/F atualiza todos os valores sem nova busca.
  - O cenário mobile completa o fluxo sem rolagem horizontal, sobreposição ou
    corte perceptível.
  - Os testes isolam a API externa por mock/interceptação determinística.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC01.1-AC09.4, NFR01, NFR05, NFR06.

### T-16 - Executar validação de qualidade e prontidão de publicação

- **Descrição:** Rodar lint, build, testes unitários e E2E quando disponível;
  revisar requisitos de uso/atribuição da Open-Meteo e compatibilidade definida
  para publicação.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` concluem sem falhas relacionadas ao
    produto.
  - `pnpm test:e2e` passa no ambiente configurado ou a limitação é registrada.
  - Não há credenciais no cliente, dados pessoais, persistência fora do escopo
    ou dependências de funcionamento offline.
  - Limites de uso, termos e atribuição da Open-Meteo estão confirmados antes
    da publicação.
- **Dependências:** T-06, T-13, T-14, T-15.
- **Arquivos prováveis:** `package.json`, `README.md`, `playwright.config.ts`.
- **Tipo:** Infra
- **Rastreabilidade:** NFR05, NFR06, NFR07, assumptions e open questions.