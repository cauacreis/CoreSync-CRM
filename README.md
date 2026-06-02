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

---
*Gerado e mantido pela equipe de arquitetura.*
