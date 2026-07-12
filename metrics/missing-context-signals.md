# Missing Context Signals

Sinais de contexto ausentes no YAML que impedem recomendações totalmente precisas.

## Indicadores de Contexto Insuficiente

1. **Stack Tecnológica Genérica**:
   * Quando o usuário declara apenas `typescript` no target stack sem especificar o framework (NestJS, Express, etc.), a engine falha em recomendar estruturas de pastas exatas.

2. **Falta de Dados de Escalabilidade**:
   * Omissão do parâmetro `scale` ou `availability` força a engine a assumir os padrões mínimos seguros de monólito simples.
