# Weather App - Product Specification

## Overview

### Objetivo

Construir uma aplicação web responsiva de previsão do tempo que permita ao
usuário pesquisar cidades, consultar o clima atual, visualizar uma previsão de
cinco dias, alternar entre Celsius e Fahrenheit e utilizar o fluxo principal
em dispositivos móveis.

### Público e valor

O produto atende pessoas que precisam tomar decisões rápidas sobre deslocamentos
e atividades ao ar livre, além de usuários que consultam cidades nacionais ou
internacionais com diferentes preferências de unidade. A experiência deve ser
direta, compreensível e não exigir cadastro.

### Fluxo principal

1. O usuário informa o nome de uma cidade.
2. O sistema pesquisa cidades correspondentes usando a Open-Meteo.
3. O usuário seleciona uma cidade quando houver mais de uma opção relevante.
4. O sistema exibe o clima atual e cinco dias de previsão, correspondentes ao
   dia atual e aos quatro dias seguintes.
5. O usuário pode alternar a unidade de temperatura sem repetir a busca.

### Decisões de produto

- **Fonte de dados:** Open-Meteo, sem API key.
- **Horizonte da previsão:** hoje + quatro dias seguintes.
- **Unidade inicial:** Celsius (°C).
- **Acesso:** sem autenticação e sem persistência de servidor.
- **Idioma inicial:** português do Brasil (pt-BR).

## Functional Requirements

### FR01 - Buscar cidades

O sistema deve permitir que o usuário pesquise uma cidade pelo nome por meio de
um campo de busca e envie a consulta em desktop ou dispositivo móvel.

**Acceptance criteria:**

- **AC01.1:** Dado que o usuário está na tela inicial, quando informa um nome
  de cidade e envia a busca, o sistema inicia uma consulta de geocodificação.
- **AC01.2:** A busca pode ser enviada por um controle visível e também pela
  tecla Enter quando o foco estiver no campo.
- **AC01.3:** Enquanto a consulta estiver em andamento, o sistema informa que
  a busca está sendo processada e evita que o usuário interprete a tela como
  sem resultado.

### FR02 - Desambiguar resultados

Quando o nome informado corresponder a mais de uma cidade, o sistema deve
apresentar opções identificáveis para seleção.

**Acceptance criteria:**

- **AC02.1:** Cada opção de resultado exibe, no mínimo, nome da cidade e
  informação de localização, como país, estado ou região.
- **AC02.2:** O sistema não carrega o clima de uma opção ambígua antes da
  seleção do usuário.
- **AC02.3:** Após a seleção de uma opção, o sistema usa aquela localização
  para carregar o clima atual e a previsão.

### FR03 - Tratar estados da busca

O sistema deve representar os estados de carregamento, ausência de resultados e
falha na consulta com mensagens compreensíveis.

**Acceptance criteria:**

- **AC03.1:** Para uma consulta sem correspondências, o sistema exibe uma
  mensagem de nenhum resultado encontrado e mantém a possibilidade de nova
  busca.
- **AC03.2:** Quando a fonte de dados falhar ou retornar resposta inválida, o
  sistema exibe uma mensagem de erro em pt-BR e oferece uma ação de tentar
  novamente.
- **AC03.3:** O estado de carregamento, o estado de erro e o estado sem
  resultados são distinguíveis entre si e não exibem dados meteorológicos
  incompletos como se fossem válidos.

### FR04 - Exibir clima atual

Após a seleção de uma cidade válida, o sistema deve exibir as condições atuais
disponíveis para essa localização.

**Acceptance criteria:**

- **AC04.1:** O resultado exibe o nome da cidade e sua localização.
- **AC04.2:** O resultado exibe a temperatura atual com a unidade correspondente
  à unidade selecionada.
- **AC04.3:** O resultado exibe a condição meteorológica atual em texto ou em
  ícone acompanhado de texto.
- **AC04.4:** O resultado identifica a unidade de temperatura usada como °C ou
  °F.

### FR05 - Exibir previsão de cinco dias

O sistema deve exibir uma previsão diária para cinco dias: hoje e os quatro
dias seguintes.

**Acceptance criteria:**

- **AC05.1:** Após uma cidade válida ser selecionada, o sistema exibe
  exatamente cinco itens diários de previsão.
- **AC05.2:** Os cinco itens representam o dia atual e os quatro dias
  cronologicamente seguintes.
- **AC05.3:** Cada item identifica o dia, exibe a condição meteorológica e
  apresenta as temperaturas mínima e máxima.
- **AC05.4:** Os valores da previsão são associados à cidade selecionada e não
  permanecem visíveis como resultado de uma consulta anterior.

### FR06 - Alternar unidade de temperatura

O sistema deve permitir a alternância entre Celsius e Fahrenheit sem exigir uma
nova busca da cidade.

**Acceptance criteria:**

- **AC06.1:** O controle de unidade oferece exatamente as opções Celsius (°C) e
  Fahrenheit (°F).
