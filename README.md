# CoreSync CRM

Bem-vindo ao **CoreSync CRM**, uma plataforma SaaS Multi-Tenant corporativa (B2B).

## 🚀 Arquitetura e Escopo
Este projeto baseia-se em uma arquitetura **Multi-Tenant**, onde todos os dados de usuários e operações de negócio pertencem a uma entidade corporativa (`Company`). Esta abordagem garante um alto nível de isolamento lógico de dados para aplicações SaaS B2B.

A stack tecnológica inicial compreende:
- **Java 21**
- **Spring Boot 3.x**
- **Spring Security** (Baseado em tokens Stateless / JWT para a evolução REST)
- **Spring Data JPA**
- **Banco de Dados**: H2 (In Memory) para testes rápidos e desenvolvimento.
- **Lombok** e **JJWT** para redução de boilerplate e gestão de tokens.

## 🏢 Entidades Core
- **Company**: Representa o inquilino (tenant) com `id` (UUID), `name`, e `cnpj`.
- **User**: Representa o operador do sistema, que obrigatoriamente pertence a uma `Company`. Possui papéis definidos (`ADMIN`, `MANAGER`, `SELLER`).

## 🔑 Acesso Rápido e Testes
Durante a inicialização do sistema, um `DataInitializer` automaticamente prepara a base de dados em memória para que você e sua equipe não precisem criar usuários manualmente toda vez.

As seguintes credenciais padrão são geradas:

| Empresa | Email de Acesso | Senha | Papel (Role) |
| --- | --- | --- | --- |
| **Empresa Alpha** | `admin@alpha.com` | `123` | `ADMIN` |
| **Empresa Beta** | `admin@beta.com` | `123` | `ADMIN` |

### 🛠️ Console H2
Para verificar o banco de dados diretamente:
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:coresyncdb`
- **User Name**: `sa`
- **Password**: *(em branco)*

O Spring Security já está configurado para não bloquear o path do `/h2-console`, e o cabeçalho X-Frame-Options foi desabilitado.

## Fases Concluídas
- [x] **Fase 1**: O Esqueleto Corporativo (Spring Boot, Pom, Application.yml)
- [x] **Fase 2**: A Modelagem Multi-Tenant (Company, User, Role)
- [x] **Fase 3**: O Cérebro da Segurança Base (Spring Security, Repositories, Data Initializer)
- [x] **Fase 4**: A Bíblia do CRM (Este README)
- [x] **Fase 5**: O Motor JWT (Geração de Passaportes)
- [x] **Fase 6**: O Filtro e o Tenant Context (ThreadLocal)
- [x] **Fase 7**: A Rota de Login (`/api/auth/login`)
- [x] **Fase 8**: Atualização da Documentação

## 🔒 Motor de Autenticação JWT e TenantContext
Este SaaS B2B utiliza **JWT (JSON Web Tokens)** não apenas para login, mas como o verdadeiro *Passaporte do Inquilino*. Todo token emitido para um usuário possui o `companyId` embutido como um claim extra. 

Quando uma requisição atinge a API:
1. O `JwtAuthenticationFilter` intercepta o Header `Authorization`.
2. O JWT é decodificado e validado.
3. O `companyId` é extraído e injetado no **`TenantContext`** (que usa `ThreadLocal` para manter os dados seguros e isolados na Thread da requisição atual).
4. Em qualquer lugar do sistema, a aplicação pode chamar `TenantContext.getTenantId()` e saber exatamente a qual empresa a requisição atual pertence, sem precisar passar variáveis gigantes pelas assinaturas de método.

## 🛡️ Prova de Fogo: Isolamento Multi-Tenant

Para provar que o **TenantContext** é impenetrável, criamos o módulo de **Leads** (Funil de Vendas). Ao cadastrar um Lead, a API **nunca** pede o ID da Empresa; ela descobre sozinha através do Token JWT (Passaporte) e salva o Lead atrelado exclusivamente àquele inquilino. Na listagem, apenas Leads da própria empresa são retornados.

### Passo a Passo (Prova de Isolamento via cURL):

**1. Logar na Empresa Alpha e Guardar o Token:**
```bash
# Pegue o token gerado por este comando:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com", "password":"123"}'
```

**2. Criar um Lead para a Empresa Alpha:**
```bash
# Substitua MEU_TOKEN_ALPHA pelo token recebido no passo 1
curl -X POST http://localhost:8080/api/leads \
  -H "Authorization: Bearer MEU_TOKEN_ALPHA" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Gigante Alpha", "email":"contato@gigante.com", "phone":"9999-8888", "status":"NEW"}'
```

**3. Logar na Empresa Beta:**
```bash
# Pegue o token da Empresa Beta:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beta.com", "password":"123"}'
```

**4. Listar os Leads (Logado como Empresa Beta):**
```bash
# Substitua MEU_TOKEN_BETA pelo token recebido no passo 3
curl -X GET http://localhost:8080/api/leads \
  -H "Authorization: Bearer MEU_TOKEN_BETA"
```
*O resultado será `[]` (Vazio). A Empresa Beta não faz ideia de que o Lead da Empresa Alpha existe. O isolamento lógico foi um sucesso absoluto!*

## 👁️ O Cofre de Auditoria (Spring AOP)
Para não poluir os serviços de negócio (LeadService) com códigos chatos de salvar logs a cada ação de usuário, nós utilizamos **Spring AOP (Programação Orientada a Aspectos)**.

A anotação `@Auditable(action="LEAD_CREATED")` é colocada sobre o método e nosso **AuditAspect** intercepta a saída do método invisivelmente. O Aspecto extrai as informações do objeto salvo, puxa quem foi o autor (`userEmail`) e qual era o inquilino (`companyId`) via **TenantContext**, e guarda tudo na tabela de `audit_logs` blindando a rastreabilidade.

**Para ver os logs gerados (Logado como Empresa Alpha):**
```bash
curl -X GET http://localhost:8080/api/audit \
  -H "Authorization: Bearer MEU_TOKEN_ALPHA"
```
*Isto irá listar os eventos de auditoria com data, ação (LEAD_CREATED) e autor.*

## 🧠 Cérebro Analítico (Business Intelligence)
O **DashboardService** é o motor de BI do nosso SaaS, responsável por transformar leads em dados financeiros isolados por inquilino.
As métricas calculadas em tempo real incluem:
- **Total Pipeline Value**: A soma de todos os negócios em aberto ou ganhos.
- **Total Revenue Won**: Receita garantida (apenas negócios ganhos).
- **Conversion Rate**: A taxa de sucesso global da empresa.

**Para consultar o Relatório Executivo (Logado como Empresa Alpha):**
```bash
curl -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer MEU_TOKEN_ALPHA"
```
*Garantia técnica: Operações matemáticas como `Total Leads = 0` são blindadas contra `ArithmeticException` (divisão por zero).*

## 🎨 O Portal Web (React + Vite)
Uma interface visual de altíssima performance, criada sob a estética **Neo-Brutalista**, foi acoplada ao projeto para o gerenciamento executivo do Funil de Vendas.

Para rodar o chassi do portal:
1. Abra um novo terminal.
2. Acesse a pasta do front-end: `cd coresync-web`.
3. Caso não tenha feito, rode `npm install`.
4. Inicie o portal: `npm run dev`.

A portaria será aberta em **`http://localhost:5173/login`**. Use as credenciais cadastradas na base (`admin@alpha.com` e senha `123`) para visualizar a Taxa de Conversão e a Receita do seu Tenant!

---
*Gerado e mantido pela equipe de arquitetura.*
