import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { CHARACTERS } from './data/characters.js';
import { calculateCrewSynergies } from './src/synergyEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Serve static assets from built Vite client (for production / Render)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check API for Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), totalCharacters: CHARACTERS.length });
});

// Character roster API endpoint
app.get('/api/characters', (req, res) => {
  res.json(CHARACTERS);
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode before build, serve a fallback info page
      res.send(`<h1>One Piece Pirate Auction Server Running</h1><p>Frontend is running on Vite dev server or run <code>npm run build</code> to serve production assets.</p>`);
    }
  });
});

// --- IN-MEMORY ROOM MANAGER ---
const rooms = new Map();

// Helper to generate a fun One Piece themed room code
function generateRoomCode() {
  const words = ['LUFFY', 'ZORO', 'NAMI', 'SANJI', 'CHOPPER', 'ROBIN', 'FRANKY', 'BROOK', 'JINBE', 'ACE', 'SABO', 'SHANKS', 'WANO', 'ROGER', 'SUNNY', 'MERRY'];
  let code = words[Math.floor(Math.random() * words.length)];
  if (rooms.has(code)) {
    code = `${code}${Math.floor(10 + Math.random() * 90)}`;
  }
  return code;
}

// Fisher-Yates array shuffle
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Bot Pirate Names & Avatars
const BOT_TEMPLATES = [
  { name: 'Straw Hat Bot', avatar: '👒' },
  { name: 'Red Hair Bot', avatar: '🗡️' },
  { name: 'Heart Pirates Bot', avatar: '🐻' },
  { name: 'Beast Bot', avatar: '🐲' },
  { name: 'Big Mom Bot', avatar: '🍰' },
  { name: 'Navy Admiral Bot', avatar: '⚓' },
  { name: 'Cross Guild Bot', avatar: '🎪' }
];

function createRoom(hostSocketId, settings = {}) {
  const code = generateRoomCode();
  const room = {
    code,
    hostId: hostSocketId,
    settings: {
      squadSize: settings.squadSize || 5, // 3 to 10
      startingBudget: settings.startingBudget || 100000000, // default 100M Berries
      timerDuration: settings.timerDuration || 10, // seconds
      minBidIncrement: settings.minBidIncrement || 5000000, // 5M
      auctionPoolSize: settings.auctionPoolSize || 50 // 25, 50, 75, 100, 150
    },
    players: [],
    deck: shuffleArray(CHARACTERS),
    currentLotIndex: -1,
    currentLot: null,
    currentBid: 0,
    highestBidder: null,
    timer: 10,
    timerInterval: null,
    status: 'lobby', // 'lobby' | 'auction' | 'sold_delay' | 'game_over'
    bidHistory: [],
    round: 0
  };
  rooms.set(code, room);
  return room;
}

// Broadcast room state to all clients in room
function broadcastRoom(code) {
  const room = rooms.get(code);
  if (!room) return;

  const sanitizedRoom = {
    code: room.code,
    hostId: room.hostId,
    settings: room.settings,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      berries: p.berries,
      squad: p.squad,
      isReady: p.isReady,
      isHost: p.id === room.hostId,
      isBot: p.isBot,
      hasPassed: p.hasPassed,
      isSquadFull: p.squad.length >= room.settings.squadSize
    })),
    currentLot: room.currentLot,
    currentBid: room.currentBid,
    highestBidder: room.highestBidder ? {
      id: room.highestBidder.id,
      name: room.highestBidder.name,
      avatar: room.highestBidder.avatar
    } : null,
    timer: room.timer,
    status: room.status,
    bidHistory: room.bidHistory,
    round: room.round
  };

  io.to(code).emit('room_update', sanitizedRoom);
}

// Check if all players have filled their squad
function checkAllSquadsFilled(room) {
  const target = room.settings.squadSize;
  return room.players.every(p => p.squad.length >= target);
}

// Start auction for next character in deck
function startNextLot(code) {
  const room = rooms.get(code);
  if (!room) return;

  // Clear any existing timer
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  // Check if every player has achieved their target squad size
  if (checkAllSquadsFilled(room)) {
    endGame(code);
    return;
  }

  // Advance to next character
  room.currentLotIndex++;
  if (room.currentLotIndex >= room.deck.length) {
    // If deck runs out, reshuffle
    room.deck = shuffleArray(CHARACTERS);
    room.currentLotIndex = 0;
  }

  room.currentLot = room.deck[room.currentLotIndex];
  // Base opening price for every character (proportional to bounty/tier)
  room.currentBid = room.currentLot.basePrice || Math.max(1000000, room.settings.minBidIncrement);
  room.highestBidder = null;
  room.bidHistory = [];
  room.timer = room.settings.timerDuration;
  room.status = 'auction';
  room.round++;

  // Reset player pass states
  room.players.forEach(p => {
    p.hasPassed = false;
  });

  broadcastRoom(code);
  io.to(code).emit('lot_started', {
    character: room.currentLot,
    startingBid: room.currentBid,
    round: room.round
  });

  // Start timer interval
  runLotTimer(code);

  // Trigger initial bot decisions
  triggerBotBidding(code);
}

