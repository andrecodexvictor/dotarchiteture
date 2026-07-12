# Pattern: Serverless Architecture

## Propósito
Execução de lógica de negócio sob demanda em runtimes totalmente gerenciados (FaaS) que escalam automaticamente a zero.

## Vantagens
* Custos proporcionais ao uso real (escala para zero).
* Zero gerenciamento de servidores/VMs.
* Escalabilidade automática rápida.

## Desvantagens
* Latência de cold starts.
* Risco de lock-in com provedor de nuvem.

## Quando usar vs Evitar
* **Usar**: APIs com tráfego flutuante, tarefas em lote (cron jobs), automações assíncronas.
* **Evitar**: Aplicações com tráfego constante de alta vazão onde VMs tradicionais seriam mais baratas.
