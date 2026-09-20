import fs from 'fs';
import { CHARACTERS } from '../data/characters.js';

const pdfList = [
  { id: 1, name: "Monkey D. Luffy", overall: 974, atk: 980, str: 990, def: 950 },
  { id: 2, name: "Roronoa Zoro", overall: 920, atk: 925, str: 945, def: 890 },
  { id: 3, name: "Nami", overall: 217, atk: 220, str: 180, def: 250 },
  { id: 4, name: "Usopp", overall: 281, atk: 290, str: 250, def: 300 },
  { id: 5, name: "Sanji", overall: 906, atk: 915, str: 940, def: 860 },
  { id: 6, name: "Tony Tony Chopper", overall: 491, atk: 500, str: 500, def: 470 },
  { id: 7, name: "Nico Robin", overall: 625, atk: 625, str: 640, def: 610 },
  { id: 8, name: "Franky", overall: 671, atk: 650, str: 650, def: 720 },
  { id: 9, name: "Brook", overall: 602, atk: 590, str: 620, def: 600 },
  { id: 10, name: "Jinbe", overall: 875, atk: 860, str: 870, def: 900 },
  { id: 11, name: "Portgas D. Ace", overall: 839, atk: 845, str: 880, def: 790 },
  { id: 12, name: "Sabo", overall: 896, atk: 905, str: 940, def: 840 },
  { id: 13, name: "Trafalgar D. Water Law", overall: 849, atk: 855, str: 900, def: 790 },
  { id: 14, name: "Boa Hancock", overall: 775, atk: 790, str: 830, def: 700 },
  { id: 15, name: "Shanks", overall: 941, atk: 950, str: 990, def: 880 },
  { id: 16, name: "Marshall D. Teach (Blackbeard)", overall: 926, atk: 935, str: 960, def: 880 },
  { id: 17, name: "Dracule Mihawk", overall: 950, atk: 955, str: 995, def: 900 },
  { id: 18, name: "Buggy", overall: 93, atk: 90, str: 70, def: 120 },
  { id: 19, name: "Donquixote Doflamingo", overall: 805, atk: 805, str: 840, def: 770 },
  { id: 20, name: "Charlotte Katakuri", overall: 838, atk: 835, str: 870, def: 810 },
  { id: 21, name: "Edward Newgate (Whitebeard)", overall: 979, atk: 985, str: 1000, def: 950 },
  { id: 22, name: "Gol D. Roger", overall: 981, atk: 990, str: 1000, def: 950 },
  { id: 23, name: "Monkey D. Garp", overall: 968, atk: 975, str: 995, def: 930 },
  { id: 24, name: "Silvers Rayleigh", overall: 917, atk: 920, str: 950, def: 880 },
  { id: 25, name: "Monkey D. Dragon", overall: 934, atk: 940, str: 960, def: 900 },
  { id: 26, name: "Koby", overall: 607, atk: 610, str: 650, def: 560 },
  { id: 27, name: "Smoker", overall: 585, atk: 585, str: 610, def: 560 },
  { id: 28, name: "Tashigi", overall: 323, atk: 320, str: 330, def: 320 },
  { id: 29, name: "Crocodile", overall: 775, atk: 775, str: 820, def: 730 },
  { id: 30, name: "Rob Lucci", overall: 798, atk: 800, str: 835, def: 760 },
  { id: 31, name: "Enel", overall: 644, atk: 665, str: 760, def: 500 },
  { id: 32, name: "Gecko Moria", overall: 525, atk: 510, str: 540, def: 530 },
  { id: 33, name: "Bartholomew Kuma", overall: 905, atk: 875, str: 900, def: 950 },
  { id: 34, name: "Donquixote Rosinante (Corazon)", overall: 439, atk: 430, str: 450, def: 440 },
  { id: 35, name: "Daz Bonez (Mr. 1)", overall: 626, atk: 605, str: 630, def: 650 },
  { id: 36, name: "Bentham (Bon Clay)", overall: 440, atk: 440, str: 450, def: 430 },
  { id: 37, name: "Perona", overall: 458, atk: 455, str: 440, def: 480 },
  { id: 38, name: "Boa Sandersonia", overall: 535, atk: 535, str: 570, def: 500 },
  { id: 39, name: "Boa Marigold", overall: 545, atk: 545, str: 580, def: 510 },
  { id: 40, name: "Magellan", overall: 868, atk: 850, str: 900, def: 860 },
  { id: 41, name: "Hannyabal", overall: 389, atk: 380, str: 400, def: 390 },
  { id: 42, name: "Emporio Ivankov", overall: 626, atk: 620, str: 650, def: 610 },
  { id: 43, name: "Jewelry Bonney", overall: 629, atk: 620, str: 680, def: 590 },
  { id: 44, name: "Eustass Kid", overall: 855, atk: 855, str: 900, def: 810 },
  { id: 45, name: "Killer", overall: 752, atk: 755, str: 790, def: 710 },
  { id: 46, name: "Basil Hawkins", overall: 638, atk: 635, str: 660, def: 620 },
  { id: 47, name: "Scratchmen Apoo", overall: 646, atk: 640, str: 700, def: 600 },
  { id: 48, name: "X Drake", overall: 690, atk: 690, str: 710, def: 670 },
  { id: 49, name: "Capone Bege", overall: 648, atk: 600, str: 580, def: 780 },
  { id: 50, name: "Urouge", overall: 749, atk: 755, str: 790, def: 700 },
  { id: 51, name: "Bepo", overall: 474, atk: 480, str: 500, def: 440 },
  { id: 52, name: "Rocks D. Xebec", overall: 986, atk: 995, str: 1000, def: 960 },
  { id: 53, name: "Kozuki Oden", overall: 944, atk: 950, str: 980, def: 900 },
  { id: 54, name: "Yamato", overall: 890, atk: 890, str: 920, def: 860 },
  { id: 55, name: "Kin'emon", overall: 528, atk: 525, str: 560, def: 500 },
  { id: 56, name: "Kozuki Momonosuke", overall: 674, atk: 650, str: 620, def: 760 },
  { id: 57, name: "Kikunojo (Kiku)", overall: 514, atk: 505, str: 540, def: 500 },
  { id: 58, name: "Denjiro", overall: 663, atk: 660, str: 700, def: 630 },
  { id: 59, name: "Raizo", overall: 482, atk: 470, str: 430, def: 550 },
  { id: 60, name: "Kawamatsu", overall: 628, atk: 625, str: 650, def: 610 },
  { id: 61, name: "Ashura Doji", overall: 660, atk: 660, str: 700, def: 620 },
  { id: 62, name: "Shutenmaru", overall: 660, atk: 660, str: 700, def: 620 },
  { id: 63, name: "Izo", overall: 609, atk: 600, str: 630, def: 600 },
  { id: 64, name: "Kozuki Hiyori", overall: 200, atk: 200, str: 160, def: 240 },
  { id: 65, name: "Kurozumi Orochi", overall: 374, atk: 350, str: 300, def: 480 },
  { id: 66, name: "Kaido", overall: 995, atk: 995, str: 1000, def: 990 },
  { id: 67, name: "King", overall: 920, atk: 905, str: 940, def: 920 },
  { id: 68, name: "Queen", overall: 852, atk: 825, str: 840, def: 900 },
  { id: 69, name: "Jack", overall: 797, atk: 770, str: 780, def: 850 },
  { id: 70, name: "Ulti", overall: 712, atk: 700, str: 720, def: 720 },
  { id: 71, name: "Page One", overall: 632, atk: 605, str: 620, def: 680 },
  { id: 72, name: "Who's-Who", overall: 678, atk: 675, str: 710, def: 650 },
  { id: 73, name: "Black Maria", overall: 643, atk: 625, str: 650, def: 660 },
  { id: 74, name: "Sasaki", overall: 679, atk: 655, str: 670, def: 720 },
  { id: 75, name: "Charlotte Linlin (Big Mom)", overall: 993, atk: 990, str: 1000, def: 990 },
  { id: 76, name: "Charlotte Pudding", overall: 210, atk: 210, str: 170, def: 250 },
  { id: 77, name: "Charlotte Brulee", overall: 371, atk: 365, str: 320, def: 430 },
  { id: 78, name: "Charlotte Cracker", overall: 828, atk: 825, str: 850, def: 810 },
  { id: 79, name: "Charlotte Smoothie", overall: 816, atk: 810, str: 850, def: 790 },
  { id: 80, name: "Charlotte Perospero", overall: 702, atk: 690, str: 720, def: 700 },
  { id: 81, name: "Charlotte Oven", overall: 671, atk: 665, str: 710, def: 640 },
  { id: 82, name: "Charlotte Daifuku", overall: 679, atk: 670, str: 720, def: 650 },
  { id: 83, name: "Charlotte Flampe", overall: 177, atk: 180, str: 130, def: 220 },
  { id: 84, name: "Pedro", overall: 700, atk: 700, str: 750, def: 650 },
  { id: 85, name: "Carrot", overall: 536, atk: 530, str: 560, def: 520 },
  { id: 86, name: "Wanda", overall: 497, atk: 485, str: 510, def: 500 },
  { id: 87, name: "Inuarashi", overall: 770, atk: 770, str: 810, def: 730 },
  { id: 88, name: "Nekomamushi", overall: 770, atk: 770, str: 810, def: 730 },
  { id: 89, name: "Vinsmoke Reiju", overall: 653, atk: 650, str: 680, def: 630 },
  { id: 90, name: "Vinsmoke Judge", overall: 631, atk: 610, str: 640, def: 650 },
  { id: 91, name: "Vinsmoke Ichiji", overall: 647, atk: 635, str: 680, def: 630 },
  { id: 92, name: "Vinsmoke Niji", overall: 631, atk: 625, str: 660, def: 610 },
  { id: 93, name: "Vinsmoke Yonji", overall: 634, atk: 610, str: 620, def: 680 },
  { id: 94, name: "Absalom", overall: 428, atk: 410, str: 430, def: 450 },
  { id: 95, name: "Hogback", overall: 263, atk: 260, str: 180, def: 350 },
  { id: 96, name: "Caesar Clown", overall: 473, atk: 455, str: 500, def: 470 },
  { id: 97, name: "Vergo", overall: 686, atk: 665, str: 710, def: 690 },
  { id: 98, name: "Monet", overall: 442, atk: 430, str: 470, def: 430 },
  { id: 99, name: "Baby 5", overall: 544, atk: 505, str: 560, def: 580 },
  { id: 100, name: "Trebol", overall: 518, atk: 500, str: 540, def: 520 },
  { id: 101, name: "Diamante", overall: 628, atk: 625, str: 650, def: 610 },
  { id: 102, name: "Pica", overall: 723, atk: 690, str: 700, def: 790 },
  { id: 103, name: "Senor Pink", overall: 541, atk: 520, str: 550, def: 560 },
  { id: 104, name: "Fisher Tiger", overall: 715, atk: 715, str: 750, def: 680 },
  { id: 105, name: "Arlong", overall: 498, atk: 480, str: 520, def: 500 },
  { id: 106, name: "Hachi (Hatchan)", overall: 331, atk: 325, str: 350, def: 320 },
  { id: 107, name: "Kuroobi", overall: 356, atk: 350, str: 380, def: 340 },
  { id: 108, name: "Chew", overall: 285, atk: 285, str: 300, def: 270 },
  { id: 109, name: "Don Krieg", overall: 400, atk: 355, str: 360, def: 500 },
  { id: 110, name: "Gin", overall: 408, atk: 405, str: 430, def: 390 },
  { id: 111, name: "Kuro", overall: 419, atk: 425, str: 480, def: 350 },
  { id: 112, name: "Jango", overall: 258, atk: 255, str: 220, def: 300 },
  { id: 113, name: "Fullbody", overall: 192, atk: 180, str: 170, def: 230 },
  { id: 114, name: "Alvida", overall: 132, atk: 120, str: 100, def: 180 },
  { id: 115, name: "Wapol", overall: 184, atk: 145, str: 120, def: 300 },
  { id: 116, name: "Nefertari Vivi", overall: 225, atk: 225, str: 210, def: 240 },
  { id: 117, name: "Nefertari Cobra", overall: 134, atk: 125, str: 100, def: 180 },
  { id: 118, name: "Pell", overall: 462, atk: 435, str: 480, def: 480 },
  { id: 119, name: "Koza", overall: 282, atk: 270, str: 300, def: 280 },
  { id: 120, name: "Rebecca", overall: 314, atk: 305, str: 300, def: 340 },
  { id: 121, name: "Kyros", overall: 619, atk: 610, str: 660, def: 590 },
  { id: 122, name: "Riku Doldo III", overall: 161, atk: 155, str: 130, def: 200 },
  { id: 123, name: "Viola", overall: 326, atk: 305, str: 260, def: 420 },
  { id: 124, name: "Bartolomeo", overall: 661, atk: 640, str: 500, def: 850 },
  { id: 125, name: "Cavendish", overall: 684, atk: 690, str: 720, def: 640 },
  { id: 126, name: "Don Chinjao", overall: 744, atk: 735, str: 790, def: 710 },
  { id: 127, name: "Sai", overall: 691, atk: 685, str: 730, def: 660 },
  { id: 128, name: "Leo", overall: 448, atk: 430, str: 450, def: 470 },
  { id: 129, name: "Orlumbus", overall: 449, atk: 410, str: 430, def: 520 },
  { id: 130, name: "Hajrudin", overall: 560, atk: 515, str: 560, def: 620 },
  { id: 131, name: "Ideo", overall: 461, atk: 455, str: 500, def: 430 },
  { id: 132, name: "Foxy", overall: 209, atk: 185, str: 150, def: 300 },
  { id: 133, name: "Ryuma", overall: 902, atk: 905, str: 950, def: 850 },
  { id: 134, name: "Dr. Hiriluk", overall: 61, atk: 55, str: 50, def: 80 },
  { id: 135, name: "Kureha", overall: 117, atk: 105, str: 80, def: 170 },
  { id: 136, name: "Laboon", overall: 575, atk: 500, str: 450, def: 800 },
  { id: 137, name: "Tom", overall: 120, atk: 105, str: 100, def: 160 },
  { id: 138, name: "Iceburg", overall: 114, atk: 105, str: 90, def: 150 },
  { id: 139, name: "Paulie", overall: 303, atk: 285, str: 300, def: 330 },
  { id: 140, name: "Kaku", overall: 671, atk: 665, str: 710, def: 640 },
  { id: 141, name: "Shiki", overall: 930, atk: 930, str: 960, def: 900 },
  { id: 142, name: "Marco", overall: 915, atk: 900, str: 920, def: 930 },
  { id: 143, name: "Vista", overall: 736, atk: 730, str: 780, def: 700 },
  { id: 144, name: "Shiryu", overall: 817, atk: 820, str: 850, def: 780 },
  { id: 145, name: "Kizaru (Borsalino)", overall: 904, atk: 900, str: 925, def: 890 },
  { id: 146, name: "Akainu (Sakazuki)", overall: 928, atk: 925, str: 960, def: 900 },
  { id: 147, name: "Aokiji (Kuzan)", overall: 923, atk: 920, str: 950, def: 900 },
  { id: 148, name: "Fujitora (Issho)", overall: 884, atk: 875, str: 900, def: 880 },
  { id: 149, name: "Sengoku", overall: 896, atk: 890, str: 920, def: 880 },
  { id: 150, name: "Sentomaru", overall: 650, atk: 620, str: 640, def: 700 }
];