function runLotTimer(code) {
  const room = rooms.get(code);
  if (!room) return;

  room.timerInterval = setInterval(() => {
    const currentRoom = rooms.get(code);
    if (!currentRoom || currentRoom.status !== 'auction') {
      clearInterval(room.timerInterval);
      return;
    }

    currentRoom.timer--;
    io.to(code).emit('timer_tick', { timer: currentRoom.timer });

    // Bot bidding check on ticks
    if (currentRoom.timer > 1) {
      triggerBotBidding(code);
    }

    if (currentRoom.timer <= 0) {
      clearInterval(currentRoom.timerInterval);
      currentRoom.timerInterval = null;
      resolveLot(code);
    }
  }, 1000);
}

function resolveLot(code) {
  const room = rooms.get(code);
  if (!room) return;

  room.status = 'sold_delay';

  if (room.highestBidder) {
    // Deduct berries and add character to winner's squad
    const winner = room.players.find(p => p.id === room.highestBidder.id);
    if (winner) {
      winner.berries -= room.currentBid;
      winner.squad.push(room.currentLot);

      io.to(code).emit('lot_sold', {
        character: room.currentLot,
        winner: {
          id: winner.id,
          name: winner.name,
          avatar: winner.avatar
        },
        amount: room.currentBid,
        isSquadFull: winner.squad.length >= room.settings.squadSize
      });
    }
  } else {
    // Unsold
    io.to(code).emit('lot_unsold', {
      character: room.currentLot
    });
  }

  broadcastRoom(code);

  // Check if auction is completed for all
  if (checkAllSquadsFilled(room)) {
    setTimeout(() => {
      endGame(code);
    }, 3000);
  } else {
    // 3.5 second suspense before next lot
    setTimeout(() => {
      startNextLot(code);
    }, 3500);
  }
}

// Bot AI Bidding Logic
function triggerBotBidding(code) {
  const room = rooms.get(code);
  if (!room || room.status !== 'auction' || !room.currentLot) return;

  const eligibleBots = room.players.filter(p => 
    p.isBot && 
    !p.hasPassed && 
    p.squad.length < room.settings.squadSize &&
    (!room.highestBidder || room.highestBidder.id !== p.id)
  );

  eligibleBots.forEach(bot => {
    // Check if bot can afford bid while keeping required reserves
    const remainingSlots = room.settings.squadSize - bot.squad.length;
    const reserveNeeded = (remainingSlots - 1) * room.settings.minBidIncrement;
    const maxAffordable = bot.berries - reserveNeeded;

    const nextBid = room.highestBidder ? room.currentBid + room.settings.minBidIncrement : room.currentBid;

    if (nextBid > maxAffordable) {
      bot.hasPassed = true;
      return;
    }

    // Bot valuation based on character bounty-proportional power scaling
    const botBudgetShare = room.settings.startingBudget / room.settings.squadSize;
    const powerRatio = Math.min(2.0, Math.max(0.3, (room.currentLot.power || 500) / 1200));
    const botTargetMaxBid = Math.min(maxAffordable, Math.max(room.currentLot.basePrice || 1000000, botBudgetShare * powerRatio));

    // Decision to bid
    if (nextBid <= botTargetMaxBid && Math.random() < 0.45) {
      setTimeout(() => {
        const liveRoom = rooms.get(code);
        if (liveRoom && liveRoom.status === 'auction' && liveRoom.currentLot?.id === room.currentLot?.id) {
          processBid(code, bot.id, nextBid);
        }
      }, Math.floor(800 + Math.random() * 1800));
    }
  });
}

