import fs from 'fs';
import { CHARACTERS } from '../data/characters.js';

const WIKI_TITLE_MAP = {
  "Marshall D. Teach (Blackbeard)": "Marshall D. Teach",
  "Edward Newgate (Whitebeard)": "Edward Newgate",
  "Bentham (Bon Clay)": "Bentham",
  "Donquixote Rosinante (Corazon)": "Donquixote Rosinante",
  "Daz Bonez (Mr. 1)": "Daz Bonez",
  "Kikunojo (Kiku)": "Kikunojo",
  "Issho (Fujitora)": "Issho",
  "Sakazuki (Akainu)": "Sakazuki",
  "Charlotte Linlin (Big Mom)": "Charlotte Linlin",
  "Kuzan (Aokiji)": "Kuzan",
  "Borsalino (Kizaru)": "Borsalino",
  "Hachi (Hatchan)": "Hatchan",
  "Sengoku the Buddha": "Sengoku",
  "Mr. 3 Galdino": "Galdino",
  "Rocks D. Xebec": "Rocks D. Xebec",
  "Ashura Doji": "Ashura Doji",
  "Baby 5": "Baby 5",
  "Kozuki Oden": "Kouzuki Oden",
  "Momonosuke": "Kouzuki Momonosuke",
  "Kozuki Hiyori": "Kouzuki Hiyori",
  "Izo": "Izou",
  "Kaido": "Kaidou",
  "King": "King",
  "Queen": "Queen",
  "Jack": "Jack",
  "Who's-Who": "Who's-Who",
  "Charlotte Brulee": "Charlotte Brûlée",
  "Don Krieg": "Krieg",
  "Miss Goldenweek": "Marianne",
  "Mr. 5": "Gem",
  "Miss Valentine": "Mikita",
  "Don Chinjao": "Chinjao",
  "Marco the Phoenix": "Polo Marco",
  "Ryuma": "Shimotsuki Ryuma",
  "Dr. Hiriluk": "Hiriluk",
  "Fullbody": "Fullbody",
  "Alvida": "Alvida",
  "Wapol": "Wapol",
  "Nefertari Vivi": "Nefertari Vivi",
  "Nefertari Cobra": "Nefertari Cobra",
  "Pell": "Pell",
  "Koza": "Koza",
  "Rebecca": "Rebecca",
  "Kyros": "Kyros",
  "Riku Doldo III": "Riku Doldo III",
  "Viola": "Viola",
  "Bartolomeo": "Bartolomeo",
  "Cavendish": "Cavendish",
  "Sai": "Sai",
  "Leo": "Leo",
  "Orlumbus": "Orlumbus",
  "Hajrudin": "Hajrudin",
  "Ideo": "Ideo",
  "Foxy": "Foxy",
  "Kureha": "Kureha",
  "Laboon": "Laboon",
  "Tom": "Tom",
  "Iceburg": "Iceburg",
  "Paulie": "Paulie",
  "Kaku": "Kaku"
};

async function fetchWikiThumbnails(titles) {
  const queryTitles = titles.map(t => WIKI_TITLE_MAP[t] || t).join('|');
  const url = `https://onepiece.fandom.com/api.php?action=query&titles=${encodeURIComponent(queryTitles)}&prop=pageimages&format=json&pithumbsize=400`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OnePieceBiddingApp/1.0 (contact: pirate@grandline.com)'
      }
    });
    if (!res.ok) return {};
    const data = await res.json();
    const map = {};
    if (data.query && data.query.pages) {
      Object.values(data.query.pages).forEach(page => {
        if (page.thumbnail && page.thumbnail.source) {
          map[page.title] = page.thumbnail.source;
        }
      });
    }
    return map;
  } catch (err) {
    console.error('Fetch error:', err.message);
    return {};
  }
}

async function main() {
  console.log('--- FETCHING REAL CHARACTER IMAGES FROM ONE PIECE WIKI ---');

  // Batch in chunks of 30
  const chunks = [];
  for (let i = 0; i < CHARACTERS.length; i += 30) {
    chunks.push(CHARACTERS.slice(i, i + 30));
  }

  const allThumbnails = {};

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const titles = chunk.map(c => c.name);
    console.log(`Querying batch ${i + 1}/${chunks.length} (${chunk.length} characters)...`);
    const thumbnails = await fetchWikiThumbnails(titles);
    Object.assign(allThumbnails, thumbnails);
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`Total thumbnail mappings retrieved: ${Object.keys(allThumbnails).length}`);

  let matchedCount = 0;
  const imageMap = {};

  CHARACTERS.forEach(char => {
    const wikiTitle = WIKI_TITLE_MAP[char.name] || char.name;
    const directUrl = allThumbnails[wikiTitle];

    if (directUrl) {
      matchedCount++;
      imageMap[char.id] = directUrl;
    } else {
      console.log(`Unmatched: ID ${char.id} - "${char.name}" (queried as "${wikiTitle}")`);
    }
  });

  console.log(`\nMatched ${matchedCount} / ${CHARACTERS.length} characters!`);
  fs.writeFileSync('./data/fetched-images.json', JSON.stringify(imageMap, null, 2));
  console.log('Saved fetched image map to ./data/fetched-images.json');
}

main();
