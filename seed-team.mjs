/**
 * Seed script to pre-authorize team members in the authorized_emails table.
 * Run: node seed-team.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const ALL_PERMS = JSON.stringify({
  pricing: true,
  pipeline: true,
  capacity: true,
  proposals: true,
  userManagement: true,
  integrations: true,
});

const FINANCE_PERMS = JSON.stringify({
  pricing: false,
  pipeline: true,
  capacity: false,
  proposals: true,
  userManagement: false,
  integrations: true,
});

const ONBOARDING_PERMS = JSON.stringify({
  pricing: false,
  pipeline: true,
  capacity: true,
  proposals: true,
  userManagement: false,
  integrations: false,
});

const teamMembers = [
  { email: "amoore@lmwarehousing.com", role: "admin", createdBy: "j.stenson@summitskiesinc.com", permissions: ALL_PERMS },
  { email: "tsantos@lmwarehousing.com", role: "admin", createdBy: "j.stenson@summitskiesinc.com", permissions: ALL_PERMS },
  { email: "alazarek@lmwarehousing.com", role: "admin", createdBy: "j.stenson@summitskiesinc.com", permissions: ALL_PERMS },
  { email: "egusz@lmwarehousing.com", role: "admin", createdBy: "j.stenson@summitskiesinc.com", permissions: FINANCE_PERMS },
  { email: "mlee@lmwarehousing.com", role: "admin", createdBy: "j.stenson@summitskiesinc.com", permissions: ONBOARDING_PERMS },
];

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to database. Seeding authorized emails...\n");
  
  // Check if pre_assigned_permissions column exists
  let hasPermsCol = false;
  try {
    const [cols] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'authorized_emails' AND COLUMN_NAME = 'pre_assigned_permissions'`
    );
    hasPermsCol = cols.length > 0;
  } catch (e) {
    // ignore
  }
  
  for (const member of teamMembers) {
    try {
      if (hasPermsCol) {
        // Upsert with permissions
        const [result] = await connection.execute(
          `INSERT INTO authorized_emails (email, role, created_by, pre_assigned_permissions) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE role = VALUES(role), pre_assigned_permissions = VALUES(pre_assigned_permissions)`,
          [member.email, member.role, member.createdBy, member.permissions]
        );
        console.log(`  ✓ ${member.email} → ${member.role} (with permissions)`);
      } else {
        const [result] = await connection.execute(
          `INSERT IGNORE INTO authorized_emails (email, role, created_by) VALUES (?, ?, ?)`,
          [member.email, member.role, member.createdBy]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✓ ${member.email} → ${member.role}`);
        } else {
          console.log(`  ⊘ ${member.email} already exists, skipping`);
        }
      }
    } catch (err) {
      console.error(`  ✗ ${member.email} failed:`, err.message);
    }
  }
  
  // Verify
  const [rows] = await connection.execute("SELECT * FROM authorized_emails");
  console.log(`\nTotal authorized emails in DB: ${rows.length}`);
  for (const row of rows) {
    console.log(`  ${row.email} → ${row.role} (added by ${row.created_by})`);
  }
  
  await connection.end();
  console.log("\nDone!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
