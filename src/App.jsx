import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import AuctionTable from './components/AuctionTable';
import Leaderboard from './components/Leaderboard';
import SquadDrawer from './components/SquadDrawer';
import CharacterDex from './components/CharacterDex';
import { 
  playGavel, 
  playBidChime, 
  playWinnerFanfare, 
  toggleSound, 
  isSoundMuted 
} from './sound';
import { calculateCrewSynergies } from './synergyEngine';
import { 
  Skull, 
  Anchor, 
  Volume2, 
  VolumeX, 
  Layers, 
  BookOpen, 
  Users, 
  AlertCircle 
} from 'lucide-react';

const AVATARS = ['👒', '🗡️', '🍊', '🎯', '🚬', '💊', '🌸', '🤖', '💀', '🌊', '🔥', '🎩', '🐻', '👑', '🎪', '⚡'];

export default function App() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  // User input states
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('op_player_name') || 'Luffy');
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('op_player_avatar') || '👒');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isSquadOpen, setIsSquadOpen] = useState(false);
  const [isDexOpen, setIsDexOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(!isSoundMuted());
  const [leaderboardData, setLeaderboardData] = useState(null);

  // Recent toast notification banner
  const [toast, setToast] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    // Automatically connect to same host in production / Render, or localhost:3000 in development
    const socketUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
      ? 'http://localhost:3000'
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to One Piece Auction server with ID:', newSocket.id);
      setPlayerId(newSocket.id);
    });

    newSocket.on('room_update', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'lobby') {
        setLeaderboardData(null);
      }
    });

    newSocket.on('bid_placed', ({ bidder, amount }) => {
      showToast(`🔥 ${bidder.avatar} ${bidder.name} bid ฿ ${(amount / 1000000).toLocaleString()}M!`);
    });

    newSocket.on('lot_sold', ({ character, winner, amount }) => {
      playGavel();
      showToast(`🔨 SOLD! ${character.name} recruited by ${winner.avatar} ${winner.name} for ฿ ${(amount / 1000000).toLocaleString()}M!`, 4000);
    });

    newSocket.on('lot_unsold', ({ character }) => {
      playGavel();
      showToast(`❌ Pass! ${character.name} went unsold this round.`, 3000);
    });

    newSocket.on('game_ended', ({ leaderboard }) => {
      setLeaderboardData(leaderboard);
      playWinnerFanfare();
    });

    setSocket(newSocket);

    // Check for query param room code (e.g. ?room=LUFFY)
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setJoinRoomCode(roomFromUrl.toUpperCase());
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const showToast = (message, duration = 3000) => {
    setToast(message);
    setTimeout(() => {
      setToast(prev => prev === message ? null : prev);
    }, duration);
  };

  // Save profile to localStorage
  const handleNameChange = (val) => {
    setPlayerName(val);
    try { localStorage.setItem('op_player_name', val); } catch (e) {}
  };

  const handleAvatarChange = (val) => {
    setPlayerAvatar(val);
    try { localStorage.setItem('op_player_avatar', val); } catch (e) {}
  };

  // Create Room
  const handleCreateRoom = () => {
    setErrorMsg('');
    if (!socket) return;

    socket.emit('create_room', {
      playerName,
      avatar: playerAvatar,
      settings: {
        squadSize: 5,
        startingBudget: 100000000,
        timerDuration: 10,
        minBidIncrement: 5000000
      }
    }, (res) => {
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create room');
      }
    });
  };

  // Join Room
  const handleJoinRoom = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    if (!socket) return;
    if (!joinRoomCode.trim()) {
      setErrorMsg('Please enter a room code');
      return;
    }

    socket.emit('join_room', {
      roomCode: joinRoomCode.trim(),
      playerName,
      avatar: playerAvatar
    }, (res) => {
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to join room');
      }
    });
  };

  // Host Controls
  const handleUpdateSettings = (settings) => {
    if (!socket || !room) return;
    socket.emit('update_settings', { roomCode: room.code, settings });
  };

  const handleAddBot = () => {
    if (!socket || !room) return;
    socket.emit('add_bot', { roomCode: room.code });
  };

  const handleRemoveBot = (botId) => {
    if (!socket || !room) return;
    socket.emit('remove_bot', { roomCode: room.code, botId });
  };

  const handleToggleReady = () => {
    if (!socket || !room) return;
    socket.emit('toggle_ready', { roomCode: room.code });
  };

  const handleStartGame = () => {
    if (!socket || !room) return;
    socket.emit('start_game', { roomCode: room.code }, (res) => {
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to start game');
      }
    });
  };

  const handlePlaceBid = (amount, callback) => {
    if (!socket || !room) return;
    socket.emit('place_bid', { roomCode: room.code, amount }, callback);
  };

  const handlePassLot = () => {
    if (!socket || !room) return;
    socket.emit('pass_lot', { roomCode: room.code });
  };

  const handlePlayAgain = () => {
    if (!socket || !room) return;
    socket.emit('play_again', { roomCode: room.code });
  };

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundActive(newState);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 shadow-2xl text-xs md:text-sm font-bold text-amber-200 animate-bounce flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 py-4">
        {!room ? (
          /* Landing Screen: Create or Join Room */
          <div className="max-w-md mx-auto p-4 md:p-6 space-y-6 pt-8 md:pt-16">
            {/* Title / Logo */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-red-700 border-4 border-amber-300 shadow-2xl text-4xl mb-2">
                🏴‍☠️
              </div>
              <h1 className="text-3xl md:text-4xl font-pirate tracking-wider text-amber-300">
                ONE PIECE PIRATE AUCTION
              </h1>
              <p className="text-xs md:text-sm text-amber-200/80 font-serif">
                Real-Time Multiplayer Bidding Game • 150 Characters Roster
              </p>
            </div>

            {/* Profile Setup Card */}
            <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
                <Anchor className="w-4 h-4 text-amber-400" />
                <span>PIRATE CAPTAIN PROFILE</span>
              </h2>

              {/* Pirate Name */}
              <div>
                <label className="block text-xs text-amber-200/90 font-semibold mb-1">
                  Your Pirate Name:
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter Captain Name"
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs text-amber-200/90 font-semibold mb-1.5">
                  Choose Jolly Roger / Pirate Avatar:
                </label>
                <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => handleAvatarChange(av)}
                      className={`text-xl p-1.5 rounded-lg transition ${
                        playerAvatar === av 
                          ? 'bg-amber-600 shadow ring-2 ring-amber-300 scale-110' 
                          : 'hover:bg-slate-800 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions: Create or Join */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-3 px-4 rounded-xl font-pirate text-lg tracking-wider bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-bold shadow-xl shadow-red-950/50 cursor-pointer active:scale-95 transition"
                >
                  CREATE PIRATE ROOM (HOST)
                </button>

                <div className="flex items-center gap-2 text-slate-500 text-xs my-2">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span>OR JOIN WITH CODE</span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="ROOM CODE"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm font-mono tracking-widest text-center text-amber-300 uppercase placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    Join
                  </button>
                </form>
              </div>

              {/* Quick 150 Roster Button */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setIsDexOpen(true)}
                  className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center justify-center gap-1.5 mx-auto font-serif"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse 150 Characters Reference Roster</span>
                </button>
              </div>
            </div>
          </div>
        ) : room.status === 'lobby' ? (
          <Lobby
            room={room}
            playerId={playerId}
            onUpdateSettings={handleUpdateSettings}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onOpenDex={() => setIsDexOpen(true)}
          />
        ) : room.status === 'game_over' ? (
          <Leaderboard
            leaderboard={leaderboardData || room.players.map(p => ({
              ...p,
              ...calculateCrewSynergies(p.squad, p.berries)
            })).sort((a, b) => b.totalScore - a.totalScore)}
            isHost={room.hostId === playerId}
            onPlayAgain={handlePlayAgain}
          />
        ) : (
          <AuctionTable
            room={room}
            playerId={playerId}
            onPlaceBid={handlePlaceBid}
            onPassLot={handlePassLot}
            onOpenSquad={() => setIsSquadOpen(true)}
            onOpenDex={() => setIsDexOpen(true)}
          />
        )}
      </main>

      {/* Floating Buttons in Auction Mode */}
      {room && room.status !== 'lobby' && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-3 rounded-full bg-slate-900/90 border-2 border-amber-500/60 text-amber-300 hover:bg-slate-800 shadow-xl backdrop-blur transition"
            title={soundActive ? 'Mute' : 'Unmute'}
          >
            {soundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>

          {/* Roster Dex */}
          <button
            onClick={() => setIsDexOpen(true)}
            className="p-3 rounded-full bg-slate-900/90 border-2 border-amber-500/60 text-amber-300 hover:bg-slate-800 shadow-xl backdrop-blur transition"
            title="Browse 150 Characters"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Crew Squad Review */}
          <button
            onClick={() => setIsSquadOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs shadow-2xl border-2 border-amber-300 backdrop-blur transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>MY CREW ({room.players.find(p => p.id === playerId)?.squad?.length || 0}/{room.settings.squadSize})</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {room && (
        <SquadDrawer
          isOpen={isSquadOpen}
          onClose={() => setIsSquadOpen(false)}
          players={room.players}
          currentPlayerId={playerId}
          squadSize={room.settings.squadSize}
        />
      )}

      <CharacterDex
        isOpen={isDexOpen}
        onClose={() => setIsDexOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="text-center py-2 text-[10px] text-slate-600 font-mono">
        One Piece Pirate Auction • Playable Worldwide & Local • Hostable on Render
      </footer>
    </div>
  );
}
