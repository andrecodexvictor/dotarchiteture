# Rules: Architectural Invariants (Princípios Invariantes)

Estes são os princípios estruturais que nunca devem ser violados pelos desenvolvedores ou agentes de IA neste repositório.

## Invariantes Estritos

1. **Direção Única da Dependência**:
   * Camadas internas (Core/Domain) nunca devem importar ou depender de camadas externas (Adapters/Infrastructure/Presentation).
   
2. **Isolamento de Persistência**:
   * O domínio não deve conhecer detalhes sobre mecanismos físicos de salvamento (ex: SQL, Prisma, TypeORM). O domínio define apenas interfaces abstratas (ports).

3. **Validação Ativa**:
   * O commit de código que introduz drift de estrutura (pastas inesperadas) ou violação de importação deve ser rejeitado no pipeline de CI.
