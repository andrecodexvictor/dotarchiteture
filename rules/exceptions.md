# Rules: Exceptions (Exceções de Padrão)

Guidelines for when it is acceptable to deviate from a recommended architectural style or pattern.

## Acceptable Exceptions

1. **Direct Database Queries for Complex Reports**:
   * *Rule*: Normally, presentation controllers query the database through application ports/repositories.
   * *Exception*: For heavy analytical queries or reports that are extremely slow to load through object mappings, controllers may bypass repositories and query SQL directly using optimized read replicas, provided the logic is kept inside a separate read-only adapter.

2. **Temporary Mock Adapters**:
   * *Rule*: Third-party integrations must use adapter files in `adapters/secondary`.
   * *Exception*: During local prototyping or offline development, developers may write temporary mock classes directly inside test folders.
