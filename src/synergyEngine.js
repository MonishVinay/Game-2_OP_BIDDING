// One Piece Pirate Auction - Synergy & Scoring Engine
// Scaled down synergies: Maximum combined synergy bonus is hard-capped at 150 score.
// Faction chemistry, vital naval role harmony, iconic lore combos, and treasure reserves.

export const MAX_SYNERGY_SCORE = 150;

export function calculateCrewSynergies(squad = [], remainingBerries = 0) {
  if (!squad || squad.length === 0) {
    return {
      basePower: 0,
      factionBonus: 0,
      roleBonus: 0,
      loreBonus: 0,
      totalSynergyBonus: 0,
      economyBonus: 0,
      totalScore: 0,
      activeSynergies: [],
      mvp: null,
      crewTitle: "Drifting Sailors"
    };
  }

  // 1. Base Combat Power (Sum of character power from 1-1000 ratings)
  const basePower = squad.reduce((sum, char) => sum + (char.power || char.stats?.total || 50), 0);

  const activeSynergies = [];
  let factionBonus = 0;
  let roleBonus = 0;
  let loreBonus = 0;

  // 2. Faction Synergies (Scaled: +15, +30, +45)
  const factionCounts = {};
  squad.forEach(char => {
    if (char.faction) {
      factionCounts[char.faction] = (factionCounts[char.faction] || 0) + 1;
    }
  });

  Object.entries(factionCounts).forEach(([faction, count]) => {
    if (count >= 4) {
      const bonus = 45;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Armada`,
        type: 'faction',
        badge: '👑 EX Faction (+45 PTS)',
        description: `4+ members of ${faction} united under one banner! (+${bonus} PTS)`,
        bonus
      });
    } else if (count === 3) {
      const bonus = 30;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Syndicate`,
        type: 'faction',
        badge: '⚔️ SSR Faction (+30 PTS)',
        description: `3 members of ${faction} fighting side by side! (+${bonus} PTS)`,
        bonus
      });
    } else if (count === 2) {
      const bonus = 15;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Bond`,
        type: 'faction',
        badge: '🔥 Faction Synergy (+15 PTS)',
        description: `2 members of ${faction} coordinating attacks! (+${bonus} PTS)`,
        bonus
      });
    }
  });

  // 3. Role Harmony (Vital naval roles, Scaled: +15 to +25)
  const roles = new Set(squad.map(c => c.role));
  const charNames = new Set(squad.map(c => c.name));

  if (roles.has('Captain')) {
    const bonus = 15;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Commanding Will',
      type: 'role',
      badge: '🏴‍☠️ Leadership',
      description: `Having a charismatic Captain to guide the fleet (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.has('Navigator')) {
    const bonus = 20;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Log Pose Navigation',
      type: 'role',
      badge: '🧭 Grand Line Navigator',
      description: `Navigator charting safe courses across the sea (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.has('Doctor')) {
    const bonus = 20;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Miracle Healer',
      type: 'role',
      badge: '💊 Medical Vitality',
      description: `Doctor curing lethal poisons and battle damage (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.has('Cook')) {
    const bonus = 15;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'All Blue Banquet',
      type: 'role',
      badge: '🍖 High Morale',
      description: `Cook preparing stamina-restoring feasts (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.has('Shipwright')) {
    const bonus = 15;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Adam Wood Plating',
      type: 'role',
      badge: '🔨 Naval Architecture',
      description: `Shipwright maintaining vessel hull through heavy cannon fire (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.has('Swordsman') && (roles.has('Sniper') || roles.has('Vanguard'))) {
    const bonus = 15;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Dual Vanguard & Sniper Coverage',
      type: 'role',
      badge: '🎯 Combat Balance',
      description: `Close-quarters blade combat backed by long-range precision sniping (+${bonus} PTS)`,
      bonus
    });
  }

  if (roles.size >= 4) {
    const bonus = 25;
    roleBonus += bonus;
    activeSynergies.push({
      name: 'Laugh Tale Prepared Armada',
      type: 'role',
      badge: '✨ Grand Harmony',
      description: `Exceptionally well-balanced crew with 4+ naval roles (+${bonus} PTS)`,
      bonus
    });
  }

  // 4. Iconic Lore Combos (Scaled: +15 to +40)
  const has = (name) => {
    if (charNames.has(name)) return true;
    for (const n of charNames) {
      if (n.includes(name) || name.includes(n)) return true;
    }
    return false;
  };

  if (has('Roronoa Zoro') && has('Sanji')) {
    const bonus = 30;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Wings of the Pirate King',
      type: 'lore',
      badge: '⚔️ Dual Wings',
      description: `Roronoa Zoro & Sanji fighting in tandem! (+${bonus} PTS)`,
      bonus
    });
  }

  const aslCount = [has('Monkey D. Luffy'), has('Portgas D. Ace'), has('Sabo')].filter(Boolean).length;
  if (aslCount === 3) {
    const bonus = 40;
    loreBonus += bonus;
    activeSynergies.push({
      name: "Brothers' Sake Cup (ASL)",
      type: 'lore',
      badge: '🍶 Eternal Brotherhood',
      description: `Luffy, Ace, and Sabo fighting for the same dream! (+${bonus} PTS)`,
      bonus
    });
  } else if (aslCount === 2) {
    const bonus = 20;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Sworn Brothers',
      type: 'lore',
      badge: '🔥 Brotherly Bond',
      description: `Two sworn brothers reunited in battle (+${bonus} PTS)`,
      bonus
    });
  }

  if ((has('Gol D. Roger') && has('Edward Newgate (Whitebeard)')) || (has('Monkey D. Garp') && has('Silvers Rayleigh'))) {
    const bonus = 35;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Old Era Titans',
      type: 'lore',
      badge: '🔱 God Valley Era',
      description: `Legendary titans from the golden age of piracy (+${bonus} PTS)`,
      bonus
    });
  }

  const worstTrio = [has('Monkey D. Luffy'), has('Trafalgar D. Water Law'), has('Eustass Kid')].filter(Boolean).length;
  if (worstTrio === 3) {
    const bonus = 35;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Rooftop Supernovas',
      type: 'lore',
      badge: '💥 Yonko Topplers',
      description: `Luffy, Law, and Kid united to overthrow the Old Era! (+${bonus} PTS)`,
      bonus
    });
  } else if (worstTrio === 2) {
    const bonus = 15;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Supernova Alliance',
      type: 'lore',
      badge: '⚡ Worst Gen Pact',
      description: `Worst Generation captains forming an alliance (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Kaido') && (has('King') || has('Queen') || has('Jack'))) {
    const bonus = 30;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Lead Performers of Onigashima',
      type: 'lore',
      badge: '🐲 Calamity Vanguard',
      description: `Kaido leading his terrifying Ancient Zoan All-Stars (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Charlotte Linlin (Big Mom)') && (has('Charlotte Katakuri') || has('Charlotte Perospero') || has('Charlotte Smoothie'))) {
    const bonus = 30;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Totland Royal Family',
      type: 'lore',
      badge: '🎂 Sweet Generals',
      description: `Big Mom with her strongest children defending Whole Cake Island (+${bonus} PTS)`,
      bonus
    });
  }

  const marineLegends = [has('Akainu'), has('Aokiji'), has('Kizaru'), has('Sengoku'), has('Fujitora')].filter(Boolean).length;
  if (marineLegends >= 2) {
    const bonus = 35;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Marine Headquarters Admirals',
      type: 'lore',
      badge: '⚓ Absolute Justice',
      description: `Admirals enforcing total marine justice! (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Inuarashi') && has('Nekomamushi')) {
    const bonus = 20;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Mokomo Dukedom Rulers',
      type: 'lore',
      badge: '🌙 Day & Night Sulong',
      description: `Duke Inuarashi and Master Nekomamushi in Sulong resonance (+${bonus} PTS)`,
      bonus
    });
  }

  const germaCount = squad.filter(c => c.faction === 'Germa 66').length;
  if (germaCount >= 3) {
    const bonus = 25;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Germa 66 Royal Fleet',
      type: 'lore',
      badge: '⚡ Exoskeleton Science',
      description: `Vinsmoke royal family fully equipped in raid suits! (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Monkey D. Luffy') && has('Usopp')) {
    const bonus = 15;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'God & Pirate King',
      type: 'lore',
      badge: '✨ God Usopp Blessing',
      description: `God Usopp providing miraculous battle fortune! (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Tony Tony Chopper') && (has('Dr. Hiriluk') || has('Kureha'))) {
    const bonus = 20;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Sakura Blossom Medicine',
      type: 'lore',
      badge: '🌸 Inherited Will',
      description: `Dr. Hiriluk & Chopper spreading the miracle cherry blossom medicine (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Buggy') && (has('Crocodile') || has('Dracule Mihawk'))) {
    const bonus = 30;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Cross Guild Syndicate',
      type: 'lore',
      badge: '💰 Marine Bounties',
      description: `Cross Guild putting bounties on Navy Admiral heads! (+${bonus} PTS)`,
      bonus
    });
  }

  if (has('Tom') && (has('Franky') || has('Iceburg'))) {
    const bonus = 20;
    loreBonus += bonus;
    activeSynergies.push({
      name: "Shipbuilders of the Sea Train",
      type: 'lore',
      badge: '🚂 Built with a DON!',
      description: `Tom-san and his apprentices building legendary vessels (+${bonus} PTS)`,
      bonus
    });
  }

  // 5. HARD CAP: Synergies can add up to a MAXIMUM of 150 score
  const rawSynergyTotal = factionBonus + roleBonus + loreBonus;
  let totalSynergyBonus = rawSynergyTotal;

  if (rawSynergyTotal > MAX_SYNERGY_SCORE) {
    const scale = MAX_SYNERGY_SCORE / rawSynergyTotal;
    factionBonus = Math.round(factionBonus * scale);
    roleBonus = Math.round(roleBonus * scale);
    loreBonus = MAX_SYNERGY_SCORE - factionBonus - roleBonus; // Ensures exact sum = 150
    totalSynergyBonus = MAX_SYNERGY_SCORE;

    // Proportionally scale active synergy cards so displayed bonuses sum to 150
    let remaining = MAX_SYNERGY_SCORE;
    activeSynergies.forEach((syn, i) => {
      if (i === activeSynergies.length - 1) {
        syn.bonus = remaining;
      } else {
        syn.bonus = Math.max(1, Math.round(syn.bonus * scale));
        remaining -= syn.bonus;
      }
      syn.description = syn.description.replace(/\(\+\d+\s*PTS\)/, `(+${syn.bonus} PTS)`);
    });
  }

  // 6. Economy Reserve (Remaining Berries)
  // 1 point per 2,000,000 berries saved (modest reward for smart budgeting)
  const economyBonus = Math.floor((remainingBerries || 0) / 2000000);
  if (economyBonus > 0) {
    activeSynergies.push({
      name: 'War Chest Reserve',
      type: 'economy',
      badge: '💰 Tactical Berries',
      description: `Preserved surplus treasure (+${economyBonus} PTS)`,
      bonus: economyBonus
    });
  }

  // 7. Total Score
  const totalScore = basePower + totalSynergyBonus + economyBonus;

  // 8. MVP Determination
  const mvp = squad.reduce((best, char) => {
    const pwr = char.power || char.stats?.total || 0;
    const bestPwr = best ? (best.power || best.stats?.total || 0) : 0;
    return (!best || pwr > bestPwr) ? char : best;
  }, null);

  // 9. Dynamic Pirate Crew Title (Calibrated to 1000-point scale + max 150 synergy)
  let crewTitle = "Grand Line Buccaneers";
  if (totalScore >= 4500) {
    crewTitle = "Emperors of the Grand Line";
  } else if (totalScore >= 3800) {
    crewTitle = "Future Pirate King Armada";
  } else if (aslCount >= 2 || (has('Monkey D. Luffy') && has('Roronoa Zoro'))) {
    crewTitle = "Straw Hat Successors";
  } else if (marineLegends >= 2) {
    crewTitle = "Supreme Justice Fleet";
  } else if (factionCounts['Beasts Pirates'] >= 2) {
    crewTitle = "Calamity Warlords";
  } else if (roles.size >= 4) {
    crewTitle = "Master Navigators of the All Blue";
  } else if (totalScore >= 3000) {
    crewTitle = "Conquerors of the New World";
  } else {
    crewTitle = "Fearsome High-Seas Corsairs";
  }

  return {
    basePower,
    factionBonus,
    roleBonus,
    loreBonus,
    totalSynergyBonus,
    economyBonus,
    totalScore,
    activeSynergies,
    mvp,
    crewTitle
  };
}
