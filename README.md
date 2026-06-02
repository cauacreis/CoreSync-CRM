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

## 🧪 Como Testar a Autenticação (cURL)

**1. Login na Empresa Alpha**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com", "password":"123"}'
```

**2. Login na Empresa Beta**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beta.com", "password":"123"}'
```

---
*Gerado e mantido pela equipe de arquitetura.*
