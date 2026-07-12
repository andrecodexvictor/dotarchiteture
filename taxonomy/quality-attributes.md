# Taxonomy: Quality Attributes

Quality attributes (architectural -ilities) define requirements for software operation and evolution.

## System Quality Attributes

### Scalability (Escalabilidade)
The capacity of the system to handle growing volumes of requests or data without performance degradation. Otimizado por réplicas de leitura, CQRS, mensageria.

### Maintainability (Manutenibilidade)
The ease with which software can be understood, corrected, adapted, and extended. Otimizado por Hexagonal, DDD, e testes automatizados.

### Resiliency (Resiliência)
The ability of the system to recover from failures (network drops, database outages). Otimizado por Circuit Breakers, Retry policies, Saga, Mensageria.

### Portability (Portabilidade)
The ease of running the system in different environments (cloud providers, local, containers). Otimizado por Docker, interfaces abstratas.

### Security (Segurança)
Protection of system data and endpoints from unauthorized access. Otimizado por criptografia, logs imutáveis, auth patterns.

### Cost Efficiency (Eficiência de Custo)
Minimizing server and license costs relative to traffic demands. Monólitos e Serverless costumam ser eficientes para baixa escala.
