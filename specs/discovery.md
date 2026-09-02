# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação web de previsão do tempo para que usuários
consultem rapidamente as condições meteorológicas de cidades de seu interesse.
O produto deve atender consultas pontuais e oferecer uma visão dos próximos
cinco dias, com suporte às unidades Celsius e Fahrenheit e uso adequado em
dispositivos móveis.

O fluxo principal esperado é:

1. O usuário informa o nome de uma cidade.
2. A aplicação encontra e apresenta a cidade selecionada.
3. A aplicação exibe o clima atual e a previsão de cinco dias.
4. O usuário alterna a unidade de temperatura conforme sua preferência.

O valor do produto está em oferecer uma consulta simples, rápida e
compreensível, sem exigir cadastro ou conhecimento técnico.

## Requisitos Funcionais

### RF01 - Buscar cidades

O usuário deve poder pesquisar cidades pelo nome por meio de um campo de busca
acessível em desktop e dispositivos móveis.

### RF02 - Desambiguar resultados

Quando houver mais de uma cidade com o mesmo nome, a aplicação deve apresentar
informações como país, estado ou região para que o usuário selecione a opção
correta.

### RF03 - Tratar estados da busca

A aplicação deve informar claramente os estados de carregamento, nenhum
resultado encontrado e falha na consulta dos dados.

### RF04 - Exibir clima atual

Após a seleção de uma cidade válida, a aplicação deve exibir, no mínimo:

- nome da cidade e sua localização;
- temperatura atual;
- condição meteorológica em texto ou ícone acompanhado de texto;
- unidade de temperatura utilizada.

### RF05 - Exibir previsão de cinco dias

A aplicação deve apresentar a previsão para cinco dias, organizada por dia e
contendo, no mínimo, a condição meteorológica e as temperaturas mínima e
máxima.

### RF06 - Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius (°C) e Fahrenheit (°F). As
temperaturas exibidas devem ser atualizadas para a unidade escolhida sem exigir
uma nova busca.

### RF07 - Aplicar unidade selecionada

A unidade escolhida deve ser aplicada de maneira consistente ao clima atual e a
todos os dias da previsão, permanecendo ativa durante a sessão até nova
alteração do usuário.

### RF08 - Realizar novas consultas

O usuário deve poder buscar outra cidade sem recarregar a página, substituindo
os dados exibidos pela nova consulta.

### RF09 - Disponibilizar o fluxo em dispositivos móveis

Os recursos essenciais de busca, consulta do clima e alternância de unidade
devem estar disponíveis em smartphones e tablets, com controles adequados para
interação por toque.

## Requisitos Não-Funcionais

### RNF01 - Responsividade

A interface deve se adaptar a smartphones, tablets e desktops, sem rolagem
horizontal nem sobreposição de conteúdo nos tamanhos de tela suportados.

### RNF02 - Usabilidade

O fluxo de busca e consulta deve ser simples e direto. Os estados de vazio,
carregamento, erro e resultado devem ser visualmente distinguíveis e descritos
em linguagem compreensível para pessoas não técnicas.

### RNF03 - Acessibilidade

Os controles devem ser operáveis por teclado e toque, possuir rótulos
acessíveis e apresentar contraste adequado. As condições meteorológicas não
devem ser comunicadas apenas por cor ou apenas por ícone.

### RNF04 - Desempenho percebido

Após o envio de uma busca, a aplicação deve fornecer feedback imediato e
apresentar os dados assim que estiverem disponíveis, sem bloquear a interface
além do necessário.

### RNF05 - Confiabilidade

Indisponibilidade, timeout ou resposta inválida da fonte de dados não devem
quebrar a interface. O usuário deve receber uma mensagem de erro e uma opção
para tentar novamente.

### RNF06 - Compatibilidade

A aplicação deve funcionar nas versões atuais dos principais navegadores
modernos em desktop e mobile.

### RNF07 - Segurança e privacidade

O produto não deve exigir dados pessoais para a consulta. Entradas do usuário
devem ser tratadas como dados não confiáveis, e credenciais de integrações
externas não devem ser expostas no cliente.