- **AC06.2:** Quando o usuário muda de unidade, a temperatura atual e todas as
  temperaturas da previsão são atualizadas para a unidade escolhida.
- **AC06.3:** A mudança de unidade não dispara uma nova busca de cidade nem
  exige novo envio do formulário.
- **AC06.4:** Os valores convertidos são exibidos com a unidade correta e com
  arredondamento consistente em toda a tela.

### FR07 - Aplicar unidade selecionada durante a sessão

O sistema deve manter a unidade escolhida de forma consistente durante a sessão
atual.

**Acceptance criteria:**

- **AC07.1:** Depois que o usuário seleciona Fahrenheit, novas cidades
  consultadas durante a mesma sessão são exibidas em Fahrenheit até nova
  alteração.
- **AC07.2:** Depois que o usuário seleciona Celsius, novas cidades consultadas
  durante a mesma sessão são exibidas em Celsius até nova alteração.
- **AC07.3:** A mesma unidade é usada no clima atual e nos cinco dias de
  previsão da cidade exibida.

### FR08 - Realizar novas consultas

O sistema deve permitir que o usuário pesquise outra cidade sem recarregar a
página.

**Acceptance criteria:**

- **AC08.1:** O usuário consegue alterar o texto da busca e iniciar uma nova
  consulta após visualizar um resultado.
- **AC08.2:** Enquanto a nova consulta é processada, o sistema comunica o novo
  carregamento e não mistura dados das duas cidades.
- **AC08.3:** Após a nova seleção, o sistema substitui o nome, clima atual e
  previsão pelos dados da nova cidade.
- **AC08.4:** A unidade selecionada anteriormente permanece aplicada à nova
  consulta durante a sessão.

### FR09 - Disponibilizar o fluxo em dispositivos móveis

O sistema deve oferecer busca, seleção de cidade, consulta meteorológica e
alternância de unidade em smartphones e tablets com interação por toque.

**Acceptance criteria:**

- **AC09.1:** Em uma viewport móvel suportada, o usuário consegue completar o
  fluxo principal sem rolagem horizontal.
- **AC09.2:** O campo, o envio da busca, os resultados selecionáveis e o
  controle de unidade permanecem visíveis ou alcançáveis por toque.
- **AC09.3:** O clima atual e os cinco dias de previsão permanecem legíveis sem
  sobreposição ou corte de conteúdo.
- **AC09.4:** A alternância de unidade funciona por toque e atualiza todos os
  valores exibidos na viewport móvel.

## User Stories

### US01 - Consulta rápida antes de sair

Como Mariana, profissional em deslocamento, quero pesquisar minha cidade e ver
rapidamente o clima atual e os próximos dias para decidir minha roupa e meu
transporte.

### US02 - Planejamento de atividade

Como Carlos, planejador de atividades ao ar livre, quero comparar as condições
meteorológicas de cinco dias para escolher a melhor data para um passeio.

### US03 - Preferência de unidade

Como Ana, usuária internacional, quero alternar entre Celsius e Fahrenheit para
interpretar a previsão na unidade com que estou familiarizada.

### US04 - Consulta sem cadastro

Como usuário ocasional, quero consultar uma cidade sem criar conta para obter
uma resposta com baixo atrito.

### US05 - Recuperação de falha

Como usuário, quero receber uma mensagem compreensível e poder tentar novamente
quando a consulta não puder ser concluída.

## Acceptance Criteria

Os critérios de aceite detalhados estão associados a cada requisito em
`FR01` a `FR09`. O produto será considerado funcionalmente aceitável quando:

- todos os critérios `AC01.1` a `AC09.4` aplicáveis forem atendidos;
- uma busca válida resultar em uma cidade selecionada, clima atual e cinco
  dias de previsão;
- uma busca ambígua exigir seleção identificada da cidade;
- uma busca sem resultado ou com falha apresentar o estado correspondente e
  permitir recuperação;
- a alternância de unidade atualizar todos os valores sem nova busca;
- o fluxo completo funcionar em viewport móvel suportada e em desktop.

## Non-Functional Requirements

### NFR01 - Responsividade

A interface deve funcionar em smartphones, tablets e desktops suportados sem
rolagem horizontal, sobreposição ou corte de conteúdo.

### NFR02 - Usabilidade

O fluxo deve ser simples e direto, com estados de vazio, carregamento, erro e
resultado claramente distinguíveis e mensagens em pt-BR compreensíveis para
usuários não técnicos.

### NFR03 - Acessibilidade

Os controles devem ser operáveis por teclado e toque, ter rótulos acessíveis e
contraste adequado. Informações meteorológicas devem ser comunicadas por texto
além de cor ou ícone.

### NFR04 - Desempenho percebido

O sistema deve fornecer feedback de carregamento imediatamente após o envio da
busca e renderizar o resultado assim que os dados estiverem disponíveis.

### NFR05 - Confiabilidade e recuperação

Timeouts, indisponibilidade e respostas inválidas da Open-Meteo devem ser
tratados sem quebrar a interface, com mensagem de erro e nova tentativa.

