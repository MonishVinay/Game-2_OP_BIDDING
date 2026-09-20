import React, { useState, useEffect } from 'react';
import CharacterCard from './CharacterCard';
import { 
  Gavel, 
  Clock, 
  Coins, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Tag, 
  Layers,
  ArrowUpCircle,
  Users
} from 'lucide-react';
import { playBidChime, playTick, playPass } from '../sound';

export default function AuctionTable({ 
  room, 
  playerId, 
  onPlaceBid, 
  onPassLot,
  onOpenSquad,
  onOpenDex
}) {
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isSquadFull = (currentPlayer?.squad?.length || 0) >= room.settings.squadSize;
  const isHighestBidder = room.highestBidder?.id === playerId;
  const hasPassed = currentPlayer?.hasPassed;

  // Sound effect for low timer ticks
  useEffect(() => {
    if (room.status === 'auction' && room.timer > 0 && room.timer <= 3) {
      playTick();
    }
  }, [room.timer, room.status]);

  // Compute minimum next bid required
  const minRequiredBid = room.highestBidder 
    ? room.currentBid + room.settings.minBidIncrement 
    : room.currentBid;

  // Compute solvency reservation: Must reserve minimum increment for remaining required slots
  const remainingSlots = room.settings.squadSize - (currentPlayer?.squad?.length || 0);
  const reserveNeeded = Math.max(0, (remainingSlots - 1) * room.settings.minBidIncrement);
  const maxAllowedBid = Math.max(0, (currentPlayer?.berries || 0) - reserveNeeded);

  const canBid = !isSquadFull && !isHighestBidder && !hasPassed && maxAllowedBid >= minRequiredBid;

  const handleQuickBid = (increment) => {
    const amount = (room.highestBidder ? room.currentBid : minRequiredBid - room.settings.minBidIncrement) + increment;
    submitBid(amount);
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    const parsed = parseInt(customBidAmount.replace(/,/g, ''));
    if (isNaN(parsed)) {
      setBidError('Please enter a valid Berry amount');
      return;
    }
    submitBid(parsed);
  };

  const submitBid = (amount) => {
    setBidError('');
    if (amount < minRequiredBid) {
      setBidError(`Minimum bid is ฿ ${(minRequiredBid / 1000000).toFixed(1)}M`);
      return;
    }
    if (amount > maxAllowedBid) {
      setBidError(`Must reserve ฿ ${(reserveNeeded / 1000000).toFixed(1)}M for remaining ${remainingSlots - 1} slots!`);
      return;
    }

    onPlaceBid(amount, (res) => {
      if (!res.success) {
        setBidError(res.error || 'Bid rejected');
      } else {
        playBidChime();
        setCustomBidAmount('');
      }
    });
  };

  const handlePass = () => {
    playPass();
    onPassLot();
  };

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 space-y-5">
      {/* Top Status Bar: Player berries & squad count */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-amber-600/30 rounded-xl p-3 shadow-xl backdrop-blur-md">
        {/* Your Berries */}
        <div className="bg-slate-950/70 border border-amber-500/20 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400/80 font-mono uppercase tracking-wider">YOUR BERRIES</div>
            <div className="text-sm md:text-base font-black text-amber-300 font-mono">
              ฿ {((currentPlayer?.berries || 0) / 1000000).toLocaleString()}M
            </div>
          </div>
        </div>

        {/* Squad Slots */}
        <div 
          onClick={() => onOpenSquad && onOpenSquad(playerId)}
          className="bg-slate-950/70 border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-blue-300/80 font-mono uppercase tracking-wider">CREW DRAFTED</div>
              <div className="text-sm md:text-base font-black text-white">
                {currentPlayer?.squad?.length || 0} / {room.settings.squadSize}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
        </div>

        {/* Current Round */}
        <div className="bg-slate-950/70 border border-amber-500/20 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-purple-300/80 font-mono uppercase tracking-wider">AUCTION LOT</div>
            <div className="text-sm md:text-base font-black text-white font-mono">
              #{room.round}
            </div>
          </div>
        </div>

        {/* Base Starting Opening Price for Current Lot */}
        <div className="bg-slate-950/70 border border-amber-500/20 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-[10px] text-red-300/80 font-mono uppercase tracking-wider">BASE PRICE</div>
            <div className="text-xs md:text-sm font-black text-amber-300 font-mono truncate">
              {room.currentLot?.basePriceFormatted || `฿ ${((room.currentLot?.basePrice || 1000000) / 1000000)}M`}
            </div>
          </div>
        </div>
      </div>

      {/* Live Captains & Budgets Roster: Shows everyone's balance in real-time */}
      <div className="bg-slate-900/90 border border-amber-600/30 rounded-xl p-3 md:p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 px-1 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-mono tracking-wider font-bold text-amber-300">
              PIRATE CAPTAINS & LIVE BUDGETS ({room.players.length})
            </span>
          </div>
          <span className="text-[10px] text-amber-200/60 font-mono hidden sm:inline">
            Click captain to view drafted crew
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {room.players.map((p) => {
            const isYou = p.id === playerId;
            const isWinning = room.highestBidder?.id === p.id;
            const full = (p.squad?.length || 0) >= room.settings.squadSize;
            const passed = p.hasPassed;

            return (
              <div
                key={p.id}
                onClick={() => onOpenSquad && onOpenSquad(p.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 group hover:scale-[1.01] ${
                  isWinning
                    ? 'bg-amber-950/70 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : isYou
                    ? 'bg-slate-950/90 border-amber-500/50 hover:border-amber-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Avatar + Name + Status */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate ${isYou ? 'text-amber-300' : 'text-white'}`}>
                        {p.name}
                      </span>
                      {isYou && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">Crew: <strong className="text-slate-200">{p.squad?.length || 0}</strong>/{room.settings.squadSize}</span>
                      {full ? (
                        <span className="text-green-400 font-semibold text-[9px] bg-green-500/10 px-1 rounded border border-green-500/20">Full</span>
                      ) : passed ? (
                        <span className="text-slate-400 font-semibold text-[9px] bg-slate-800 px-1 rounded">Passed</span>
                      ) : isWinning ? (
                        <span className="text-amber-300 font-semibold text-[9px] bg-amber-500/20 px-1 rounded border border-amber-500/30 animate-pulse">High Bid</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Berry Balance */}
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-amber-400/70 font-mono uppercase">BERRIES</div>
                  <div className={`text-xs sm:text-sm font-black font-mono ${
                    p.berries === 0 ? 'text-slate-500' : 'text-amber-300'
                  }`}>
                    ฿ {((p.berries || 0) / 1000000).toLocaleString()}M
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Bidding Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: The Wanted Poster Center Stage (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-sm">
            {/* Timer Pulsing Indicator */}
            <div className="absolute -top-3.5 right-4 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border-2 border-amber-500 shadow-xl">
              <Clock className={`w-4 h-4 ${room.timer <= 3 ? 'text-red-500 animate-spin' : 'text-amber-400'}`} />
              <span className={`font-mono text-sm font-black ${room.timer <= 3 ? 'text-red-400 animate-pulse text-base' : 'text-white'}`}>
                {room.timer}s
              </span>
            </div>

            <CharacterCard 
              character={room.currentLot} 
              size="poster" 
              showStats={true}
              showQuote={true}
              winner={room.status === 'sold_delay' ? room.highestBidder?.name : null}
              pricePaid={room.status === 'sold_delay' ? room.currentBid : null}
            />
          </div>
        </div>

        {/* Right Col: Bidding Console & Activity Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Highest Bid Showcase Card */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/40 rounded-xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400 animate-hammer" />
                <span className="text-xs uppercase font-mono tracking-widest text-amber-300 font-bold">
                  CURRENT HIGH BID
                </span>
              </div>
              <div className="text-xs text-amber-200/60 font-mono">
                Min Increment: +฿ {(room.settings.minBidIncrement / 1000000)}M
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-3xl md:text-4xl font-black font-mono text-amber-300 tracking-tight flex items-baseline gap-1">
                  <span>฿</span>
                  <span>{(room.currentBid / 1000000).toLocaleString()}</span>
                  <span className="text-xl font-bold text-amber-400">M</span>
                </div>
                <div className="text-xs text-amber-200/70 mt-1">
                  {room.highestBidder ? (
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>Held by:</span>
                      <span className="text-lg">{room.highestBidder.avatar}</span>
                      <strong className="text-white">{room.highestBidder.name}</strong>
                      {room.highestBidder.id === playerId && (
                        <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.2 rounded border border-green-500/30">
                          YOU
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="italic text-amber-400/70">No bids placed yet (Opening lot at starting price)</span>
                  )}
                </div>
              </div>

              {/* Timer Progress Ring / Pill */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-500/30">
                <Clock className={`w-6 h-6 ${room.timer <= 3 ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
                <div>
                  <div className="text-[9px] uppercase font-mono text-slate-400">TIME REMAINING</div>
                  <div className={`text-xl font-black font-mono leading-none ${
                    room.timer <= 3 ? 'text-red-400' : 'text-amber-300'
                  }`}>
                    {room.timer}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding Control Panel */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-xl backdrop-blur">
            {/* Squad Full Banner */}
            {isSquadFull ? (
              <div className="p-4 rounded-xl bg-green-950/40 border-2 border-green-500/40 text-center space-y-1.5 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-green-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>SQUAD COMPLETE ({room.settings.squadSize}/{room.settings.squadSize})</span>
                </div>
                <p className="text-xs text-green-200/80">
                  Your pirate crew is fully assembled! Enjoy watching the remaining captains battle for their final recruits.
                </p>
              </div>
            ) : hasPassed ? (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-slate-300 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-slate-400" />
                  <span>YOU HAVE PASSED ON THIS LOT</span>
                </div>
                <p className="text-xs text-slate-400">
                  You are sitting out this round. Bidding will resume for you on the next character card.
                </p>
              </div>
            ) : isHighestBidder ? (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span>YOU CURRENTLY HOLD THE WINNING BID!</span>
                </div>
                <p className="text-xs text-amber-200/70">
                  Waiting for timer to expire or for another captain to counter-bid.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-200/80 font-medium">
                    Quick Bids (Next Min: <strong className="text-amber-300">฿ {(minRequiredBid / 1000000).toFixed(1)}M</strong>):
                  </span>
                  <span className="text-[11px] text-amber-400/70 font-mono">
                    Max Bid: ฿ {(maxAllowedBid / 1000000).toFixed(1)}M
                  </span>
                </div>

                {/* Quick Bid Increment Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1000000, 5000000, 10000000, 25000000].map((inc) => {
                    const targetBid = (room.highestBidder ? room.currentBid : minRequiredBid - room.settings.minBidIncrement) + inc;
                    const isAffordable = targetBid <= maxAllowedBid && targetBid >= minRequiredBid;

                    return (
                      <button
                        key={inc}
                        disabled={!isAffordable}
                        onClick={() => handleQuickBid(inc)}
                        className={`py-2.5 px-3 rounded-xl font-mono font-black text-xs md:text-sm border transition shadow-md flex flex-col items-center justify-center ${
                          isAffordable
                            ? 'bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400 cursor-pointer active:scale-95'
                            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span>+฿ {(inc / 1000000)}M</span>
                        <span className="text-[9px] font-normal opacity-80">
                          (฿ {(targetBid / 1000000).toFixed(1)}M)
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Bid Input Form */}
                <form onSubmit={handleCustomBid} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono font-bold">฿</span>
                    <input
                      type="number"
                      placeholder={`Enter custom bid in Berries (e.g. ${minRequiredBid})`}
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      step={room.settings.minBidIncrement}
                      min={minRequiredBid}
                      max={maxAllowedBid}
                      className="w-full bg-slate-950 border border-amber-500/30 rounded-xl py-2 pl-8 pr-3 text-xs md:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canBid}
                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow ${
                      canBid
                        ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Bid
                  </button>
                  <button
                    type="button"
                    onClick={handlePass}
                    className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700 transition"
                  >
                    Pass
                  </button>
                </form>

                {/* Bid Error Warning */}
                {bidError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bidError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Activity & Bid Log */}
          <div className="bg-slate-900/70 border border-amber-500/20 rounded-xl p-4 shadow-lg">
            <div className="text-xs uppercase font-mono text-amber-400/80 font-semibold mb-2.5 flex items-center justify-between">
              <span>LIVE BID ACTIVITY</span>
              <span className="text-[10px] text-slate-500 font-sans">Updates in real-time</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {room.bidHistory && room.bidHistory.length > 0 ? (
                room.bidHistory.map((b, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{b.playerAvatar}</span>
                      <strong className="text-amber-200 font-medium">{b.playerName}</strong>
                      <span className="text-slate-400">bid</span>
                      <span className="font-mono font-bold text-amber-300">
                        ฿ {(b.amount / 1000000).toLocaleString()}M
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{b.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs italic text-slate-500 text-center py-4">
                  Waiting for first bid to be placed on this character...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
