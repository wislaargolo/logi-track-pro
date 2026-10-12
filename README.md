# LogiTrack Pro

MVP do desafio técnico LogAp para agendamento de manutenções de uma frota e acompanhamento de  métricas

## O que foi entregue

- CRUD de manutenções com veículo, datas, tipo de serviço, custo estimado, status e observação opcional
- Dashboard com as cinco métricas exigidas, calculadas no banco: quilometragem total, viagens por categoria (leve/pesado), próximas cinco manutenções, ranking por utilização e custo estimado do mês atual
- Autenticação JWT, paginação, filtros e interface responsiva

## Arquitetura e decisões

O projeto é um monorepo organizado como um monólito modular:

- **Backend:** Java 21, Spring Boot, Spring Web MVC, Spring Data JPA, Spring Security, Auth0 Java JWT, Flyway e Springdoc OpenAPI
- **Frontend:** Angular 22, Angular Material, NgRx Signals, RxJS, TypeScript, ESLint e Prettier
- **Infraestrutura:** PostgreSQL 17, Docker Compose, imagens multi-stage e Nginx para a SPA

## Estrutura do projeto

Os diretórios principais estão organizados assim:

```text
.
├── frontend/
│   ├── src/app/core/                 HTTP, autenticação e recursos compartilhados da aplicação
│   ├── src/app/features/
│   │   ├── auth/                     Login e estado da sessão
│   │   ├── dashboard/                Indicadores e página inicial
│   │   ├── maintenance/             Lista, filtros, formulário e detalhes
│   │   └── vehicles/                 Busca de veículos para os formulários
│   ├── src/app/shared/               Pipes, utilitários e estado reutilizável
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/main/java/br/com/logitrack/
│   │   ├── config/                   Segurança, propriedades e configuração da aplicação
│   │   ├── controller/               Endpoints REST
│   │   ├── dto/                      Contratos de entrada e saída da API
│   │   ├── entity/                   Entidades JPA e tipos do domínio
│   │   ├── exception/                Exceções e handlers HTTP
│   │   ├── mapper/                   Conversão entre entidades e DTOs
│   │   ├── repository/               Persistência, Specifications e projeções
│   │   └── service/                  Regras de negócio
│   ├── src/main/resources/
│   │   ├── db/migration/             Migrações versionadas do Flyway
│   │   └── application*.yml          Configurações por ambiente
│   ├── Dockerfile
│   └── pom.xml
├── infra/sql/source/                 SQL base fornecido no desafio
├── docker-compose.yml                Frontend, backend e PostgreSQL
├── package.json                      Scripts do monorepo para o frontend
├── .env.example                      Modelo das variáveis locais
└── README.md
```

Decisões mais importantes:

- **`serviceType` como texto, não enum:** consideramos usar enum, mas o schema fornecido define `tipo_servico` como `VARCHAR(100)` e já possui descrições textuais. Manter o campo como texto evita conversões e migrações desnecessárias, preserva a compatibilidade com o SQL original e mantém `serviceType` estável na API

- **Paginação e filtros:** a API usa `Pageable`; Specifications produzem os predicados e a consulta mantém a ordenação, evitando lógica duplicada
- **Banco:** Flyway controla as migrações e o Hibernate usa `ddl-auto=validate`, mantendo as alterações versionadas e evitando mudanças automáticas no schema
- **`TripEntity` sem repository ou service:** a entidade mantém o mapeamento da tabela legada `viagens` para que o Hibernate valide suas colunas com `ddl-auto=validate`

- **Autenticação e documentação:** o MVP usa JWT stateless; Swagger/OpenAPI são públicos para facilitar a integração, enquanto os endpoints de negócio continuam protegidos

## Execução com Docker — passo a passo

### 1. Pré-requisitos

- Docker Engine com Docker Compose;
- Git;
- Java 21 e Node.js 22/npm 11 apenas se optar pela execução fora dos containers

### 2. Criar o `.env`

Na raiz do projeto, copie o modelo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `.env` e defina:

```dotenv
AUTH_JWT_SECRET=<segredo-Base64-com-pelo-menos-32-bytes-decodificados>
AUTH_BOOTSTRAP_ENABLED=true
AUTH_BOOTSTRAP_NAME=<nome-do-usuario-inicial>
AUTH_BOOTSTRAP_EMAIL=<email-do-usuario-inicial>
AUTH_BOOTSTRAP_PASSWORD=<senha-do-usuario-inicial>
```

Os demais valores já possuem defaults locais no `.env.example`. Altere `POSTGRES_*`, `DB_PORT`, `API_PORT`, `FRONTEND_PORT` ou `AUTH_JWT_TTL` somente se necessário. O `.env` é local e ignorado pelo Git; não use esses valores em produção.

### 3. Subir a aplicação

Ainda na raiz:

```bash
docker compose --env-file .env up --build -d --wait
docker compose ps
```

O comando constrói frontend/backend, inicia PostgreSQL, executa as migrações Flyway e aguarda os healthchecks.

### 4. Acessar e autenticar