function processBid(code, playerId, bidAmount) {
  const room = rooms.get(code);
  if (!room || room.status !== 'auction') {
    return { success: false, error: 'Auction is not active' };
  }

  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, error: 'Player not in room' };
  }

  // Check 1: Is squad already full?
  if (player.squad.length >= room.settings.squadSize) {
    return { success: false, error: `Squad already complete with ${room.settings.squadSize} characters!` };
  }

  // Check 2: Did player hold current highest bid?
  if (room.highestBidder && room.highestBidder.id === playerId) {
    return { success: false, error: 'You are already the highest bidder!' };
  }

  // Check 3: Is bid higher than current bid?
  const minRequired = room.highestBidder ? room.currentBid + room.settings.minBidIncrement : room.currentBid;
  if (bidAmount < minRequired) {
    return { success: false, error: `Minimum bid required is ฿ ${(minRequired / 1000000).toFixed(1)}M` };
  }

  // Check 4: Can player afford bid?
  if (bidAmount > player.berries) {
    return { success: false, error: 'Insufficient Berries!' };
  }

  // Check 5: Solvency check for remaining required squad slots
  const remainingSlots = room.settings.squadSize - player.squad.length;
  const reserveNeeded = (remainingSlots - 1) * room.settings.minBidIncrement;
  if (player.berries - bidAmount < reserveNeeded) {
    return { 
      success: false, 
      error: `Must reserve at least ฿ ${(reserveNeeded / 1000000).toFixed(1)}M for remaining ${remainingSlots - 1} slots!` 
    };
  }

  // Accept bid!
  room.currentBid = bidAmount;
  room.highestBidder = {
    id: player.id,
    name: player.name,
    avatar: player.avatar
  };

  room.bidHistory.unshift({
    playerId: player.id,
    playerName: player.name,
    playerAvatar: player.avatar,
    amount: bidAmount,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  if (room.bidHistory.length > 8) room.bidHistory.pop();

  // Timer increment: Add 5 seconds on every valid bid (capped at 60s)
  room.timer = Math.min(60, room.timer + 5);

  // Reset pass states for other players since price increased
  room.players.forEach(p => {
    if (p.id !== playerId && p.squad.length < room.settings.squadSize) {
      p.hasPassed = false;
    }
  });

  io.to(code).emit('bid_placed', {
    bidder: room.highestBidder,
    amount: bidAmount,
    timer: room.timer,
    bidHistory: room.bidHistory
  });

  io.to(code).emit('timer_tick', { timer: room.timer });

  broadcastRoom(code);
  return { success: true };
}

function endGame(code) {
  const room = rooms.get(code);
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  room.status = 'game_over';

  // Calculate scores and synergies for each player
  const leaderboard = room.players.map(player => {
    const synergyReport = calculateCrewSynergies(player.squad, player.berries);
    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      isBot: player.isBot,
      berriesRemaining: player.berries,
      squad: player.squad,
      ...synergyReport
    };
  });

  // Sort by totalScore descending
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  io.to(code).emit('game_ended', {
    leaderboard,
    winner: leaderboard[0],
    settings: room.settings
  });

  broadcastRoom(code);
}

