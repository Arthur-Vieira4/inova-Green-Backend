# Inova Green - Backend

Backend em Node.js + Express + PostgreSQL para o site Inova Green.

## O que ele faz

1. **Cadastro de leads** - recebe os dados do formulário do site (`index.html`).
2. **Recepção de dados de sensores** - recebe leituras de corrente enviadas pelo ESP32/Arduino via WiFi.

## Como rodar

1. Instale as dependências:
   ```
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha com os dados do seu banco PostgreSQL:
   ```
   cp .env.example .env
   ```

3. Crie o banco de dados (se ainda não existir) e rode o script `schema.sql` nele para criar as tabelas.

4. Inicie o servidor:
   ```
   npm start
   ```

O servidor vai subir em `http://localhost:8080` (ou na porta que você definir no `.env`).

## Endpoints

### Cadastro
- `POST /api/cadastro` — body: `{ "nome", "email", "telefone", "kit" }` (kit: `basico`, `familia` ou `pro`)
- `GET /api/cadastro` — lista todos os cadastros

### Sensores
- `POST /api/sensores` — body: `{ "device_id", "corrente", "tensao", "potencia" }` (enviado pelo ESP32)
- `GET /api/sensores/:device_id?limite=200` — histórico de leituras de um dispositivo (para o dashboard)

## Próximos passos sugeridos

- Conectar o `<form>` do `index.html` a esse endpoint via `fetch()`.
- Programar o ESP32 para enviar um `POST` para `/api/sensores` a cada leitura.
- Adicionar autenticação (login) se o dashboard for restrito a usuários cadastrados.
- Hospedar o backend (Render, Railway, etc.) e o banco (Supabase, Neon, etc.).
