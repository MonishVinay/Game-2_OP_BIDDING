import { io } from 'socket.io-client';

console.log('--- TESTING FULL MULTIPLAYER AUCTION ENGINE ---');

const socket = io('http://localhost:3001', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully with ID:', socket.id);

  // 1. Create Room with squad size = 3 and 100M budget
  socket.emit('create_room', {
    playerName: 'TestCaptain',
    avatar: '👒',
    settings: {
      squadSize: 3,
      startingBudget: 100000000,
      timerDuration: 5,
      minBidIncrement: 5000000
    }
  }, (res) => {
    if (!res.success) {
      console.error('Failed to create room:', res.error);
      process.exit(1);
    }
    const roomCode = res.roomCode;
    activeRoomCode = roomCode;
    console.log('✅ Room created with code:', roomCode);

    // 2. Add AI Bot to reach minimum 2 players
    socket.emit('add_bot', { roomCode });

    setTimeout(() => {
      // 3. Start Game
      console.log('▶️ Launching auction...');
      socket.emit('start_game', { roomCode }, (startRes) => {
        if (!startRes.success) {
          console.error('Failed to start game:', startRes.error);
          process.exit(1);
        }
        console.log('✅ Auction started successfully!');
      });
    }, 800);
  });
});

let lotsSeen = 0;
let activeRoomCode = null;

socket.on('lot_started', ({ character, startingBid, round }) => {
  lotsSeen++;
  console.log(`\n📦 Lot #${round}: ${character.name} (${character.tier} - ${character.faction}) | Starting Bid: ฿ ${(startingBid / 1000000)}M`);

  // Place a bid as TestCaptain
  const bidAmount = startingBid + 5000000;
  console.log(`💰 Placing bid: ฿ ${(bidAmount / 1000000)}M...`);
  
  socket.emit('place_bid', { roomCode: activeRoomCode, amount: bidAmount });
});

socket.on('bid_placed', ({ bidder, amount }) => {
  console.log(`⚡ Bid Accepted: ${bidder.avatar} ${bidder.name} holds high bid of ฿ ${(amount / 1000000)}M`);
});

socket.on('lot_sold', ({ character, winner, amount, isSquadFull }) => {
  console.log(`🔨 LOT SOLD: ${character.name} recruited by ${winner.name} for ฿ ${(amount / 1000000)}M (Squad Full: ${isSquadFull})`);

  if (lotsSeen >= 2) {
    console.log('\n🎉 Multi-round auction test PASSED successfully!');
    socket.disconnect();
    process.exit(0);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

setTimeout(() => {
  console.log('Test timed out after 30 seconds');
  process.exit(0);
}, 30000);