### NFR06 - Compatibilidade

O produto deve funcionar nas versões atuais dos principais navegadores modernos
em desktop e mobile.

### NFR07 - Segurança e privacidade

O produto não deve solicitar dados pessoais ou autenticação. Entradas de busca
devem ser tratadas como dados não confiáveis, e não devem existir credenciais
secretas expostas no cliente.

### NFR08 - Idioma

A interface, mensagens de erro, estados de carregamento e rótulos de controles
devem ser apresentados em português do Brasil.

## Edge Cases

- O campo de busca é enviado vazio ou contém apenas espaços.
- O nome informado contém acentos, diferenças de maiúsculas e minúsculas,
  hífens ou caracteres especiais.
- A busca retorna nenhuma cidade.
- A busca retorna várias cidades com o mesmo nome.
- A cidade selecionada não possui previsão completa para os cinco dias.
- A Open-Meteo retorna timeout, erro HTTP, JSON inválido ou campos ausentes.
- A resposta recebida pertence a uma consulta anterior que terminou depois de
  uma busca mais recente.
- O usuário altera a unidade repetidamente durante o carregamento dos dados.
- O usuário alterna a unidade antes de qualquer cidade ser selecionada.
- O arredondamento de uma conversão produz valores iguais ou negativos.
- O usuário inicia uma nova busca enquanto ainda visualiza o resultado anterior.
- A viewport móvel é muito estreita para exibir confortavelmente todos os
  elementos lado a lado.
- O dispositivo está offline no momento da busca.
- Um leitor de tela encontra um ícone meteorológico sem texto alternativo.

## Assumptions

- A Open-Meteo fornecerá geocodificação, clima atual e dados diários suficientes
  para hoje e os quatro dias seguintes.
- A Open-Meteo não exigirá API key para o escopo inicial, mas seus limites de
  uso e requisitos de atribuição serão confirmados antes da publicação.
- Celsius será usado como unidade inicial e a preferência será mantida apenas
  durante a sessão, não entre sessões.
- O usuário terá conexão com a internet para realizar novas consultas.
- A primeira versão será uma aplicação web responsiva, sem instalação nativa.
- Não haverá autenticação, histórico, favoritos ou persistência de servidor.
- O idioma inicial e único da interface será pt-BR.
- “Cinco dias” significa hoje mais quatro dias seguintes, e não cinco dias
  completos posteriores ao dia atual.
- O escopo inicial não inclui previsões horárias, mapas, alertas ou
  notificações meteorológicas.

## Risks

| Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- |
| Indisponibilidade, lentidão ou limite de uso da Open-Meteo | Alto | Média | Tratar timeout e erro, oferecer nova tentativa e monitorar falhas da integração. |
| Cidade ambígua ou entrada com erro | Médio | Alta | Exibir país, estado ou região e tratar ausência de resultados. |
| Dados divergentes ou desatualizados | Alto | Média | Validar o contrato da fonte e exibir horário de atualização quando disponível. |
| Conversão de unidade inconsistente | Médio | Média | Centralizar a unidade e validar conversões e renderização em todos os componentes. |
| Experiência inadequada em mobile | Alto | Média | Testar o fluxo em smartphones e tablets com teclado e toque. |
| Informações meteorológicas inacessíveis | Médio | Média | Complementar ícones com texto, garantir rótulos e validar contraste e teclado. |
| Escopo mal interpretado para cinco dias | Médio | Média | Aplicar explicitamente a regra hoje + quatro dias na especificação e nos testes. |

## Out of Scope

- Autenticação, cadastro e gerenciamento de perfil.
- Persistência de servidor, histórico, favoritos e consultas recentes entre
  sessões.
- Notificações, alertas meteorológicos e integração com calendário.
- Mapas, radar meteorológico e localização automática obrigatória do dispositivo.
- Previsão horária detalhada.
- Previsão além de cinco dias.
- Suporte inicial a idiomas diferentes de pt-BR.
- Aplicativos nativos para Android ou iOS.
- Operação offline garantida ou exibição de dados meteorológicos em cache.

## Open Questions

- Quais são os limites de uso, termos e requisitos de atribuição da Open-Meteo
  para publicação?
- A busca aceitará apenas nomes de cidades ou também bairros, códigos postais
  e coordenadas?
- A aplicação terá sugestões durante a digitação ou apenas resultados após o
  envio do formulário?
- Quais campos adicionais devem ser exibidos no clima atual, como sensação
  térmica, umidade, vento, precipitação e horário de atualização?
- Deve existir uma cidade padrão na primeira abertura? A localização do
  dispositivo será oferecida como recurso opcional?
- Quais navegadores, versões mínimas e tamanhos de tela serão oficialmente
  suportados?
- Existem requisitos específicos de identidade visual ou de conformidade com
  um padrão corporativo de acessibilidade?
- Quais métricas de produto definirão sucesso, além da conclusão do fluxo,
  como tempo até o resultado e taxa de buscas bem-sucedidas?