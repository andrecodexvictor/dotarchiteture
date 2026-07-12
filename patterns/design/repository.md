# Design Pattern: Repository

## Propósito
Isola a lógica de persistência e acesso a dados das regras de negócio do domínio por meio de uma interface abstrata orientada a coleção.

## Vantagens
* Permite alterar o mecanismo físico de persistência (SQL, NoSQL, in-memory) sem alterar os casos de uso.
* Facilita a escrita de testes unitários através do uso de mocks.

## Quando usar
* Obrigatório em Clean e Hexagonal Architecture para acesso ao banco de dados.
