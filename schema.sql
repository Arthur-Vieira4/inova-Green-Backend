-- Rode este script uma vez no seu banco PostgreSQL para criar as tabelas

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    kit VARCHAR(20) NOT NULL CHECK (kit IN ('basico', 'familia', 'pro')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leituras (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    corrente NUMERIC(10, 3) NOT NULL,
    tensao NUMERIC(10, 3),
    potencia NUMERIC(10, 3),
    registrado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leituras_device_id ON leituras (device_id);
CREATE INDEX IF NOT EXISTS idx_leituras_registrado_em ON leituras (registrado_em);