- Frontend: [http://localhost:4200](http://localhost:4200)
- Health check: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- OpenAPI: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

Na tela de login, use o email e a senha definidos em `AUTH_BOOTSTRAP_EMAIL` e `AUTH_BOOTSTRAP_PASSWORD`. O usuário inicial é criado apenas quando habilitado e quando ainda não existe.

### 5. Parar ou recriar o ambiente

Para parar sem apagar o banco:

```bash
docker compose down
```

Para apagar o volume e recriar todos os dados:

```bash
docker compose down -v
docker compose --env-file .env up --build -d --wait
```

## Execução local alternativa

Use esta opção somente quando não quiser executar o frontend em container. **Todos os comandos abaixo devem ser executados a partir da raiz do repositório**, na pasta `logi-track-pro`.

### Terminal 1 — dependências e banco

Na raiz do projeto, instale as dependências do frontend e suba somente o PostgreSQL pelo Docker Compose.

No Git Bash/Linux/macOS:

```bash
npm ci --include=dev
docker compose --env-file .env up -d --wait database
```

No Windows PowerShell, use `npm.cmd` para evitar o bloqueio do arquivo `npm.ps1` pela política de execução de scripts:

```powershell
npm.cmd ci --include=dev
docker compose --env-file .env up -d --wait database
```

Mantenha o container do banco em execução. O `POSTGRES_PASSWORD` só é aplicado quando o volume PostgreSQL é criado pela primeira vez. Se o volume já existia com outra senha, alterar o `.env` não altera a senha gravada no banco.

Se os dados locais puderem ser descartados, recrie o volume a partir da raiz:

```powershell
docker compose --env-file .env down -v
docker compose --env-file .env up -d --wait database
```

O comando `down -v` apaga os dados do banco. Para preservá-los, use a senha original do volume ou faça a redefinição do usuário PostgreSQL sem removê-lo.

### Terminal 2 — backend

Abra um segundo terminal e volte para a raiz do projeto `logi-track-pro`.

O arquivo `.env` é carregado pelo Docker Compose, mas não pelo Maven/Spring Boot automaticamente. Antes de iniciar o backend local, configure as variáveis com os mesmos valores usados pelo banco e pela autenticação.

No Windows PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/<nome-do-banco>"
$env:DB_USERNAME = "<usuario-do-banco>"
$env:DB_PASSWORD = "<mesma-senha-de-POSTGRES_PASSWORD-no-.env>"
$env:AUTH_JWT_SECRET = "<mesmo-valor-de-AUTH_JWT_SECRET-no-.env>"
```

No Git Bash/Linux/macOS:

```bash
export DB_URL="jdbc:postgresql://localhost:5432/<nome-do-banco>"
export DB_USERNAME="<usuario-do-banco>"
export DB_PASSWORD="<mesma-senha-de-POSTGRES_PASSWORD-no-.env>"
export AUTH_JWT_SECRET="<mesmo-valor-de-AUTH_JWT_SECRET-no-.env>"
```

No Git Bash/Linux/macOS:

```bash
./mvnw -pl backend spring-boot:run
```

No Windows PowerShell:

```powershell
.\mvnw.cmd -pl backend spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

### Terminal 3 — frontend

Abra um terceiro terminal, também na raiz do projeto `logi-track-pro`.

No Git Bash/Linux/macOS:

```bash
npm run frontend:start
```

No Windows PowerShell:

```powershell
npm.cmd run frontend:start
```

Acesse o frontend em [http://localhost:4200](http://localhost:4200). O proxy de desenvolvimento encaminha as requisições `/api` para `http://127.0.0.1:8080`.

## Banco de dados e scripts

O SQL base permanece em [`infra/sql/source/Desafio LogAp - Carga Inicial.sql`](infra/sql/source/Desafio%20LogAp%20-%20Carga%20Inicial.sql) e é aplicado pela V1 sem alterar o schema fornecido. As mudanças necessárias ao MVP são versionadas e justificadas assim:

- [`V2__dashboard_indexes.sql`](backend/src/main/resources/db/migration/V2__dashboard_indexes.sql): índices para reduzir o custo das consultas do Dashboard e dos filtros
- [`V3__maintenance_observation.sql`](backend/src/main/resources/db/migration/V3__maintenance_observation.sql): adiciona `observacao VARCHAR(1000)`, requisito adicional do formulário
- [`V4__dashboard_demo_data.sql`](backend/src/main/resources/db/migration/V4__dashboard_demo_data.sql): dados demonstrativos para validar as métricas sem modificar a carga original
- [`V5__users.sql`](backend/src/main/resources/db/migration/V5__users.sql): tabela de usuários e credenciais necessárias ao JWT

## Verificação

No Windows PowerShell, use `npm.cmd` no lugar de `npm` nos comandos do frontend.

```bash
./mvnw -pl backend -am clean verify
npm run frontend:build
npm run frontend:lint
npm run frontend:format:check
git diff --check
```

A verificação atual cobre compilação, Checkstyle, Spotless, ESLint e Prettier; não há testes automatizados versionados.

## Demonstração

- [Login](docs/screenshots/01-login.png)
- [Dashboard](docs/screenshots/02-dashboard.png)
- [Lista](docs/screenshots/03-maintenance-list.png)
- [Filtros](docs/screenshots/04-maintenance-filters.png)
- [Criação](docs/screenshots/05-maintenance-form.png)
- [Detalhes](docs/screenshots/06-maintenance-detail.png)
-  [Edição](docs/screenshots/07-maintenance-edit.png)