function norm(s) {
  return s.toLowerCase().replace(/[\(\)\'\-\.\s]/g, '');
}

// Find existing character by fuzzy name
function findExisting(name) {
  const n = norm(name);
  // Special mappings
  if (name === "Kizaru (Borsalino)") return CHARACTERS.find(c => c.name.includes("Borsalino"));
  if (name === "Akainu (Sakazuki)") return CHARACTERS.find(c => c.name.includes("Sakazuki"));
  if (name === "Aokiji (Kuzan)") return CHARACTERS.find(c => c.name.includes("Kuzan"));
  if (name === "Fujitora (Issho)") return CHARACTERS.find(c => c.name.includes("Issho"));
  if (name === "Sengoku") return CHARACTERS.find(c => c.name.includes("Sengoku"));
  if (name === "Marco") return CHARACTERS.find(c => c.name.includes("Marco"));
  if (name === "Kozuki Momonosuke") return CHARACTERS.find(c => c.name.includes("Momonosuke"));

  let exact = CHARACTERS.find(c => norm(c.name) === n);
  if (exact) return exact;

  return CHARACTERS.find(c => norm(c.name).includes(n) || n.includes(norm(c.name)));
}

function getTier(overall) {
  if (overall >= 900) return 'EX';
  if (overall >= 750) return 'SSR';
  if (overall >= 450) return 'SR';
  return 'R';
}

function getBasePrice(overall) {
  if (overall >= 900) return 25000000;
  if (overall >= 800) return 15000000;
  if (overall >= 600) return 5000000;
  if (overall >= 400) return 2000000;
  return 1000000;
}

const newCharacters = pdfList.map(item => {
  const existing = findExisting(item.name);
  let base = {};

  if (existing) {
    base = { ...existing };
  }

  // Handle special new characters if no base existed
  if (item.name === "Shutenmaru") {
    base = {
      japaneseName: "酒天丸",
      title: "Leader of Mt. Atama Thieves",
      bounty: 320000000,
      bountyFormatted: "฿ 320,000,000",
      faction: "Wano Samurai",
      role: "Samurai",
      devilFruit: "None",
      fruitType: "None",
      haki: "Armament",
      color: "#be185d",
      image: "https://static.wikia.nocookie.net/onepiece/images/4/44/Ashura_Doji_Anime_Infobox.png/revision/latest/scale-to-width-down/400?cb=20191201102956",
      quote: "There are no strong men left in this country to follow!"
    };
  } else if (item.name === "Shiki") {
    base = {
      japaneseName: "シキ",
      title: "The Golden Lion",
      bounty: 2500000000,
      bountyFormatted: "฿ 2,500,000,000",
      faction: "Rocks Pirates",
      role: "Captain",
      devilFruit: "Fuwa Fuwa no Mi",
      fruitType: "Paramecia",
      haki: "Conqueror's",
      color: "#eab308",
      image: "https://static.wikia.nocookie.net/onepiece/images/3/32/Shiki_Anime_Infobox.png/revision/latest/scale-to-width-down/400?cb=20230826192523",
      quote: "I'll let you know what true piracy is!"
    };
  } else if (item.name === "Vista") {
    base = {
      japaneseName: "ビスタ",
      title: "Flower Sword Vista",
      bounty: 440000000,
      bountyFormatted: "฿ 440,000,000",
      faction: "Whitebeard Pirates",
      role: "Swordsman",
      devilFruit: "None",
      fruitType: "None",
      haki: "Armament",
      color: "#3b82f6",
      image: "https://static.wikia.nocookie.net/onepiece/images/7/78/Vista_Anime_Infobox.png/revision/latest/scale-to-width-down/271?cb=20180131180522",
      quote: "Only an idiot wouldn't know the name of Dracule Mihawk!"
    };
  } else if (item.name === "Shiryu") {
    base = {
      japaneseName: "シリュウ",
      title: "Shiryu of the Rain",
      bounty: 1100000000,
      bountyFormatted: "฿ 1,110,000,000",
      faction: "Blackbeard Pirates",
      role: "Swordsman",
      devilFruit: "Suke Suke no Mi",
      fruitType: "Paramecia",
      haki: "Armament",
      color: "#475569",
      image: "https://static.wikia.nocookie.net/onepiece/images/4/4a/Shiryu_Anime_Infobox.png/revision/latest/scale-to-width-down/374?cb=20240728020909",
      quote: "I was only waiting for a man like you, Teach!"
    };
  } else if (item.name === "Sentomaru") {
    base = {
      japaneseName: "戦桃丸",
      title: "Captain of the Science Guard",
      bounty: 0,
      bountyFormatted: "฿ 0",
      faction: "Marines",
      role: "Commander",
      devilFruit: "None",
      fruitType: "None",
      haki: "Armament",
      color: "#dc2626",
      image: "https://static.wikia.nocookie.net/onepiece/images/9/97/Sentomaru_Anime_Post_Timeskip_Infobox.png/revision/latest/scale-to-width-down/400?cb=20241117020846",
      quote: "My guard is the tightest in the world!"
    };
  }

  const basePrice = getBasePrice(item.overall);
  const tier = getTier(item.overall);

  return {
    id: item.id,
    name: item.name,
    japaneseName: base.japaneseName || item.name,
    title: base.title || "Pirate",
    bounty: base.bounty || 0,
    bountyFormatted: base.bountyFormatted || (base.bounty ? `฿ ${base.bounty.toLocaleString()}` : "฿ 0"),
    tier: tier,
    faction: base.faction || "Independent",
    role: base.role || "Combatant",
    devilFruit: base.devilFruit || "None",
    fruitType: base.fruitType || "None",
    haki: base.haki || "None",
    stats: {
      attack: item.atk,
      strength: item.str,
      defense: item.def,
      total: item.overall
    },
    color: base.color || "#eab308",
    image: base.image || "",
    quote: base.quote || "To the Grand Line!",
    power: item.overall,
    basePrice: basePrice,
    basePriceFormatted: `฿ ${basePrice / 1000000}M`
  };
});

console.log(`Generated ${newCharacters.length} characters.`);
// Verify all have images
const missingImgs = newCharacters.filter(c => !c.image);
console.log(`Missing images: ${missingImgs.length}`);
if (missingImgs.length > 0) {
  console.log(missingImgs.map(c => c.name));
}

// Check sample
console.log('Sample #1:', newCharacters[0]);
console.log('Sample #62:', newCharacters[61]);
console.log('Sample #141:', newCharacters[140]);
console.log('Sample #146 Akainu:', newCharacters[145]);
console.log('Sample #150 Sentomaru:', newCharacters[149]);

// Write formatted file
const fileOutput = `// Complete 150 Curated One Piece Characters Dataset
// Combat ratings accurately scaled from 150 Character Power Ratings (1-1000 scale)
// Overall = 40% Attack + 30% Strength + 30% Defense

export const CHARACTERS = ${JSON.stringify(newCharacters, null, 2)};
`;

fs.writeFileSync('./data/characters.js', fileOutput, 'utf8');
console.log('Successfully updated ./data/characters.js!');
