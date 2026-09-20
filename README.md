# 🏴‍☠️ Grand Line Pirate Auction (One Piece Multiplayer Bidding Game)

A real-time multiplayer bidding website where 2 to 8 players compete in an auction to assemble their ultimate One Piece pirate crew from **150 popular characters**. Players manage a starting berry budget, draft an exact squad size (3–10 characters as configured by the host), activate powerful faction & lore synergies, and claim victory on the Grand Line Leaderboard!

---

## 🌟 Key Features

- **150 Popular One Piece Characters**:
  - Curated roster of 150 unique characters.
  - Complete with authentic bounties, roles, factions, devil fruits, haki, combat stats (ATK, DEF, HAKI, SKILL), and character artwork with custom fallback Wanted Posters.
- **Real-Time Multiplayer (2–8 Players)**:
  - Powered by Socket.io (WebSocket + HTTP Polling fallback).
  - Designed for playing with friends overseas as well as locally on LAN or single machine multi-tab.
  - Shareable Room Codes & direct invite links (`?room=LUFFY`).
  - Optional **AI Bot Captains** ("Straw Hat Bot", "Beast Bot", etc.) to test or fill rooms immediately.
- **Strict Budget & Squad Rules**:
  - **Configurable Squad Size**: Host chooses target squad size `N` (between 3 and 10 characters).
  - **No more, no less**: Once a player recruits `N` characters, their squad is full and bidding is locked.
  - **Solvency Protection**: Prevents players from bidding so much that they cannot afford their remaining required slots.
  - **Anti-Sniping Clock**: Bids placed with < 4 seconds remaining reset the clock to allow counter-bidding.
- **Deep Synergy & Scoring Engine**:
  - **Faction Alliances**: Straw Hat Pirates, Beasts Pirates, Big Mom Pirates, Marines, Whitebeard Pirates, Wano Samurai, etc. (2 members: +45 PTS, 3 members: +95 PTS, 4+ members: +160 PTS).
  - **Naval Role Harmony**: Having vital utility roles on your ship (Captain, Navigator, Doctor, Cook, Shipwright, Vanguard/Sniper combo) grants massive navigational viability bonuses!
  - **Iconic Lore Combos**:
    - *Wings of the Pirate King* (Zoro + Sanji): +65 PTS
    - *Brothers' Sake Cup (ASL)* (Luffy + Ace + Sabo): +120 PTS
    - *Old Era Titans* (Roger + Whitebeard or Garp + Rayleigh): +80 PTS
    - *Rooftop Supernovas* (Luffy + Law + Kid): +85 PTS
    - *Yonko Calamities* (Kaido + King/Queen/Jack): +65 PTS
    - *Absolute Justice Admirals* (Akainu + Aokiji/Kizaru/Fujitora/Sengoku): +70 PTS
    - *Mokomo Dukedom Rulers* (Inuarashi + Nekomamushi): +50 PTS
    - *Cross Guild Syndicate* (Buggy + Crocodile/Mihawk): +55 PTS
    - *Sakura Blossom Medicine* (Chopper + Dr. Hiriluk/Kureha): +45 PTS
    - And many more!
  - **Treasure Reserve Bonus**: Tactical points awarded for remaining Berries.
- **Wanted Poster UI & Procedural Web Audio**:
  - Parchment aesthetics, woodcut serif typography, Marine bounty notices.
  - Zero-asset procedural Web Audio sound effects: auction gavel strike, coin chimes, countdown heartbeat, and victory fanfare!

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Frontend & Start Server
```bash
npm run build
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

To test multiplayer on your local computer, simply open multiple browser tabs or an incognito window and join the room code!

---

## 🌐 How to Deploy to Render (Play with Friends Worldwide)

This project is pre-configured for **Render** using a single unified Node.js service that serves both the Socket.io WebSocket backend and the compiled React frontend.

### Option A: Using `render.yaml` (Render Blueprint)
1. Push this repository to your GitHub account.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure everything.
4. Click **Apply**.

### Option B: Manual Web Service Setup on Render
1. In [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `op-bidding` (or your choice)
   - **Environment**: `Node`
   - **Region**: Any (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Click **Create Web Service**.

Once deployed, Render gives you a public URL (e.g. `https://op-bidding.onrender.com`).
Share this link with your friends anywhere in the world! When they click on an invite link with your room code (e.g. `https://op-bidding.onrender.com/?room=LUFFY`), they will join your auction table instantly.

---

## 🎮 How to Play

1. **Host Creates a Room**:
   - Host chooses a Pirate Name and Jolly Roger avatar.
   - Adjusts game settings:
     - **Squad Size**: 3 to 10 characters per player.
     - **Starting Budget**: 50M ฿, 100M ฿, 200M ฿, or 500M ฿.
     - **Bid Timer**: 5s, 10s, 15s, or 20s.
     - **Min Bid Increment**: +1M ฿, +5M ฿, or +10M ฿.
   - Host clicks **Copy Link** to share with friends, or clicks **+ Add AI Bot** to test or play solo.
2. **The Auction Begins**:
   - Characters are presented one by one on the center auction block.
   - Place bids using quick increment buttons or custom Berry input.
   - Any bid under 4 seconds resets the timer to 4 seconds to prevent last-millisecond sniping.
   - If a player wins a lot, the cost is deducted from their Berry balance and the character joins their crew.
   - Once a player reaches their target squad size, their squad is complete and they can sit back and watch.
3. **Grand Line Victory Ceremony**:
   - When all captains have drafted their full squad, the auction concludes.
   - The system tallies **Base Combat Stats + Faction Alliances + Naval Role Harmony + Lore Combos + Berry Economy**.
   - Confetti explodes, the Pirate King is crowned on the podium, and the complete crew breakdown is revealed!
