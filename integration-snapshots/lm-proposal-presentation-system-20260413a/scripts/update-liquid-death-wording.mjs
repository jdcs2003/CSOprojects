import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(connectionString);

function normalizeSections(rawSections) {
  const parsed = typeof rawSections === 'string' ? JSON.parse(rawSections) : rawSections;

  if (!Array.isArray(parsed)) {
    throw new Error('Proposal sections are not an array');
  }

  return parsed.map(section => ({
    ...section,
    note:
      section.note === 'These are the proposal-facing lines shown in the branded presentation proof and mirrored on the public page.'
        ? 'These are the proposal-facing lines shown in the branded presentation and mirrored on the public page.'
        : section.note,
    lines: Array.isArray(section.lines)
      ? section.lines
          .filter(line => line.serviceName !== 'Outside Carrier BOL')
          .map(line => ({
            ...line,
            sourceLabel:
              line.sourceLabel === 'Verified current rates and proof direction'
                ? 'Verified current rates and approved presentation direction'
                : line.sourceLabel,
          }))
      : [],
  }));
}

try {
  const [rows] = await connection.execute(
    'SELECT id, sections FROM proposals WHERE publicSlug = ? LIMIT 1',
    ['liquid-death-renewal-2027-2030'],
  );

  const proposal = rows[0];

  if (!proposal) {
    console.error('Proposal not found');
    process.exit(1);
  }

  const sections = normalizeSections(proposal.sections);

  const [result] = await connection.execute(
    `UPDATE proposals
     SET proposalSubtitle = ?,
         brandingNote = ?,
         sections = ?,
         updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      'Presentation Layout and Rate Card',
      'Use an elegant L&M Logistics presentation treatment. Keep the page clean and premium while avoiding weaker or placeholder logo treatments.',
      JSON.stringify(sections),
      proposal.id,
    ],
  );

  console.log(JSON.stringify(result, null, 2));
} finally {
  await connection.end();
}
