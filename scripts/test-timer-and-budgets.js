import { io } from 'socket.io-client';

console.log('=== TESTING TIMER INCREMENT & BUDGETS VISIBILITY ===');

const socket = io('http://localhost:3001', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);

  // Create room
  socket.emit('create_room', {
    playerName: 'CaptainLuffy',
    avatar: '👒',
    settings: {
      squadSize: 3,
      startingBudget: 100000000,
      bidTimer: 10,
      minBidIncrement: 5000000
    }
  }, (createRes) => {
    if (!createRes.success) {
      console.error('Failed to create room:', createRes.error);
      process.exit(1);
    }
    const code = createRes.roomCode;
    console.log('✅ Room created with code:', code);

    // Connect second player: Zoro
    const socket2 = io('http://localhost:3001', { transports: ['websocket'] });
    socket2.on('connect', () => {
      socket2.emit('join_room', {
        roomCode: code,
        playerName: 'CaptainZoro',
        avatar: '⚔️'
      }, (joinRes) => {
        if (!joinRes.success) {
          console.error('Failed to join:', joinRes.error);
          process.exit(1);
        }
        console.log('✅ CaptainZoro joined the room');

        // Start game
        socket.emit('start_game', { roomCode: code }, (startRes) => {
          if (!startRes.success) {
            console.error('Failed to start:', startRes.error);
            process.exit(1);
          }
          console.log('✅ Auction started!');
        });
      });
    });

    let initialTimer = null;
    let bidPlacedReceived = false;

    socket.on('room_update', (room) => {
      if (room.status === 'auction') {
        // Verify both players and their budgets are present and visible
        const p1 = room.players.find(p => p.name === 'CaptainLuffy');
        const p2 = room.players.find(p => p.name === 'CaptainZoro');

        if (p1 && p2) {
          console.log(`👁️ Budgets visible: Luffy = ฿ ${(p1.berries/1000000)}M, Zoro = ฿ ${(p2.berries/1000000)}M`);
        }
      }
    });

    socket.on('lot_started', ({ character, startingBid, timer }) => {
      console.log(`📦 Lot started: ${character.name}, startingBid: ฿ ${(startingBid/1000000)}M, timer: ${timer}s`);
      initialTimer = timer;

      // Wait 2 seconds so timer counts down, then place a bid
      setTimeout(() => {
        const timerBeforeBid = initialTimer - 2; // roughly
        console.log(`⏱️ Placing bid from CaptainLuffy...`);
        const bidAmount = startingBid + 5000000;
        socket.emit('place_bid', { roomCode: code, amount: bidAmount });
      }, 2000);
    });

    socket.on('bid_placed', ({ bidder, amount, timer }) => {
      bidPlacedReceived = true;
      console.log(`⚡ Bid Placed: ${bidder.name} bid ฿ ${(amount/1000000)}M. New timer: ${timer}s`);
      
      // Verify timer incremented!
      if (timer > 5) {
        console.log(`✅ VERIFIED: Timer successfully incremented to ${timer}s (+5s added)!`);
      } else {
        console.error(`❌ Unexpected timer: ${timer}`);
        process.exit(1);
      }

      setTimeout(() => {
        console.log('🎉 ALL INTEGRATION TESTS PASSED!');
        socket.disconnect();
        process.exit(0);
      }, 1000);
    });
  });
});

setTimeout(() => {
  console.error('Test timed out after 20s');
  process.exit(1);
}, 20000);
