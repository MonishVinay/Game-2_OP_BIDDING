import React, { useState } from 'react';
import { Users, Bot, Settings, Play, Copy, Check, Shield, Award, Sparkles, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { isSoundMuted, toggleSound, playBidChime } from '../sound';

const AVATARS = ['👒', '🗡️', '🍊', '🎯', '🚬', '💊', '🌸', '🤖', '💀', '🌊', '🔥', '🎩', '🐻', '👑', '🎪', '⚡'];

export default function Lobby({ 
  room, 
  playerId, 
  onUpdateSettings, 
  onAddBot, 
  onRemoveBot, 
  onToggleReady, 
  onStartGame,
  onOpenDex 
}) {
  const [copied, setCopied] = useState(false);
  const [soundActive, setSoundActive] = useState(!isSoundMuted());

  if (!room) return null;

  const isHost = room.hostId === playerId;
  const currentPlayer = room.players.find(p => p.id === playerId);
  const canStart = room.players.length >= 2;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    playBidChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundActive(newState);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 border-2 border-amber-600/40 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏴‍☠️</span>
            <h1 className="text-2xl md:text-3xl font-pirate tracking-wider text-amber-300">
              GRAND LINE PIRATE AUCTION
            </h1>
          </div>
          <p className="text-xs md:text-sm text-amber-200/80 mt-1 font-serif">
            Assemble your dream crew of <strong className="text-amber-400">150 One Piece characters</strong>. Bid wisely and unlock powerful synergies!
          </p>
        </div>

        {/* Room Code & Audio Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-lg bg-slate-800/80 border border-amber-500/30 text-amber-300 hover:bg-slate-700 transition shadow"
            title={soundActive ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>

          <button
            onClick={onOpenDex}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-900/60 border border-amber-500/40 text-amber-200 hover:bg-amber-800 transition text-xs font-semibold shadow"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>150 Roster Dex</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/50 rounded-lg px-3 py-1.5 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] uppercase text-amber-400 font-mono tracking-widest">ROOM CODE</div>
              <div className="text-lg font-black font-mono tracking-wider text-white">{room.code}</div>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded bg-amber-600 hover:bg-amber-500 text-white transition shadow flex items-center justify-center"
              title="Copy invite link to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Players in Room */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-amber-200 font-serif">
                  Pirate Captains ({room.players.length}/8)
                </h2>
              </div>
              {isHost && room.players.length < 8 && (
                <button
                  onClick={onAddBot}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-400/40 text-blue-200 transition shadow"
                >
                  <Bot className="w-4 h-4 text-blue-300" />
                  <span>+ Add AI Bot</span>
                </button>
              )}
            </div>

            {/* Player Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.players.map((p) => {
                const isYou = p.id === playerId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      isYou 
                        ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40' 
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-950 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">
                            {p.name}
                          </span>
                          {isYou && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                              YOU
                            </span>
                          )}
                          {p.isHost && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                              HOST
                            </span>
                          )}
                          {p.isBot && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                              BOT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-amber-400 font-mono mt-0.5">
                          ฿ {(p.berries / 1000000).toLocaleString()}M Budget
                        </div>
                      </div>
                    </div>

                    {isHost && p.isBot && (
                      <button
                        onClick={() => onRemoveBot(p.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/40 border border-red-500/20 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instructions box */}
            <div className="mt-4 p-3 rounded-lg bg-amber-950/20 border border-amber-600/20 text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-400">📜 Auction Rules:</strong> Every player must draft exactly <strong className="text-amber-300">{room.settings.squadSize} characters</strong>. Characters will be auctioned one-by-one. Manage your Berry budget carefully so you don't run out of funds for your final slots!
            </div>
          </div>
        </div>

        {/* Right Col: Host Settings & Start */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 mb-4 border-b border-amber-500/20 pb-3">
              <Settings className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-amber-200 font-serif">
                Game Settings {isHost ? '(Host)' : '(Locked)'}
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Squad Size (3-10) */}
              <div>
                <div className="flex justify-between font-semibold text-amber-200 mb-1.5">
                  <span>Squad Size (Characters per Player):</span>
                  <span className="text-amber-400 font-mono text-sm">{room.settings.squadSize} Characters</span>
                </div>
                {isHost ? (
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={room.settings.squadSize}
                    onChange={(e) => onUpdateSettings({ squadSize: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                ) : (
                  <div className="w-full bg-slate-800 rounded h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded" 
                      style={{ width: `${((room.settings.squadSize - 3) / 7) * 100}%` }}
                    />
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-amber-400/60 mt-1">
                  <span>3 (Fast Game)</span>
                  <span>5 (Standard)</span>
                  <span>10 (Mega Armada)</span>
                </div>
              </div>

              {/* Starting Budget */}
              <div>
                <div className="font-semibold text-amber-200 mb-1.5">Starting Budget:</div>
                <div className="grid grid-cols-2 gap-2">
                  {[50000000, 100000000, 200000000, 500000000].map((amount) => (
                    <button
                      key={amount}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ startingBudget: amount })}
                      className={`py-1.5 px-2 rounded font-mono font-bold text-xs border transition ${
                        room.settings.startingBudget === amount
                          ? 'bg-amber-600 text-white border-amber-400 shadow'
                          : 'bg-slate-800 text-amber-200/70 border-slate-700 hover:bg-slate-700'
                      } ${!isHost ? 'opacity-90 cursor-default' : ''}`}
                    >
                      ฿ {(amount / 1000000)}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Bid Timer */}
              <div>
                <div className="font-semibold text-amber-200 mb-1.5">Bid Timer:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((sec) => (
                    <button
                      key={sec}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ timerDuration: sec })}
                      className={`py-1 rounded font-mono font-bold text-xs border transition ${
                        room.settings.timerDuration === sec
                          ? 'bg-amber-600 text-white border-amber-400 shadow'
                          : 'bg-slate-800 text-amber-200/70 border-slate-700 hover:bg-slate-700'
                      } ${!isHost ? 'opacity-90 cursor-default' : ''}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Auction Pool Size (Most Powerful Characters) */}
              <div>
                <div className="flex justify-between items-center font-semibold text-amber-200 mb-1">
                  <span>Auction Pool Size:</span>
                  <span className="text-amber-400 font-mono text-xs">
                    {room.settings.auctionPoolSize === 150 ? 'All 150 Roster' : `Top ${room.settings.auctionPoolSize} Most Powerful`}
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/70 mb-1.5 font-serif">
                  Filters the auction deck to the highest bounty & combat threat legends.
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {[25, 50, 75, 100, 150].map((size) => (
                    <button
                      key={size}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ auctionPoolSize: size })}
                      className={`py-1 rounded font-mono font-bold text-xs border transition ${
                        (room.settings.auctionPoolSize || 50) === size
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-300 shadow'
                          : 'bg-slate-800 text-amber-200/70 border-slate-700 hover:bg-slate-700'
                      } ${!isHost ? 'opacity-90 cursor-default' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Increment */}
              <div>
                <div className="font-semibold text-amber-200 mb-1.5">Min Bid Increment:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1000000, 5000000, 10000000].map((inc) => (
                    <button
                      key={inc}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ minBidIncrement: inc })}
                      className={`py-1 rounded font-mono font-bold text-xs border transition ${
                        room.settings.minBidIncrement === inc
                          ? 'bg-amber-600 text-white border-amber-400 shadow'
                          : 'bg-slate-800 text-amber-200/70 border-slate-700 hover:bg-slate-700'
                      } ${!isHost ? 'opacity-90 cursor-default' : ''}`}
                    >
                      +{(inc / 1000000)}M ฿
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Game Button */}
            <div className="mt-6 pt-4 border-t border-amber-500/20">
              {isHost ? (
                <button
                  disabled={!canStart}
                  onClick={onStartGame}
                  className={`w-full py-3.5 px-4 rounded-xl font-pirate text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl ${
                    canStart
                      ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/40 cursor-pointer animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>SET SAIL & START AUCTION</span>
                </button>
              ) : (
                <div className="text-center p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-200/80 text-xs font-serif">
                  ⏳ Waiting for the Host to launch the auction...
                </div>
              )}

              {!canStart && isHost && (
                <p className="text-[11px] text-center text-amber-400/80 mt-2">
                  ⚠️ Need at least 2 players to begin. Click "+ Add AI Bot" to test right now!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
