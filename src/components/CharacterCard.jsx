import React, { useState } from 'react';
import { Shield, Swords, Sparkles, Anchor, Flame, Skull, Zap } from 'lucide-react';

export default function CharacterCard({ 
  character, 
  size = 'large', 
  showStats = true, 
  showQuote = false,
  winner = null,
  pricePaid = null,
  className = ''
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!character) return null;

  const isPoster = size === 'large' || size === 'poster';
  const isSmall = size === 'small';

  const tierColors = {
    EX: 'from-amber-600 via-red-600 to-amber-500 text-amber-300 border-amber-500/60',
    SSR: 'from-amber-500 via-amber-400 to-yellow-600 text-amber-200 border-yellow-500/50',
    SR: 'from-purple-600 via-indigo-500 to-purple-800 text-purple-200 border-purple-500/40',
    R: 'from-blue-600 via-sky-500 to-blue-800 text-sky-200 border-sky-500/40'
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'EX': return '👑 EMPEROR';
      case 'SSR': return '⚡ WARLORD';
      case 'SR': return '⚔️ OFFICER';
      default: return '🏴 PIRATE';
    }
  };

  // Fallback Wanted illustration when external image is slow or blocked
  const fallbackAvatar = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 p-4 text-center">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner border-2 border-amber-900/30 text-amber-900 mb-2"
        style={{ backgroundColor: `${character.color || '#d97706'}22` }}
      >
        <Skull className="w-10 h-10 text-amber-900/70" />
      </div>
      <span className="text-sm font-bold text-amber-950 font-serif leading-tight">
        {character.name}
      </span>
      <span className="text-[11px] text-amber-800/80 font-mono mt-1">
        {character.title || character.faction}
      </span>
    </div>
  );

  return (
    <div 
      className={`wanted-poster relative rounded-lg p-3 md:p-4 transition-all duration-300 ${
        isSmall ? 'w-48 text-xs' : 'w-full max-w-sm'
      } ${className}`}
    >
      {/* Marine Header */}
      <div className="text-center border-b-2 border-amber-950/20 pb-1.5 mb-2">
        <div className="flex items-center justify-center gap-1 text-[9px] md:text-[10px] uppercase tracking-widest text-amber-900/80 font-semibold">
          <Anchor className="w-3 h-3 text-amber-900" />
          <span>MARINE HEADQUARTERS BOUNTY NOTICE</span>
          <Anchor className="w-3 h-3 text-amber-900" />
        </div>
        <h1 className="wanted-title text-2xl md:text-3xl font-black text-amber-950 tracking-widest mt-0.5">
          WANTED
        </h1>
      </div>

      {/* Character Portrait Frame */}
      <div className="relative aspect-[4/3] w-full rounded border-2 border-amber-950/40 bg-amber-900/10 overflow-hidden shadow-inner">
        {/* Tier Stamp */}
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-amber-400/40 text-[10px] font-bold text-amber-300 shadow">
          {getTierBadge(character.tier)}
        </div>

        {/* Total Power Badge */}
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-gradient-to-r from-red-800 to-amber-700 border border-amber-300/40 text-[10px] font-black text-white shadow">
          PWR {character.power || character.stats?.total}
        </div>

        {/* Image / Fallback */}
        {!imageError ? (
          <img
            src={character.image}
            alt={character.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : fallbackAvatar}

        {/* Loading Spinner for Image */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-100/60">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-800 border-t-transparent"></div>
          </div>
        )}

        {/* Sold Stamp Overlay if Won */}
        {winner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="transform -rotate-12 border-4 border-red-600 bg-red-950/90 text-red-200 px-4 py-2 rounded font-black tracking-widest text-center shadow-2xl animate-shake">
              <div className="text-xs uppercase text-amber-300 font-bold">RECRUITED BY</div>
              <div className="text-lg md:text-xl font-pirate text-white">{winner}</div>
              {pricePaid && (
                <div className="text-xs text-amber-400 font-mono mt-0.5">
                  ฿ {(pricePaid / 1000000).toLocaleString()}M
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dead or Alive Banner */}
      <div className="text-center my-1.5">
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-amber-950/90">
          DEAD OR ALIVE
        </span>
      </div>

      {/* Name and Japanese Subtitle */}
      <div className="text-center mb-2">
        <h2 className="bounty-font text-lg md:text-xl font-black text-amber-950 uppercase tracking-wider leading-tight">
          {character.name}
        </h2>
        {character.japaneseName && (
          <div className="text-[10px] text-amber-900/60 font-serif">
            {character.japaneseName}
          </div>
        )}
      </div>

      {/* Official Bounty Amount & Base Opening Price */}
      <div className="bg-amber-950/10 border border-amber-950/30 rounded py-1 px-2 text-center mb-2 shadow-inner">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] uppercase tracking-wider text-amber-900/80 font-bold">BOUNTY AMOUNT</span>
          {character.basePriceFormatted && (
            <span className="text-[9px] uppercase tracking-wider text-amber-800 font-mono font-bold">
              OPENING: <strong className="text-amber-950">{character.basePriceFormatted}</strong>
            </span>
          )}
        </div>
        <div className="bounty-font text-base md:text-lg font-black text-amber-950 tracking-tight">
          {character.bountyFormatted || `฿ ${(character.bounty || 0).toLocaleString()}-`}
        </div>
      </div>

      {/* Role & Faction Badges */}
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-900/15 text-amber-950 rounded border border-amber-900/20">
          ⚓ {character.faction}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-900/15 text-blue-950 rounded border border-blue-900/20">
          🛡️ {character.role}
        </span>
        {character.haki && character.haki !== 'None' && (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-900/15 text-purple-950 rounded border border-purple-900/20">
            ✨ {character.haki} Haki
          </span>
        )}
      </div>

      {/* Detailed Combat Stats */}
      {showStats && character.stats && isPoster && (
        <div className="bg-amber-950/5 border border-amber-950/20 rounded p-2 text-xs space-y-1 mt-2">
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="bg-amber-900/10 rounded py-1 px-1 border border-amber-800/15">
              <div className="text-[10px] text-red-800 font-semibold flex items-center justify-center gap-0.5 uppercase">
                <Swords className="w-2.5 h-2.5" /> ATK
              </div>
              <span className="font-bold text-amber-950 text-xs md:text-sm">{character.stats.attack}</span>
            </div>
            <div className="bg-amber-900/10 rounded py-1 px-1 border border-amber-800/15">
              <div className="text-[10px] text-orange-800 font-semibold flex items-center justify-center gap-0.5 uppercase">
                <Flame className="w-2.5 h-2.5" /> STR
              </div>
              <span className="font-bold text-amber-950 text-xs md:text-sm">{character.stats.strength}</span>
            </div>
            <div className="bg-amber-900/10 rounded py-1 px-1 border border-amber-800/15">
              <div className="text-[10px] text-blue-800 font-semibold flex items-center justify-center gap-0.5 uppercase">
                <Shield className="w-2.5 h-2.5" /> DEF
              </div>
              <span className="font-bold text-amber-950 text-xs md:text-sm">{character.stats.defense}</span>
            </div>
          </div>

          {character.devilFruit && character.devilFruit !== 'None' && (
            <div className="pt-1 border-t border-amber-950/15 text-[10px] text-amber-900 truncate text-center">
              <span className="font-semibold">Devil Fruit:</span> {character.devilFruit}
            </div>
          )}
        </div>
      )}

      {/* Character Quote */}
      {showQuote && character.quote && (
        <div className="mt-2 text-center italic text-[11px] text-amber-900/90 font-serif border-t border-amber-950/20 pt-1.5">
          "{character.quote}"
        </div>
      )}
    </div>
  );
}
