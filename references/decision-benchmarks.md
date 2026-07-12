# Decision Benchmarks

Benchmarks comparativos para decisões comuns.

## Monólito Modular vs Microsserviços

| Critério | Monólito Modular | Microsserviços |
| :--- | :--- | :--- |
| **Complexidade Infra** | Baixa (deploy único) | Altíssima (orquestração de rede) |
| **Isolamento de Dados** | Lógico (namespaces/esquemas) | Físico (bancos separados) |
| **Confiabilidade Rede** | Sem chamadas remotas de rede | Múltiplas barreiras de rede |
| **Autonomia de Time** | Média (fila de release única) | Alta (independência de deploys) |

## Hexagonal vs MVC

* **Hexagonal**: Ideal para regras de domínio ricas e mutáveis. Alto boilerplate inicial.
* **MVC**: Excelente para APIs de acesso a dados simples (CRUD). Difícil de testar sem banco físico.
