# Template: Modular Monolith

Estrutura padrão de organização de monólito modular.

## Estrutura de Pastas
* `src/modules/`: Diretório contendo módulos isolados por limites de contexto (ex: `billing`, `orders`, `catalog`).
* `src/shared/`: Utilidades lógicas compartilhadas que não pertencem a nenhum contexto específico.

## Regras de Acoplamento
Cada módulo sob `modules/` deve exportar uma interface de serviço pública. Nenhum módulo deve importar arquivos das subpastas internas de outro módulo.
