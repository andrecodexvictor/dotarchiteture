# Methodology: Git Flow

## Objetivo
Modelo rígido de ramificação do Git projetado em torno do lançamento de releases de software de forma programada.

## Quando Aplicar
Aplicações herdadas (legacy), sistemas médicos ou financeiros onde os deploys são mensais/trimestrais e exigem auditoria rigorosa.

## Pré-requisitos
Definição clara de branches `main`, `develop`, `release/*`, `hotfix/*` e `feature/*`.

## Impacto na Arquitetura
Processos de build e deploy desacoplados e baseados em tags de versão semântica.

## Sinais de Adoção
Uso de comandos padronizados `git flow release start`.

## Incompatibilidades
SaaS web de alta evolução que exigem deploys contínuos dezenas de vezes ao dia.
