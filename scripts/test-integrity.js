import { CHARACTERS, ROSTER_STATS } from '../data/characters.js';

console.log('--- TESTING CHARACTERS DATASET INTEGRITY ---');
console.log(`Total Characters: ${CHARACTERS.length}`);

if (CHARACTERS.length !== 150) {
  console.error(`ERROR: Expected 150 characters, got ${CHARACTERS.length}`);
  process.exit(1);
}

const ids = new Set();
const names = new Set();
let hasErrors = false;

CHARACTERS.forEach((char, idx) => {
  if (!char.id || ids.has(char.id)) {
    console.error(`Duplicate or missing ID at index ${idx}: ${char.id}`);
    hasErrors = true;
  }
  ids.add(char.id);

  if (!char.name || names.has(char.name)) {
    console.error(`Duplicate or missing Name at index ${idx}: ${char.name}`);
    hasErrors = true;
  }
  names.add(char.name);

  if (!char.stats || typeof char.stats.attack !== 'number' || typeof char.stats.defense !== 'number') {
    console.error(`Invalid stats for ${char.name}`);
    hasErrors = true;
  }

  if (!char.role || !char.faction || !char.image) {
    console.error(`Missing required metadata for ${char.name}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('Integrity check failed with errors.');
  process.exit(1);
}

console.log('✅ ALL 150 CHARACTERS VALIDATED PERFECTLY!');
console.log('Tiers breakdown:', ROSTER_STATS.tiers);
console.log('Total factions:', ROSTER_STATS.factions.length);
console.log('Total roles:', ROSTER_STATS.roles.length);
