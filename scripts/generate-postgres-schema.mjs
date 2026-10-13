import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.resolve('prisma/schema.prisma'), 'utf8');
const pgSchema = source.replace('provider = "sqlite"', 'provider = "postgresql"');
fs.writeFileSync(path.resolve('prisma/schema.postgresql.prisma'), pgSchema, 'utf8');
console.log('Successfully generated prisma/schema.postgresql.prisma');
