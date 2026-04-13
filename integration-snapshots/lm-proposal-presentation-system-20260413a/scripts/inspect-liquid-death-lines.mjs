import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(connectionString);

try {
  const [rows] = await connection.execute(
    'SELECT id, proposalName, publicSlug, sections FROM proposals WHERE publicSlug = ? LIMIT 1',
    ['liquid-death-renewal-2027-2030'],
  );

  const proposal = rows[0];

  if (!proposal) {
    console.error('Proposal not found');
    process.exit(1);
  }

  const sections = typeof proposal.sections === 'string' ? JSON.parse(proposal.sections) : proposal.sections;

  const output = sections.map((section) => ({
    title: section.title,
    note: section.note,
    lines: Array.isArray(section.lines)
      ? section.lines.map((line) => ({
          serviceName: line.serviceName,
          currentRate: line.currentRate,
          proposedRate: line.proposedRate,
          rate2027: line.rate2027,
          unitNote: line.unitNote,
          laneLabel: line.laneLabel,
          sourceLabel: line.sourceLabel,
        }))
      : [],
  }));

  console.log(JSON.stringify(output, null, 2));
} finally {
  await connection.end();
}
