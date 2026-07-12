# Pattern: Event-Driven Architecture (EDA)

## Propósito
Comunicação assíncrona baseada na publicação de eventos de domínio que são consumidos por outros componentes do ecossistema.

## Vantagens
* Desacoplamento temporal e espacial completo.
* Alta resiliência frente a quedas temporárias de microsserviços.
* Excelente vazão de escrita.

## Desvantagens
* Complexidade no tracing distribuído e depuração de fluxos.
* Consistência eventual de dados.

## Quando usar vs Evitar
* **Usar**: Sistemas distribuídos de alta escala que exigem comunicação reativa assíncrona entre contextos delimitados.
* **Evitar**: Aplicações puramente CRUD simples onde respostas instantâneas síncronas são exigidas em todo lugar.
