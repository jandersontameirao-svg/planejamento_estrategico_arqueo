import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

try {
  console.log("Criando tabela empresa_cliente...");
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS empresa_cliente (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NOT NULL,
      cliente_id INT NOT NULL,
      created_at BIGINT NOT NULL DEFAULT 0,
      UNIQUE KEY uq_empresa_cliente (empresa_id, cliente_id),
      KEY idx_empresa_id (empresa_id),
      KEY idx_cliente_id (cliente_id)
    )
  `);
  console.log("Tabela empresa_cliente criada com sucesso.");

  console.log("Migrando dados existentes de empresa_id...");
  const [result] = await conn.execute(`
    INSERT IGNORE INTO empresa_cliente (empresa_id, cliente_id)
    SELECT empresa_id, id FROM contratos_clientes
    WHERE empresa_id IS NOT NULL
  `);
  console.log(`Migração concluída: ${result.affectedRows} vínculos migrados.`);

  const [[{ total }]] = await conn.execute("SELECT COUNT(*) as total FROM empresa_cliente");
  console.log(`Total de vínculos na tabela: ${total}`);
} catch (err) {
  console.error("Erro na migração:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
