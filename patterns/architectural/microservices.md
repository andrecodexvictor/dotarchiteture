# Pattern: Microservices (Microsserviços)

## Propósito
Decomposição do sistema em múltiplos serviços pequenos e independentes, cada um com seu próprio ciclo de deploy e banco de dados.

## Vantagens
* Desacoplamento físico e autonomia total de deploys por time.
* Flexibilidade de stack tecnológica por serviço.
* Escalabilidade granular (escalar apenas os gargalos).

## Desvantagens
* Altíssima complexidade operacional (Kubernetes, logs distribuídos, redes).
* Dificuldade em garantir consistência de dados (necessita de transações distribuídas/Sagas).

## Quando usar vs Evitar
* **Usar**: Times grandes (>= 15 desenvolvedores) divididos em múltiplos contextos independentes e escala física massiva.
* **Evitar**: Times pequenos ou startups sem time de infra/plataforma dedicado.