// --- SOCKET.IO EVENTS ---
io.on('connection', (socket) => {
  // 1. Create Room
  socket.on('create_room', (data = {}, callback) => {
    try {
      const room = createRoom(socket.id, data.settings || {});
      const player = {
        id: socket.id,
        name: data.playerName?.trim() || 'Luffy',
        avatar: data.avatar || '🏴‍☠️',
        berries: room.settings.startingBudget,
        squad: [],
        isReady: true,
        isBot: false,
        hasPassed: false
      };
      room.players.push(player);
      socket.join(room.code);

      callback && callback({ success: true, roomCode: room.code, playerId: socket.id });
      broadcastRoom(room.code);
    } catch (e) {
      callback && callback({ success: false, error: e.message });
    }
  });

  // 2. Join Room
  socket.on('join_room', (data, callback) => {
    const { roomCode, playerName, avatar } = data;
    const code = roomCode?.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      callback && callback({ success: false, error: 'Room not found! Check room code.' });
      return;
    }

    if (room.status !== 'lobby') {
      callback && callback({ success: false, error: 'Game is already in progress!' });
      return;
    }

    if (room.players.length >= 8) {
      callback && callback({ success: false, error: 'Room is full (maximum 8 players).' });
      return;
    }

    // Add player
    const player = {
      id: socket.id,
      name: playerName?.trim() || `Pirate ${room.players.length + 1}`,
      avatar: avatar || '⚔️',
      berries: room.settings.startingBudget,
      squad: [],
      isReady: false,
      isBot: false,
      hasPassed: false
    };

    room.players.push(player);
    socket.join(code);

    callback && callback({ success: true, roomCode: code, playerId: socket.id });
    broadcastRoom(code);
  });

  // 3. Update Settings (Host Only)
  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;

    if (settings.squadSize) room.settings.squadSize = Math.max(3, Math.min(10, settings.squadSize));
    if (settings.startingBudget) {
      room.settings.startingBudget = settings.startingBudget;
      room.players.forEach(p => p.berries = settings.startingBudget);
    }
    if (settings.timerDuration) room.settings.timerDuration = Math.max(5, Math.min(30, settings.timerDuration));
    if (settings.minBidIncrement) room.settings.minBidIncrement = settings.minBidIncrement;
    if (settings.auctionPoolSize) room.settings.auctionPoolSize = Math.max(10, Math.min(150, settings.auctionPoolSize));

    broadcastRoom(roomCode);
  });

  // 4. Add Bot Player (Host Only)
  socket.on('add_bot', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;
    if (room.players.length >= 8) return;

    const botTemplate = BOT_TEMPLATES[room.players.filter(p => p.isBot).length % BOT_TEMPLATES.length];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const bot = {
      id: botId,
      name: botTemplate.name,
      avatar: botTemplate.avatar,
      berries: room.settings.startingBudget,
      squad: [],
      isReady: true,
      isBot: true,
      hasPassed: false
    };

    room.players.push(bot);
    broadcastRoom(roomCode);
  });

  // 5. Remove Bot Player (Host Only)
  socket.on('remove_bot', ({ roomCode, botId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;

    room.players = room.players.filter(p => p.id !== botId);
    broadcastRoom(roomCode);
  });

  // 6. Toggle Ready
  socket.on('toggle_ready', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      broadcastRoom(roomCode);
    }
  });

  // 7. Start Game (Host Only)
  socket.on('start_game', ({ roomCode }, callback) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) {
      callback && callback({ success: false, error: 'Only the host can start the game!' });
      return;
    }

    if (room.players.length < 2) {
      callback && callback({ success: false, error: 'Need at least 2 players to begin! (You can add Bot players).' });
      return;
    }

    // Reset player states & budgets
    room.players.forEach(p => {
      p.berries = room.settings.startingBudget;
      p.squad = [];
      p.hasPassed = false;
    });

    // Select top N most powerful characters according to auctionPoolSize
    const minNeeded = room.players.length * room.settings.squadSize;
    const poolLimit = Math.max(minNeeded, room.settings.auctionPoolSize || 50);

    const sortedByPower = [...CHARACTERS].sort((a, b) => (b.power || b.stats.total) - (a.power || a.stats.total));
    const selectedPool = sortedByPower.slice(0, poolLimit);
    room.deck = shuffleArray(selectedPool);

    room.currentLotIndex = -1;
    room.round = 0;

    startNextLot(roomCode);
    callback && callback({ success: true });
  });

  // 8. Place Bid
  socket.on('place_bid', ({ roomCode, amount }, callback) => {
    const result = processBid(roomCode, socket.id, amount);
    callback && callback(result);
  });

  // 9. Pass on current lot
  socket.on('pass_lot', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'auction') return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.hasPassed = true;
      io.to(roomCode).emit('player_passed', {
        playerId: player.id,
        playerName: player.name
      });

      // If all eligible players passed, expedite timer
      const eligible = room.players.filter(p => p.squad.length < room.settings.squadSize && !p.hasPassed);
      if (eligible.length === 0 && room.timer > 2) {
        room.timer = 1;
      }
      broadcastRoom(roomCode);
    }
  });

  // 10. Play Again (Host Only)
  socket.on('play_again', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.status = 'lobby';
    room.currentLot = null;
    room.currentBid = 0;
    room.highestBidder = null;
    room.bidHistory = [];
    room.players.forEach(p => {
      p.squad = [];
      p.berries = room.settings.startingBudget;
      p.isReady = p.isBot;
      p.hasPassed = false;
    });

    broadcastRoom(roomCode);
  });

  // 11. Disconnect
  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const removed = room.players.splice(idx, 1)[0];
        
        // If host left, reassign host or delete empty room
        if (room.hostId === socket.id) {
          const nextHuman = room.players.find(p => !p.isBot);
          if (nextHuman) {
            room.hostId = nextHuman.id;
          } else {
            // No humans left, clean up room
            if (room.timerInterval) clearInterval(room.timerInterval);
            rooms.delete(code);
            return;
          }
        }

        // If no players remain, remove room
        if (room.players.length === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          rooms.delete(code);
        } else {
          broadcastRoom(code);
        }
      }
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`🏴‍☠️ One Piece Pirate Auction Server running on port ${port}`);
    console.log(`⚓ 150 Characters loaded ready for high-seas bidding!`);
    console.log(`🌐 Open http://localhost:${port} in your browser to play!`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT && port < 3020) {
      console.log(`⚠️ Port ${port} is already in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}

const INITIAL_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
startServer(INITIAL_PORT);
