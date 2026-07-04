CREATE TABLE IF NOT EXISTS pecas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_sku TEXT NOT NULL UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    preco REAL NOT NULL DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- dados de teste
INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES ('Filtro de Óleo', 'FO-123', 50, 25.50);
INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES ('Pastilha de Freio', 'PF-456', 8, 89.90);
INSERT INTO pecas (nome, codigo_sku, quantidade, preco) VALUES ('Vela de Ignição', 'VI-789', 100, 15.00);
