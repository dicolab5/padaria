# Pão & Gestão

Aplicação web para gestão de padaria, migrada do protótipo React/TypeScript para Node.js, HTML, CSS e JavaScript puro, com PostgreSQL.

## Executar localmente

1. Instale Node.js 20+ e PostgreSQL 15+.
2. Copie `.env.example` para `.env` e altere `DATABASE_URL`, `SESSION_SECRET` e a senha inicial.
3. Execute `npm install`.
4. Execute `npm run db:migrate`.
5. Execute `npm run db:seed` somente uma vez, em um banco vazio.
6. Execute `npm run dev` e acesse `http://localhost:3000`.

Em produção, use HTTPS, `NODE_ENV=production`, uma chave de sessão aleatória exclusiva, usuário PostgreSQL com privilégio mínimo, backups criptografados e rotação dos segredos. O PostgreSQL de produção deve apresentar certificado TLS confiável.

## Controles de segurança

- Senhas com scrypt, salt aleatório e parâmetros fortes; sessão opaca, `HttpOnly`, `SameSite=Lax`, renovação e armazenamento no PostgreSQL.
- Proteção CSRF em toda alteração de estado e CSP restritiva via Helmet.
- Limitação global e específica de login; bloqueio temporário após cinco falhas.
- RBAC no servidor. O frontend nunca é a fonte de autorização.
- Isolamento por `tenant_id` e verificação de propriedade em consultas para reduzir BOLA/IDOR.
- Validação Zod, limites de corpo e consultas PostgreSQL parametrizadas contra injeção.
- Saída dinâmica codificada no navegador para reduzir XSS; scripts inline são bloqueados pela CSP.
- Venda e estoque são processados em transação com `FOR UPDATE`; preços e totais são recalculados no servidor.
- Auditoria de operações críticas sem armazenar senha, token ou dados de cartão.

2FA foi deliberadamente deixado fora do escopo. Dados de cartão não são armazenados; uma futura integração deve usar um provedor PCI-DSS com tokenização.

## Perfis

- `admin`: acesso total.
- `gerente`: catálogo, estoque, vendas, pessoas, financeiro e relatórios.
- `caixa`: dashboard, consulta ao catálogo, vendas e consulta de clientes.
- `estoque`: dashboard, consulta ao catálogo e movimentação de estoque.

O sistema cobre compras e contas financeiras operacionais. Regras fiscais e emissão de NFC-e não foram inferidas do protótipo e devem ser definidas com a contabilidade antes de uma implantação real.

### Redes corporativas

Com Node.js 24, use `$env:NODE_USE_SYSTEM_CA='1'` antes de `npm install` para aproveitar certificados confiáveis do Windows. Se o registro oficial responder `403 Forbidden`, a rede está bloqueando pacotes npm: solicite a liberação de `registry.npmjs.org` ou configure o endereço do registro corporativo aprovado. Não use `strict-ssl=false`.

## Administração do sistema

A área global fica em `/system.html` e utiliza credenciais e permissões separadas dos administradores de cada padaria. Ela permite consultar indicadores globais, bloquear empresas, bloquear usuários, redefinir senhas e consultar a auditoria administrativa.

Para criar o primeiro administrador local, defina `SYSTEM_ADMIN_NAME`, `SYSTEM_ADMIN_EMAIL` e uma `SYSTEM_ADMIN_PASSWORD` com ao menos 14 caracteres no `.env`, depois execute `npm run db:seed-system`. O comando é idempotente e não altera um administrador já existente.

## Deploy no Render

O arquivo `render.yaml` cria o Web Service e o PostgreSQL, instala dependências, aplica migrações, executa os seeds de forma idempotente e inicia o servidor. Configure no Render os valores secretos marcados como `sync: false`:

- `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`: administrador da primeira padaria.
- `SYSTEM_ADMIN_EMAIL` e `SYSTEM_ADMIN_PASSWORD`: administrador global da plataforma.

O Render gera `SESSION_SECRET` e conecta `DATABASE_URL` automaticamente ao PostgreSQL interno. Não envie o `.env` local. A aplicação expõe `/health` para o health check.

Envie ao repositório `package.json`, `package-lock.json`, `server.js`, `render.yaml`, `src/`, `public/`, `scripts/`, `migrations/`, `test/`, `.env.example`, `.gitignore` e `README.md`. Não envie `.env`, `node_modules/`, `.npm-cache/`, logs ou dumps do banco.
