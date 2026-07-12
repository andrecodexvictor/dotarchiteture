# Methodology: Trunk-Based Development

## Objetivo
Prática de controle de versão onde todos os desenvolvedores mesclam suas alterações em um único ramo comum ("main"/"trunk") várias vezes ao dia.

## Quando Aplicar
Times maduros buscando velocidade máxima de entrega, integração contínua (CI) efetiva e redução de conflitos de merge.

## Pré-requisitos
* Pipeline de CI rápida (testes rodando em < 5 min).
* Uso rigoroso de Feature Flags para código incompleto.

## Impacto na Arquitetura
* Estimula design modular e uso de feature toggles no código.

## Sinais de Adoção
* Pull Requests abertos e fechados em menos de 1 dia.
* Ausência de branches de feature de vida longa (> 2 dias).

## Incompatibilidades
Times com processos manuais de QA rígidos, ou onde revisões de código por pares levam dias para aprovação.
