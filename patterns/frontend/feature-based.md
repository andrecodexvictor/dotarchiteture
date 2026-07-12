# Frontend Pattern: Feature-based Structure

## Propósito
Organiza componentes, hooks, estados e utilitários de um projeto frontend por feature (funcionalidade de negócio), em vez de por tipo técnico de arquivo.

## Estrutura
```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   └── billing/
```

## Quando usar
* Projetos de médio/grande porte com React/Vue/NextJS para manter arquivos de uma mesma funcionalidade fisicamente próximos.
