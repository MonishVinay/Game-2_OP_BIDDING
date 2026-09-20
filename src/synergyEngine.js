// One Piece Pirate Auction - Synergy & Scoring Engine
// Evaluates crew combat power, faction chemistry, role harmony, lore combos, and economy efficiency.

export function calculateCrewSynergies(squad = [], remainingBerries = 0) {
  if (!squad || squad.length === 0) {
    return {
      basePower: 0,
      factionBonus: 0,
      roleBonus: 0,
      loreBonus: 0,
      economyBonus: 0,
      totalScore: 0,
      activeSynergies: [],
      mvp: null,
      crewTitle: "Drifting Sailors"
    };
  }

  // 1. Base Combat Power
  const basePower = squad.reduce((sum, char) => sum + (char.stats?.total || 250), 0);

  const activeSynergies = [];
  let factionBonus = 0;
  let roleBonus = 0;
  let loreBonus = 0;

  // 2. Faction Synergies
  const factionCounts = {};
  squad.forEach(char => {
    if (char.faction) {
      factionCounts[char.faction] = (factionCounts[char.faction] || 0) + 1;
    }
  });

  Object.entries(factionCounts).forEach(([faction, count]) => {
    if (count >= 4) {
      const bonus = 160;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Armada`,
        type: 'faction',
        badge: '👑 EX Faction',
        description: `4+ members of ${faction} unite! (+${bonus} PTS)`,
        bonus
      });
    } else if (count === 3) {
      const bonus = 95;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Syndicate`,
        type: 'faction',
        badge: '⚔️ SSR Faction',
        description: `3 members of ${faction} fighting side by side! (+${bonus} PTS)`,
        bonus
      });
    } else if (count === 2) {
      const bonus = 45;
      factionBonus += bonus;
      activeSynergies.push({
        name: `${faction} Duo`,
        type: 'faction',
        badge: '🔥 Faction Bond',
        description: `2 members of ${faction} in your crew! (+${bonus} PTS)`,
        bonus
      });
    }
  });

  // 3. Role Harmony (Vital Roles on a Pirate Ship)
  const roles = new Set(squad.map(c => c.role));
  const charNames = new Set(squad.map(c => c.name));

  if (roles.has('Captain')) {
    roleBonus += 25;
    activeSynergies.push({
      name: 'Commanding Will',
      type: 'role',
      badge: '🏴‍☠️ Leadership',
      description: 'Having a true Captain to steer the crew (+25 PTS)',
      bonus: 25
    });
  }

  if (roles.has('Navigator')) {
    roleBonus += 30;
    activeSynergies.push({
      name: 'Log Pose Mastery',
      type: 'role',
      badge: '🧭 Navigation',
      description: 'Navigator safely charting dangerous Grand Line currents (+30 PTS)',
      bonus: 30
    });
  }

  if (roles.has('Doctor')) {
    roleBonus += 30;
    activeSynergies.push({
      name: 'Miracle Healer',
      type: 'role',
      badge: '💊 Medicine',
      description: 'Doctor ready to cure any disease or battle injury (+30 PTS)',
      bonus: 30
    });
  }

  if (roles.has('Cook')) {
    roleBonus += 25;
    activeSynergies.push({
      name: 'All Blue Feast',
      type: 'role',
      badge: '🍖 Nutrition',
      description: 'Cook serving high-morale gourmet banquets (+25 PTS)',
      bonus: 25
    });
  }

  if (roles.has('Shipwright')) {
    roleBonus += 25;
    activeSynergies.push({
      name: 'Treasure Tree Adam Armor',
      type: 'role',
      badge: '🔨 Craftsmanship',
      description: 'Shipwright maintaining hull integrity against cannons (+25 PTS)',
      bonus: 25
    });
  }

  if (roles.has('Swordsman') && (roles.has('Sniper') || roles.has('Vanguard'))) {
    roleBonus += 25;
    activeSynergies.push({
      name: 'Tactical Vanguard & Rearguard',
      type: 'role',
      badge: '🎯 Combat Balance',
      description: 'Combined close-range blade master and long-range fire support (+25 PTS)',
      bonus: 25
    });
  }

  // 4 or more distinct roles bonus
  if (roles.size >= 4) {
    roleBonus += 50;
    activeSynergies.push({
      name: 'Laugh Tale Prepared Crew',
      type: 'role',
      badge: '✨ Grand Harmony',
      description: 'Extremely well-balanced crew with 4+ distinct naval specialties (+50 PTS)',
      bonus: 50
    });
  }

  // 4. Iconic Lore Combos
  const has = (name) => charNames.has(name);

  // Wings of the Pirate King (Zoro + Sanji)
  if (has('Roronoa Zoro') && has('Sanji')) {
    const bonus = 65;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Wings of the Pirate King',
      type: 'lore',
      badge: '⚔️ Dual Wings',
      description: 'Roronoa Zoro & Sanji fighting side by side! (+65 PTS)',
      bonus
    });
  }

  // ASL Brothers' Bond
  const aslCount = [has('Monkey D. Luffy'), has('Portgas D. Ace'), has('Sabo')].filter(Boolean).length;
  if (aslCount === 3) {
    const bonus = 120;
    loreBonus += bonus;
    activeSynergies.push({
      name: "Brothers' Sake Cup (ASL)",
      type: 'lore',
      badge: '🍶 Eternal Brotherhood',
      description: 'Luffy, Ace, and Sabo reunited under one pirate banner! (+120 PTS)',
      bonus
    });
  } else if (aslCount === 2) {
    const bonus = 50;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Sworn Brothers',
      type: 'lore',
      badge: '🔥 Brotherly Flame',
      description: 'Two sworn brothers fighting for the same dream! (+50 PTS)',
      bonus
    });
  }

  // Old Era Legends (Roger + Whitebeard or Garp + Rayleigh)
  if ((has('Gol D. Roger') && has('Edward Newgate (Whitebeard)')) || (has('Monkey D. Garp') && has('Silvers Rayleigh'))) {
    const bonus = 80;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Old Era Titans',
      type: 'lore',
      badge: '🔱 Legendary Era',
      description: 'God Valley legends sharing the battlefield! (+80 PTS)',
      bonus
    });
  }

  // Worst Generation Alliance (Luffy, Law, Kid)
  const worstTrio = [has('Monkey D. Luffy'), has('Trafalgar D. Water Law'), has('Eustass Kid')].filter(Boolean).length;
  if (worstTrio === 3) {
    const bonus = 85;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Rooftop Supernovas',
      type: 'lore',
      badge: '💥 Emperor Topplers',
      description: 'Luffy, Law, and Kid united to overthrow the Yonko! (+85 PTS)',
      bonus
    });
  } else if (worstTrio === 2) {
    const bonus = 40;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Supernova Alliance',
      type: 'lore',
      badge: '⚡ Worst Gen Pact',
      description: 'Two captains of the Worst Generation form a dangerous alliance (+40 PTS)',
      bonus
    });
  }

  // Yonko Calamities (Kaido + King/Queen/Jack)
  if (has('Kaido') && (has('King') || has('Queen') || has('Jack'))) {
    const bonus = 65;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Lead Performers of Onigashima',
      type: 'lore',
      badge: '🐲 Dragon & Calamity',
      description: 'Kaido leading his terrifying Ancient Zoan All-Stars (+65 PTS)',
      bonus
    });
  }

  // Sweet Generals (Katakuri + Cracker or Smoothie or Big Mom)
  if (has('Charlotte Linlin (Big Mom)') && (has('Charlotte Katakuri') || has('Charlotte Perospero'))) {
    const bonus = 60;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Totland Royal Family',
      type: 'lore',
      badge: '🎂 Soul & Mochi',
      description: 'Big Mom with her strongest children defending Whole Cake Island (+60 PTS)',
      bonus
    });
  }

  // Absolute Justice (Sakazuki + Kuzan or Borsalino or Sengoku)
  const marineLegends = [has('Sakazuki (Akainu)'), has('Kuzan (Aokiji)'), has('Borsalino (Kizaru)'), has('Sengoku the Buddha'), has('Issho (Fujitora)')].filter(Boolean).length;
  if (marineLegends >= 2) {
    const bonus = 70;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Marine Headquarters Admirals',
      type: 'lore',
      badge: '⚓ Absolute Justice',
      description: 'Admirals executing supreme naval justice across the seas! (+70 PTS)',
      bonus
    });
  }

  // Mink Kings of Mokomo (Inuarashi + Nekomamushi or Pedro + Carrot)
  if (has('Inuarashi') && has('Nekomamushi')) {
    const bonus = 50;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Mokomo Dukedom Rulers',
      type: 'lore',
      badge: '🌙 Day & Night Sulong',
      description: 'Duke Inuarashi and Master Nekomamushi unleashing Sulong power (+50 PTS)',
      bonus
    });
  }

  // Germa 66 Tech (Judge + siblings)
  const germaCount = squad.filter(c => c.faction === 'Germa 66').length;
  if (germaCount >= 3) {
    const bonus = 60;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Germa 66 War Armada',
      type: 'lore',
      badge: '⚡ Exoskeleton Science',
      description: 'Vinsmoke royal family synchronized in raid suits! (+60 PTS)',
      bonus
    });
  }

  // God & King (Luffy + Usopp)
  if (has('Monkey D. Luffy') && has('Usopp')) {
    const bonus = 35;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'God & Pirate King',
      type: 'lore',
      badge: '✨ God Usopp Blessing',
      description: 'God Usopp providing supernatural luck and legendary sniping! (+35 PTS)',
      bonus
    });
  }

  // Doctor & Mentor (Chopper + Kureha or Hiriluk)
  if (has('Tony Tony Chopper') && (has('Dr. Hiriluk') || has('Kureha'))) {
    const bonus = 45;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Sakura Blossom Medicine',
      type: 'lore',
      badge: '🌸 Inherited Will',
      description: 'Dr. Hiriluk & Chopper spreading the miracle cherry blossom cure (+45 PTS)',
      bonus
    });
  }

  // Cross Guild Founders (Buggy + Crocodile or Mihawk)
  if (has('Buggy') && (has('Crocodile') || has('Dracule Mihawk'))) {
    const bonus = 55;
    loreBonus += bonus;
    activeSynergies.push({
      name: 'Cross Guild Syndicate',
      type: 'lore',
      badge: '💰 Marine Bounties',
      description: 'Emperor Buggy putting bounties on Marine heads with Mihawk & Crocodile! (+55 PTS)',
      bonus
    });
  }

  // Water 7 Shipwrights (Tom + Franky or Iceburg)
  if (has('Tom') && (has('Franky') || has('Iceburg'))) {
    const bonus = 45;
    loreBonus += bonus;
    activeSynergies.push({
      name: "Shipbuilders of the Sea Train",
      type: 'lore',
      badge: '🚂 Built with a DON!',
      description: 'Tom-san and his pupils forging indestructible seafaring vessels (+45 PTS)',
      bonus
    });
  }

  // 5. Economy Efficiency (Remaining Berries)
  // 1 point per 5,000,000 berries saved, up to +40 max points
  const economyBonus = Math.min(40, Math.floor((remainingBerries || 0) / 5000000));
  if (economyBonus > 0) {
    activeSynergies.push({
      name: 'War Chest Reserve',
      type: 'economy',
      badge: '💰 Tactical Berries',
      description: `Preserved ${Math.floor(remainingBerries / 1000000)}M ฿ in surplus treasure (+${economyBonus} PTS)`,
      bonus: economyBonus
    });
  }

  // 6. Total Score
  const totalScore = basePower + factionBonus + roleBonus + loreBonus + economyBonus;

  // 7. MVP Determination
  const mvp = squad.reduce((best, char) => {
    return (!best || (char.stats?.total || 0) > (best.stats?.total || 0)) ? char : best;
  }, null);

  // 8. Dynamic Pirate Crew Title
  let crewTitle = "Grand Line Buccaneers";
  if (totalScore >= 2000) {
    crewTitle = "Emperors of the Grand Line";
  } else if (totalScore >= 1800) {
    crewTitle = "Future Pirate King Armada";
  } else if (aslCount >= 2 || (has('Monkey D. Luffy') && has('Roronoa Zoro'))) {
    crewTitle = "Straw Hat Successors";
  } else if (marineLegends >= 2) {
    crewTitle = "Supreme Justice Fleet";
  } else if (factionCounts['Beasts Pirates'] >= 2) {
    crewTitle = "Calamity Warlords";
  } else if (roles.size >= 4) {
    crewTitle = "Master Navigators of the All Blue";
  } else if (totalScore >= 1400) {
    crewTitle = "Conquerors of the New World";
  } else {
    crewTitle = "Fearsome High-Seas Corsairs";
  }

  return {
    basePower,
    factionBonus,
    roleBonus,
    loreBonus,
    economyBonus,
    totalScore,
    activeSynergies,
    mvp,
    crewTitle
  };
}
