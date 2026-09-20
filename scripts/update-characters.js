import fs from 'fs';
import { CHARACTERS } from '../data/characters.js';

const imageMap = JSON.parse(fs.readFileSync('./data/fetched-images.json', 'utf8'));

// Calculate bounty-proportional power and base price
function calculatePowerAndPrice(char) {
  let bountyNum = char.bounty || 0;

  // Custom threat scaling for special characters whose canon bounties were frozen or gags
  let effectiveBounty = bountyNum;
  if (char.name === 'Tony Tony Chopper') {
    effectiveBounty = 250000000; // Monster Point combat power ~250M
  } else if (char.name === 'Bepo') {
    effectiveBounty = 200000000; // Sulong combat power ~200M
  } else if (char.name === 'Donquixote Doflamingo') {
    effectiveBounty = 1250000000; // Frozen 340M warlord bounty; actual threat ~1.25B
  } else if (char.name === 'Bartholomew Kuma') {
    effectiveBounty = 950000000; // Frozen 296M warlord bounty; actual threat ~950M
  } else if (char.name === 'Sabo') {
    effectiveBounty = 1500000000; // Flame Emperor threat ~1.5B
  } else if (char.name === 'Monkey D. Garp') {
    effectiveBounty = 4200000000; // Legendary Hero
  } else if (char.name === 'Rocks D. Xebec') {
    effectiveBounty = 6000000000; // God Valley Titan
  } else if (char.name === 'Monkey D. Dragon') {
    effectiveBounty = 5200000000; // World's Worst Criminal
  } else if (char.name === 'Silvers Rayleigh') {
    effectiveBounty = 3800000000; // Dark King
  } else if (char.name === 'Sengoku the Buddha') {
    effectiveBounty = 3800000000; // Former Fleet Admiral
  } else if (char.name === 'Issho (Fujitora)') {
    effectiveBounty = 3200000000; // Admiral
  } else if (char.name === 'Kozuki Oden') {
    effectiveBounty = 3500000000; // Legendary Samurai
  } else if (char.name === 'Ryuma') {
    effectiveBounty = 3500000000; // Sword God
  } else if (char.name === 'Jewelry Bonney') {
    effectiveBounty = 800000000; // Nika-like Distortion Future
  }

  // Power is directly proportional to bounty (in millions)
  // E.g. Roger 5,565, Kaido 4,611, Luffy 3,000, Zoro 1,111, Ace 550, Arlong 20, Alvida 5
  const power = Math.max(5, Math.round(effectiveBounty / 1000000));

  // Determine Base Starting Price proportional to power/tier
  let basePrice = 1000000;
  if (power >= 4000) {
    basePrice = 30000000; // 30M
  } else if (power >= 2500) {
    basePrice = 20000000; // 20M
  } else if (power >= 1000) {
    basePrice = 10000000; // 10M
  } else if (power >= 400) {
    basePrice = 5000000;  // 5M
  } else if (power >= 100) {
    basePrice = 2000000;  // 2M
  } else {
    basePrice = 1000000;  // 1M
  }

  // Sub-stats scaled proportionally
  const attack = Math.round(power * 0.28);
  const defense = Math.round(power * 0.26);
  const hakiPower = Math.round(power * 0.24);
  const skill = Math.round(power * 0.22);

  // Tier assignment based on power
  let tier = 'R';
  if (power >= 2500) tier = 'EX';
  else if (power >= 1000) tier = 'SSR';
  else if (power >= 200) tier = 'SR';
  else tier = 'R';

  return {
    power,
    basePrice,
    basePriceFormatted: `฿ ${(basePrice / 1000000)}M`,
    tier,
    stats: {
      attack,
      defense,
      hakiPower,
      skill,
      total: power
    }
  };
}

const updatedCharacters = CHARACTERS.map(c => {
  const scaled = calculatePowerAndPrice(c);
  const verifiedImage = imageMap[String(c.id)] || c.image;

  return {
    ...c,
    image: verifiedImage,
    tier: scaled.tier,
    power: scaled.power,
    basePrice: scaled.basePrice,
    basePriceFormatted: scaled.basePriceFormatted,
    stats: scaled.stats
  };
});

// Sort by power descending to preview top characters
const sorted = [...updatedCharacters].sort((a, b) => b.power - a.power);

console.log('Top 10 Most Powerful Characters:');
sorted.slice(0, 10).forEach((c, idx) => {
  console.log(`${idx + 1}. ${c.name} - Power: ${c.power} | Base Price: ${c.basePriceFormatted} | Tier: ${c.tier}`);
});

console.log('\nSample Lower Tier Characters:');
sorted.slice(-10).forEach((c, idx) => {
  console.log(`${sorted.length - 10 + idx + 1}. ${c.name} - Power: ${c.power} | Base Price: ${c.basePriceFormatted} | Tier: ${c.tier}`);
});

const fileContent = `// Complete 150 Curated One Piece Characters Dataset
// Includes official verified anime artwork, bounty-proportional power scaling, and base starting prices.

export const CHARACTERS = ${JSON.stringify(updatedCharacters, null, 2)};

// Map lookup helper by ID
export const CHARACTERS_MAP = new Map(CHARACTERS.map(c => [c.id, c]));

// Summary statistics helper
export const ROSTER_STATS = {
  total: CHARACTERS.length,
  factions: [...new Set(CHARACTERS.map(c => c.faction))],
  roles: [...new Set(CHARACTERS.map(c => c.role))],
  tiers: {
    EX: CHARACTERS.filter(c => c.tier === 'EX').length,
    SSR: CHARACTERS.filter(c => c.tier === 'SSR').length,
    SR: CHARACTERS.filter(c => c.tier === 'SR').length,
    R: CHARACTERS.filter(c => c.tier === 'R').length
  }
};
`;

fs.writeFileSync('./data/characters.js', fileContent);
console.log('\n✅ Successfully updated ./data/characters.js with verified images and proportional bounty scaling!');