## Riscos

| Risco | Impacto | Probabilidade | Mitigação inicial |
| --- | --- | --- | --- |
| Fonte de dados indisponível, lenta ou com limite de uso | Alto | Média | Exibir carregamento e erro, permitir nova tentativa e monitorar falhas da integração. |
| Cidade ambígua ou digitada com erro | Médio | Alta | Apresentar país ou região, sugestões e estado de nenhum resultado. |
| Dados meteorológicos divergentes ou desatualizados | Alto | Média | Escolher fonte confiável, validar o contrato de dados e exibir o horário da atualização. |
| Interface inadequada em telas pequenas | Alto | Média | Priorizar o fluxo mobile e testar diferentes larguras e interações por toque. |
| Conversão de unidade inconsistente | Médio | Média | Centralizar a unidade selecionada e testar conversão e renderização dos componentes. |
| Condições comunicadas somente por cor ou símbolo | Médio | Média | Exibir texto complementar e validar contraste, teclado e leitores de tela. |
| Expectativa de previsão superior a cinco dias | Baixo | Média | Comunicar claramente o horizonte de cinco dias na interface. |

## Perguntas em Aberto

1. Qual fonte de dados meteorológicos será utilizada e quais são seus limites,
   termos de uso e requisitos de atribuição?
2. A busca aceitará somente cidades ou também bairros, códigos postais e
   coordenadas?
3. A aplicação deve sugerir cidades durante a digitação ou buscar somente após
   o envio do formulário?
4. Como o usuário deverá escolher entre cidades com o mesmo nome?
5. A previsão de cinco dias inclui o dia atual ou representa os cinco dias
   completos seguintes?
6. Quais informações adicionais do clima atual são necessárias, como sensação
   térmica, umidade, vento, precipitação e horário de atualização?
7. A unidade escolhida deve ser preservada entre sessões ou somente durante a
   sessão atual?
8. Deve existir uma cidade padrão na primeira abertura, por localização do
   dispositivo ou por configuração definida pela empresa?
9. A localização geográfica do dispositivo será solicitada? Se sim, o recurso
   será obrigatório ou opcional?
10. É necessário manter histórico, favoritos ou consultas recentes?
11. Quais navegadores, versões mínimas e tamanhos de tela serão oficialmente
    suportados?
12. Existem requisitos de identidade visual, idiomas adicionais ou conformidade
    com um padrão corporativo de acessibilidade?
13. A aplicação precisa oferecer comportamento offline ou cache da última
    consulta conhecida?
14. Quais métricas definirão sucesso, como tempo até o resultado, taxa de busca
    bem-sucedida e uso em dispositivos móveis?

## Suposições

1. A primeira versão será uma aplicação web responsiva, sem necessidade de
   instalação nativa.
2. O usuário poderá consultar o clima sem criar conta ou fazer login.
3. Uma integração externa fornecerá geocodificação e dados de previsão.
4. A busca será baseada principalmente no nome da cidade e poderá exigir
   seleção quando houver resultados ambíguos.
5. A fonte de dados fornecerá clima atual e previsão de cinco dias para a
   cidade selecionada.
6. A alternância entre Celsius e Fahrenheit ocorrerá sem nova busca, quando os
   dados disponíveis permitirem a conversão local.
7. Celsius será a unidade inicial padrão, até que o negócio defina outra regra.
8. O idioma inicial da interface será português do Brasil.
9. Novas consultas dependerão de conexão com a internet.
10. Não farão parte da primeira versão notificações, alertas meteorológicos,
    mapas, autenticação, favoritos ou histórico persistente.
11. O escopo de cinco dias não inclui previsões horárias detalhadas.
12. A interface sempre apresentará feedback para carregamento, erro, ausência
    de resultados e ausência de uma cidade selecionada.

## Personas e Objetivos

### Persona 1 - Mariana, a profissional em deslocamento

- **Perfil:** 32 anos, trabalha em escritório e se desloca diariamente pela
   cidade.
