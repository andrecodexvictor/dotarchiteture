# Anti-Pattern: Shared Database (Banco de Dados Compartilhado)

## Sintomas
Múltiplos microsserviços lendo e escrevendo diretamente nas mesmas tabelas de um banco de dados unificado.

## Consequências
* Bloqueios frequentes de deploy por quebra de esquemas.
* Acoplamento físico no nível de persistência, violando o isolamento do domínio.

## Como evitar
* Cada microsserviço deve possuir e controlar de forma exclusiva o seu banco de dados. Compartilhamento de dados apenas por APIs ou Eventos.
