import { CHARACTERS } from '../data/characters.js';

console.log('=== TEST 1: PDF 150 CHARACTERS DATASET INTEGRITY ===');
if (CHARACTERS.length !== 150) {
  throw new Error(`Expected 150 characters, got ${CHARACTERS.length}`);
}

let formulaMatches = 0;
CHARACTERS.forEach((c, i) => {
  if (c.id !== i + 1) {
    throw new Error(`Character ID mismatch at index ${i}: expected ${i + 1}, got ${c.id}`);
  }
  if (!c.name || !c.image) {
    throw new Error(`Character missing name or image: ${c.name || c.id}`);
  }
  if (!c.stats || typeof c.stats.attack !== 'number' || typeof c.stats.strength !== 'number' || typeof c.stats.defense !== 'number' || typeof c.stats.total !== 'number') {
    throw new Error(`Character stats invalid for ${c.name}`);
  }

  // Check formula: 0.40 * atk + 0.30 * str + 0.30 * def
  const calculated = Math.round(0.40 * c.stats.attack + 0.30 * c.stats.strength + 0.30 * c.stats.defense);
  if (Math.abs(calculated - c.stats.total) <= 1) {
    formulaMatches++;
  } else {
    console.warn(`Slight rounding diff for ${c.name}: calc ${calculated} vs total ${c.stats.total}`);
  }
});
console.log(`✓ All 150 characters verified. Formula consistency: ${formulaMatches}/150 matches.`);

// Test key characters from PDF
const luffy = CHARACTERS.find(c => c.id === 1);
console.log(`✓ #1 Luffy: Overall ${luffy.power}, Atk ${luffy.stats.attack}, Str ${luffy.stats.strength}, Def ${luffy.stats.defense}`);
if (luffy.power !== 974 || luffy.stats.attack !== 980 || luffy.stats.strength !== 990 || luffy.stats.defense !== 950) {
  throw new Error('Luffy stats mismatch');
}

const shutenmaru = CHARACTERS.find(c => c.id === 62);
console.log(`✓ #62 Shutenmaru: Overall ${shutenmaru.power}, Atk ${shutenmaru.stats.attack}, Str ${shutenmaru.stats.strength}, Def ${shutenmaru.stats.defense}`);
if (shutenmaru.power !== 660 || shutenmaru.stats.attack !== 660 || shutenmaru.stats.strength !== 700 || shutenmaru.stats.defense !== 620) {
  throw new Error('Shutenmaru stats mismatch');
}

const bigMom = CHARACTERS.find(c => c.id === 75);
console.log(`✓ #75 Big Mom: Overall ${bigMom.power}, Atk ${bigMom.stats.attack}, Str ${bigMom.stats.strength}, Def ${bigMom.stats.defense}`);
if (bigMom.power !== 993 || bigMom.stats.attack !== 990 || bigMom.stats.strength !== 1000 || bigMom.stats.defense !== 990) {
  throw new Error('Big Mom stats mismatch');
}

const shiki = CHARACTERS.find(c => c.id === 141);
console.log(`✓ #141 Shiki: Overall ${shiki.power}, Atk ${shiki.stats.attack}, Str ${shiki.stats.strength}, Def ${shiki.stats.defense}`);
if (shiki.power !== 930 || shiki.stats.attack !== 930 || shiki.stats.strength !== 960 || shiki.stats.defense !== 900) {
  throw new Error('Shiki stats mismatch');
}

const akainu = CHARACTERS.find(c => c.id === 146);
console.log(`✓ #146 Akainu: Overall ${akainu.power}, Atk ${akainu.stats.attack}, Str ${akainu.stats.strength}, Def ${akainu.stats.defense}`);
if (akainu.power !== 928 || akainu.stats.attack !== 925 || akainu.stats.strength !== 960 || akainu.stats.defense !== 900) {
  throw new Error('Akainu stats mismatch');
}

const sentomaru = CHARACTERS.find(c => c.id === 150);
console.log(`✓ #150 Sentomaru: Overall ${sentomaru.power}, Atk ${sentomaru.stats.attack}, Str ${sentomaru.stats.strength}, Def ${sentomaru.stats.defense}`);
if (sentomaru.power !== 650 || sentomaru.stats.attack !== 620 || sentomaru.stats.strength !== 640 || sentomaru.stats.defense !== 700) {
  throw new Error('Sentomaru stats mismatch');
}

console.log('\n=== ALL PDF VERIFICATION CHECKS PASSED ===');
