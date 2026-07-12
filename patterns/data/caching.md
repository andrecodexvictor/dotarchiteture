# Data Pattern: Caching

## Propósito
Armazenar temporariamente dados calculados ou recuperados em memória rápida (Redis, Memcached) para reduzir tempos de acesso futuros.

## Estratégias
* **Cache-Aside**: A aplicação tenta ler do cache. Se falhar, busca na DB e salva no cache.
* **Write-Through**: Grava no cache e na DB simultaneamente.
* **Write-Behind (Write-Back)**: Grava apenas no cache e sincroniza assincronamente com o banco.
