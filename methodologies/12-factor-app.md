# Methodology: 12-Factor App

## Objetivo
Metodologia para construção de aplicativos baseados em software como serviço (SaaS) que sejam portáveis, resilientes e escaláveis na nuvem.

## Quando Aplicar
Projetos SaaS implantados em ambientes de contêineres ou plataformas serverless.

## Pré-requisitos
* Uso de Docker para isolar dependências.
* Variáveis de ambiente usadas para configurações externas.

## Impacto na Arquitetura
* Processos de execução totalmente stateless (armazenamento persistente delegado a serviços de apoio/banco de dados).
* Logs tratados como fluxos de eventos contínuos.

## Sinais de Adoção
* Ausência de arquivos `.env` ou chaves de API commitadas no repositório.
* Aplicação inicializa rapidamente em qualquer máquina com um único comando Docker.

## Incompatibilidades
Aplicativos desktop de execução offline pura.
