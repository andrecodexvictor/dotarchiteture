# REVIEW-CHECKLIST: Revisão de Decisões e Padrões

Checklist de revisão periódica de governança arquitetural do repositório.

## Itens de Revisão

- [ ] Os limites entre os módulos lógicos ou físicos recomendados pela engine continuam sendo respeitados nos commits recentes?
- [ ] Novas dependências ou bibliotecas introduzidas quebram as regras de isolamento definidas em `rules/invariants.yaml`?
- [ ] As recomendações geradas no `./docs/adr/` estão atualizadas e refletem o estado real do projeto em produção?
- [ ] É necessário ajustar os pesos ou limiares de decisão de `rules/scoring-matrix.yaml`?
- [ ] Os novos desenvolvedores e agentes integrados ao repositório leram e compreenderam o playbook sob `.architecture/README.md`?
