# Design Pattern: Adapter

## Propósito
Permite que objetos com interfaces incompatíveis colaborem entre si atuando como tradutor de chamadas.

## Quando usar
* Quando você deseja usar uma classe existente (ex: SDK de terceiros), mas a interface dela não corresponde ao contrato esperado pelo seu sistema.
* Essencial em arquitetura hexagonal para implementar portas de saída (driven adapters).
