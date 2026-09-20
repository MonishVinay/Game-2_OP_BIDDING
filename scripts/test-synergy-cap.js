import { calculateCrewSynergies, MAX_SYNERGY_SCORE } from '../src/synergyEngine.js';
import { CHARACTERS } from '../data/characters.js';

console.log('=== TESTING SYNERGY ENGINE SCALING & MAX 150 CAP ===');

console.log(`MAX_SYNERGY_SCORE defined as: ${MAX_SYNERGY_SCORE}`);
if (MAX_SYNERGY_SCORE !== 150) {
  throw new Error(`Expected MAX_SYNERGY_SCORE to be 150, got ${MAX_SYNERGY_SCORE}`);
}

// Test Case 1: Empty squad
const emptyRes = calculateCrewSynergies([]);
console.log('Test 1 (Empty squad):', emptyRes.totalScore);
if (emptyRes.totalScore !== 0 || emptyRes.totalSynergyBonus !== 0) {
  throw new Error('Empty squad failed');
}

// Test Case 2: Squad with modest synergy (Zoro + Sanji)
const zoro = CHARACTERS.find(c => c.name === 'Roronoa Zoro');
const sanji = CHARACTERS.find(c => c.name === 'Sanji');
const twoCrewRes = calculateCrewSynergies([zoro, sanji], 0);

const twoCrewSynSum = twoCrewRes.factionBonus + twoCrewRes.roleBonus + twoCrewRes.loreBonus;
console.log(`Test 2 (Zoro + Sanji): base=${twoCrewRes.basePower}, synSum=${twoCrewSynSum}, total=${twoCrewRes.totalScore}`);
console.log('Active synergies in Test 2:', twoCrewRes.activeSynergies);

if (twoCrewSynSum > 150) {
  throw new Error(`Zoro + Sanji synergy exceeded 150: ${twoCrewSynSum}`);
}

// Test Case 3: Over-synergized monster squad that triggers multiple faction, role, and lore bonuses
// e.g. Luffy, Zoro, Sanji, Nami, Chopper, Robin, Franky, Brook, Jinbe, Usopp (All 10 Straw Hats!)
const strawHats = CHARACTERS.filter(c => c.faction === 'Straw Hat Pirates');
console.log(`\nTesting with all ${strawHats.length} Straw Hats (massive synergies!)...`);
const monsterRes = calculateCrewSynergies(strawHats, 50000000);

const monsterSynSum = monsterRes.factionBonus + monsterRes.roleBonus + monsterRes.loreBonus;
console.log(`Monster squad basePower: ${monsterRes.basePower}`);
console.log(`Monster squad synergy breakdown: faction=${monsterRes.factionBonus}, role=${monsterRes.roleBonus}, lore=${monsterRes.loreBonus}`);
console.log(`Monster squad totalSynergyBonus: ${monsterRes.totalSynergyBonus}`);
console.log(`Monster squad synergy sum (faction+role+lore): ${monsterSynSum}`);
console.log(`Monster squad totalScore: ${monsterRes.totalScore}`);

if (monsterRes.totalSynergyBonus > 150) {
  throw new Error(`totalSynergyBonus exceeded 150! Got ${monsterRes.totalSynergyBonus}`);
}
if (monsterSynSum > 150) {
  throw new Error(`Sum of faction + role + lore exceeded 150! Got ${monsterSynSum}`);
}
if (monsterSynSum !== 150) {
  throw new Error(`Expected capped sum to be exactly 150, got ${monsterSynSum}`);
}

// Verify active synergies card bonuses sum to 150
const activeSynCardSum = monsterRes.activeSynergies
  .filter(s => s.type !== 'economy')
  .reduce((sum, s) => sum + s.bonus, 0);
console.log(`Sum of displayed active synergy card bonuses: ${activeSynCardSum}`);
if (activeSynCardSum !== 150) {
  throw new Error(`Expected active synergy card bonuses to sum to 150, got ${activeSynCardSum}`);
}

// Verify totalScore math
const expectedScore = monsterRes.basePower + 150 + monsterRes.economyBonus;
if (monsterRes.totalScore !== expectedScore) {
  throw new Error(`totalScore mismatch: expected ${expectedScore}, got ${monsterRes.totalScore}`);
}

console.log('\n🎉 ALL SYNERGY ENGINE TESTS PASSED! Synergies scale down and never exceed 150 score.');
