# False Positive Patterns in Active Verification

Registro de falsos positivos reportados durante a execução de `dotarchitecture verify`.

## Padrões Conhecidos de Falso Positivo

1. **Importações de Tipos em TypeScript (`import type ...`)**:
   * *Sintoma*: O scanner de código acusa que o arquivo do domínio está importando um adaptador apenas por importar o seu tipo para fins de tipagem de dados.
   * *Solução*: O validador do CLI deve ignorar linhas contendo `import type`.

2. **Arquivos de Configuração do framework**:
   * *Sintoma*: Arquivos como `main.ts` ou arquivos de inicialização do NestJS importam domínio e infra ao mesmo tempo, gerando avisos de cruzamento de limites.
   * *Solução*: Excluir arquivos de bootstrap/ignorar na verificação de drifts.
