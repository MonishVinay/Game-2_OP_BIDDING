import { io } from 'socket.io-client';

console.log('=== TESTING: ALL PLAYERS PASS ENDS BID TIMER IMMEDIATELY ===');

const socket1 = io('http://localhost:3001', { transports: ['websocket'] });
const socket2 = io('http://localhost:3001', { transports: ['websocket'] });

let roomCode = null;

socket1.on('connect', () => {
  console.log('✅ Player 1 connected');
  socket1.emit('create_room', {
    playerName: 'Luffy',
    avatar: '👒',
    settings: {
      squadSize: 3,
      startingBudget: 100000000,
      bidTimer: 20, // Long timer to verify early termination
      minBidIncrement: 5000000
    }
  }, (res) => {
    if (!res.success) {
      console.error('Failed to create room:', res.error);
      process.exit(1);
    }
    roomCode = res.roomCode;
    console.log(`✅ Room ${roomCode} created with 20s bid timer`);

    socket2.emit('join_room', {
      roomCode,
      playerName: 'Zoro',
      avatar: '⚔️'
    }, (joinRes) => {
      if (!joinRes.success) {
        console.error('Failed to join:', joinRes.error);
        process.exit(1);
      }
      console.log('✅ Player 2 joined');

      // Start game
      socket1.emit('start_game', { roomCode }, (startRes) => {
        if (!startRes.success) {
          console.error('Failed to start:', startRes.error);
          process.exit(1);
        }
        console.log('▶️ Auction started!');
      });
    });
  });
});

let roundCount = 0;
let passStartTime = 0;

socket1.on('lot_started', ({ character, startingBid, round }) => {
  roundCount++;
  console.log(`\n--- LOT #${round}: ${character.name} (Opening: ฿ ${(startingBid/1000000)}M) ---`);

  if (roundCount === 1) {
    // TEST CASE 1: No bids, both players pass
    console.log('Test Case 1: Both players pass immediately without placing bids...');
    passStartTime = Date.now();
    
    // Player 1 passes
    socket1.emit('pass_lot', { roomCode });
    // Player 2 passes shortly after
    setTimeout(() => {
      socket2.emit('pass_lot', { roomCode });
    }, 300);
  } else if (roundCount === 2) {
    // TEST CASE 2: Player 1 bids, Player 2 passes
    console.log('Test Case 2: Player 1 places bid, Player 2 passes...');
    const bidAmount = startingBid + 5000000;
    socket1.emit('place_bid', { roomCode, amount: bidAmount });
  }
});

socket1.on('bid_placed', ({ bidder, amount }) => {
  if (roundCount === 2) {
    console.log(`💰 Bid placed by ${bidder.name}: ฿ ${(amount/1000000)}M`);
    passStartTime = Date.now();
    // Now Player 2 passes while Player 1 holds winning bid
    console.log('Player 2 (only remaining contender) passing...');
    socket2.emit('pass_lot', { roomCode });
  }
});

socket1.on('lot_unsold', ({ character }) => {
  const elapsed = (Date.now() - passStartTime) / 1000;
  console.log(`✅ LOT UNSOLD: ${character.name} ended in ${elapsed.toFixed(1)}s (Timer ended early instead of waiting 20s!)`);
  if (elapsed > 5) {
    console.error('❌ Failed: Timer did not end immediately on all pass!');
    process.exit(1);
  }
});

socket1.on('lot_sold', ({ character, winner, amount }) => {
  const elapsed = (Date.now() - passStartTime) / 1000;
  console.log(`✅ LOT SOLD: ${character.name} won by ${winner.name} for ฿ ${(amount/1000000)}M in ${elapsed.toFixed(1)}s!`);
  if (elapsed > 5) {
    console.error('❌ Failed: Timer did not end immediately when remaining players passed!');
    process.exit(1);
  }

  console.log('\n🎉 ALL PASS TIMER TERMINATION TESTS PASSED SUCCESSFULLY!');
  socket1.disconnect();
  socket2.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Test timed out after 25s');
  process.exit(1);
}, 25000);
