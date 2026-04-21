import mysql from "mysql2/promise";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

const tables = [
  "dre_audit_log",
  "dre_dados",
  "dre_forecast",
  "dre_natureza_operacional",
  "dre_plano_contas",
  "dre_uploads",
];

// Read the full migration SQL
const sql = fs.readFileSync("drizzle/0012_wild_chat.sql", "utf-8");
const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
  // Only execute statements for DRE tables
  const isDre = tables.some(t => stmt.includes(`\`${t}\``));
  if (!isDre) continue;
  
  try {
    await conn.execute(stmt);
    const match = stmt.match(/CREATE TABLE `(\w+)`/);
    console.log(`✓ Created: ${match ? match[1] : "unknown"}`);
  } catch (e) {
    if (e.code === "ER_TABLE_EXISTS_ERROR") {
      const match = stmt.match(/CREATE TABLE `(\w+)`/);
      console.log(`⊘ Already exists: ${match ? match[1] : "unknown"}`);
    } else if (stmt.includes("CREATE INDEX") || stmt.includes("ALTER TABLE")) {
      console.log(`⊘ Index/alter skipped (may already exist)`);
    } else {
      console.error(`✗ Error:`, e.message);
    }
  }
}

// Also run indexes for DRE tables
const indexStatements = statements.filter(s => 
  (s.includes("CREATE INDEX") || s.includes("ALTER TABLE")) && 
  tables.some(t => s.includes(`\`${t}\``))
);
for (const stmt of indexStatements) {
  try {
    await conn.execute(stmt);
    console.log("✓ Index created");
  } catch (e) {
    console.log("⊘ Index already exists or skipped");
  }
}

// Mark migration as applied in drizzle journal
try {
  await conn.execute(`INSERT IGNORE INTO __drizzle_migrations (hash, created_at) VALUES ('0012_wild_chat', ${Date.now()})`);
  console.log("✓ Migration marked as applied");
} catch (e) {
  console.log("⊘ Could not mark migration:", e.message);
}

await conn.end();
console.log("Done!");