- **Objetivo principal:** Ver rapidamente se precisa levar guarda-chuva ou
   adaptar sua roupa e transporte.
- **Contexto de uso:** Principalmente em dispositivos móveis, pela manhã ou
   antes de sair de casa.
- **Métrica de sucesso:** Consultar o clima atual e a previsão dos próximos
   dias em poucos segundos, sem precisar repetir a busca.

### Persona 2 - Carlos, o planejador de atividades ao ar livre

- **Perfil:** 45 anos, organiza caminhadas, passeios e atividades familiares
   nos fins de semana.
- **Objetivo principal:** Comparar a previsão de cinco dias para escolher a
   melhor data para suas atividades.
- **Contexto de uso:** Desktop para planejar com mais calma e mobile para
   acompanhar mudanças durante o deslocamento.
- **Métrica de sucesso:** Encontrar uma cidade e avaliar claramente as
   temperaturas mínima e máxima e as condições meteorológicas dos cinco dias.

### Persona 3 - Ana, a usuária internacional

- **Perfil:** 28 anos, viaja ou trabalha com pessoas de diferentes países.
- **Objetivo principal:** Consultar o clima de cidades nacionais e
   internacionais usando a unidade de temperatura com que está familiarizada.
- **Contexto de uso:** Principalmente em dispositivos móveis durante viagens,
   com possível uso ocasional em desktop.
- **Métrica de sucesso:** Localizar corretamente a cidade desejada e alternar
   entre Celsius e Fahrenheit sem realizar uma nova busca.

## Decisões

### D01 - Fonte de dados: Open-Meteo

- **Decisão:** Utilizar a Open-Meteo como fonte de geocodificação e dados
   meteorológicos, sem exigir API key.
- **Justificativa:** A fonte atende ao escopo inicial sem custo de credencial
   nem necessidade de gerenciar uma chave no cliente.
- **Perguntas resolvidas:** Define a fonte de dados, respondendo à pergunta 1
   sobre integração, limites e credenciais. Os limites de uso, termos e
   requisitos de atribuição da Open-Meteo ainda devem ser confirmados antes da
   publicação.

### D02 - Definição de cinco dias

- **Decisão:** “Previsão de 5 dias” significa o dia atual mais os quatro dias
   seguintes.
- **Justificativa:** Estabelece um horizonte objetivo e mantém o resultado
   alinhado à expectativa de uma consulta de curto prazo.
- **Perguntas resolvidas:** Responde à pergunta 5 sobre a inclusão do dia atual
   na previsão.

### D03 - Unidade padrão: Celsius

- **Decisão:** Exibir temperaturas em Celsius (°C) por padrão.
- **Justificativa:** É a unidade mais adequada ao público inicial definido para
   a interface em português do Brasil, mantendo Fahrenheit disponível por meio
   do controle de alternância.
- **Perguntas resolvidas:** Responde à parte da pergunta 7 relacionada à
   unidade inicial. A persistência da preferência entre sessões continua fora
   desta decisão.

### D04 - Sem autenticação e sem persistência de servidor

- **Decisão:** Permitir consultas sem cadastro ou login e não persistir dados
   de usuários ou consultas em servidor.
- **Justificativa:** Reduz o atrito no fluxo principal e o escopo de segurança,
   privacidade e infraestrutura da primeira versão.
- **Perguntas resolvidas:** Responde à pergunta 10 sobre histórico e favoritos
   persistentes e confirma que autenticação não faz parte do escopo inicial.
   Histórico, favoritos e consultas recentes não serão mantidos entre sessões.

### D05 - Idioma da interface: pt-BR

- **Decisão:** Adotar português do Brasil como idioma inicial e único da
   interface.
- **Justificativa:** Alinha a experiência ao público inicial e evita ampliar o
   escopo de localização antes de validar o produto.
- **Perguntas resolvidas:** Responde à pergunta 12 sobre idioma inicial.
   Outros idiomas poderão ser avaliados posteriormente, caso exista demanda.