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

# 🚀 CoreSync CRM - Enterprise B2B SaaS (v1.0.0-MVP)

Bem-vindo ao CoreSync CRM, uma plataforma SaaS de alta performance projetada desde o dia 1 para atender clientes corporativos (B2B) com o máximo rigor de segurança arquitetural e excelência de interface.

## 🏗️ A Tríade Arquitetural

Este MVP foi construído sob três pilares de engenharia inegociáveis:

### 1. Isolamento Multi-Tenant Robusto (Spring Security + JWT)
- **Particionamento Lógico**: Ao invés de bancos de dados separados e caros, utilizamos a técnica de injeção de `companyId` (UUID). O filtro `JwtAuthenticationFilter` intercepta o passaporte (Token JWT) do usuário na portaria da requisição e deposita a chave da sua empresa em memória segura usando `ThreadLocal` no nosso **`TenantContext`**.
- **Blindagem Oculta**: Todos os serviços (ex: `LeadService`) não exigem que o usuário envie qual é a sua empresa. O serviço busca ativamente na memória. Isso inviabiliza completamente fraudes de ID via API (Spoofing).

### 2. Rastreabilidade com Spring AOP (O Cofre de Auditoria)
- **Engenharia Limpa (Clean Code)**: Sem poluir as classes de negócios com código de logs! Utilizamos **Programação Orientada a Aspectos (AOP)**.
- **O Olho Que Tudo Vê**: Qualquer método de negócio crítico anotado com `@Auditable` é interceptado no seu encerramento. O Aspecto captura dinamicamente (via Reflection) qual entidade sofreu mutação, puxa o e-mail do autor direto da memória da requisição, e arquiva no banco de dados. Transparência executiva total para os inquilinos B2B.

### 3. Front-end de Impacto (React + Vite + Neo-Brutalismo)
- **Performance Extrema**: O chassi do portal (`/coresync-web`) usa **Vite** como empacotador e tipagem rigorosa do TypeScript para entregar as telas do funil em milissegundos.
- **Estética Neo-Brutalista**: Abusamos da classe TailwindCSS. Com *Dark Mode* ativado no código genético do CSS raiz, desenhamos telas densas, fontes grossas, botões Lima agressivos com sombras duras (`shadow-[6px_6px_...]`), traduzindo segurança e agressividade comercial no Kanban do Pipeline de Vendas.

---

## 💻 Guias Práticos

### Levantando o Motor de API (Java / Spring Boot)
Pré-requisitos: JDK 17 e Maven. O H2 roda local em memória, zero setup.
```bash
mvn spring-boot:run
```
O Backend subirá na porta **8080** com usuários padrão gerados (ex: `admin@alpha.com` | senha: `123`).

### Levantando o Motor Visual (Node / React)
Pré-requisitos: Node 18+.
```bash
cd coresync-web
npm install
npm run dev
```
A Portaria será aberta na porta **5173**. Ao logar, a tela executiva exibirá a conversão real das vendas do Tenant isolado.

---
*Produto arquitetado e codificado sob excelência em 2026. Stand-by ativado.*
