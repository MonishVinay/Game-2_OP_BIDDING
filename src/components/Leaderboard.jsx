import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import CharacterCard from './CharacterCard';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  RotateCcw, 
  Coins, 
  Award, 
  Swords, 
  ShieldCheck, 
  CheckCircle,
  Flame
} from 'lucide-react';
import { playWinnerFanfare } from '../sound';

export default function Leaderboard({ 
  leaderboard = [], 
  isHost, 
  onPlayAgain 
}) {
  useEffect(() => {
    playWinnerFanfare();

    // Epic Grand Line celebratory confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#d4af37', '#dc2626', '#3b82f6', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#d4af37', '#dc2626', '#3b82f6', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!leaderboard || leaderboard.length === 0) return null;

  const winner = leaderboard[0];
  const podiumTop3 = leaderboard.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Victory Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>GRAND LINE TOURNAMENT RESULTS</span>
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-pirate tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
          THE PIRATE KING IS CROWNED!
        </h1>
        <p className="text-xs md:text-sm text-amber-200/80 max-w-xl mx-auto font-serif">
          Based on character combat attributes, naval role harmony, faction alliances, and iconic lore combos!
        </p>
      </div>

      {/* Podium Showcase (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
        {/* 2nd Place */}
        {podiumTop3[1] && (
          <div className="order-2 md:order-1 bg-slate-900/90 border-2 border-slate-500/50 rounded-2xl p-5 text-center shadow-xl relative backdrop-blur">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-bold text-slate-300 shadow">
              2nd
            </div>
            <div className="text-4xl mb-2 mt-2">{podiumTop3[1].avatar}</div>
            <h3 className="font-bold text-base text-white">{podiumTop3[1].name}</h3>
            <p className="text-xs text-amber-400 font-pirate text-sm mt-0.5">"{podiumTop3[1].crewTitle}"</p>
            <div className="mt-3 py-1.5 px-3 rounded-lg bg-slate-950 font-mono font-black text-amber-300 text-lg">
              {podiumTop3[1].totalScore} PTS
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Base: {podiumTop3[1].basePower} | Syn: +{podiumTop3[1].totalSynergyBonus ?? (podiumTop3[1].factionBonus + podiumTop3[1].roleBonus + podiumTop3[1].loreBonus)}
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-slate-900 to-amber-950/80 border-4 border-amber-400 rounded-2xl p-6 text-center shadow-2xl relative glow-ssr backdrop-blur transform md:-translate-y-3">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-white flex items-center justify-center text-white shadow-xl">
            <Crown className="w-8 h-8 fill-current text-amber-100 animate-pulse" />
          </div>
          <div className="text-5xl mb-2 mt-4">{winner.avatar}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400">CHAMPION OF THE SEAS</div>
          <h2 className="text-2xl font-black text-white font-serif mt-1">{winner.name}</h2>
          <div className="text-base text-amber-300 font-pirate tracking-wide my-1">
            "{winner.crewTitle}"
          </div>
          <div className="mt-4 py-2 px-4 rounded-xl bg-slate-950/90 border border-amber-500/40 font-mono font-black text-2xl text-amber-300 shadow-inner">
            {winner.totalScore} TOTAL PTS
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-3 text-[10px] font-mono">
            <div className="bg-slate-950/60 p-1.5 rounded border border-amber-500/20">
              <span className="text-slate-400 block">BASE PWR</span>
              <span className="text-white font-bold">{winner.basePower}</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-amber-500/20">
              <span className="text-slate-400 block">SYNERGIES (MAX 150)</span>
              <span className="text-green-400 font-bold">
                +{winner.totalSynergyBonus ?? (winner.factionBonus + winner.roleBonus + winner.loreBonus)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-amber-500/20">
              <span className="text-slate-400 block">TREASURE</span>
              <span className="text-amber-300 font-bold">
                +{winner.economyBonus}
              </span>
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        {podiumTop3[2] && (
          <div className="order-3 bg-slate-900/90 border-2 border-amber-800/40 rounded-2xl p-5 text-center shadow-xl relative backdrop-blur">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-bold text-amber-600 shadow">
              3rd
            </div>
            <div className="text-4xl mb-2 mt-2">{podiumTop3[2].avatar}</div>
            <h3 className="font-bold text-base text-white">{podiumTop3[2].name}</h3>
            <p className="text-xs text-amber-400 font-pirate text-sm mt-0.5">"{podiumTop3[2].crewTitle}"</p>
            <div className="mt-3 py-1.5 px-3 rounded-lg bg-slate-950 font-mono font-black text-amber-300 text-lg">
              {podiumTop3[2].totalScore} PTS
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Base: {podiumTop3[2].basePower} | Syn: +{podiumTop3[2].totalSynergyBonus ?? (podiumTop3[2].factionBonus + podiumTop3[2].roleBonus + podiumTop3[2].loreBonus)}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Final Standings & Crew Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>COMPLETE CREW BREAKDOWN & STANDINGS</span>
        </h3>

        <div className="space-y-4">
          {leaderboard.map((player, rank) => (
            <div
              key={player.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 md:p-5 shadow-xl transition backdrop-blur ${
                rank === 0 ? 'border-amber-400 ring-2 ring-amber-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                    rank === 0 ? 'bg-amber-500 text-slate-950 shadow' :
                    rank === 1 ? 'bg-slate-400 text-slate-950' :
                    rank === 2 ? 'bg-amber-800 text-white' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{rank + 1}
                  </div>
                  <span className="text-3xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{player.name}</h4>
                      {player.isBot && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
                          AI BOT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-400 font-pirate text-sm">
                      "{player.crewTitle}"
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                    <span className="text-slate-400 mr-1.5">Base:</span>
                    <strong className="text-white">{player.basePower}</strong>
                  </div>
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                    <span className="text-slate-400 mr-1.5">Synergies (Max 150):</span>
                    <strong className="text-green-400">
                      +{player.totalSynergyBonus ?? (player.factionBonus + player.roleBonus + player.loreBonus)}
                    </strong>
                  </div>
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                    <span className="text-slate-400 mr-1.5">Berries Bonus:</span>
                    <strong className="text-amber-300">+{player.economyBonus}</strong>
                  </div>
                  <div className="bg-gradient-to-r from-red-900 to-amber-900 px-4 py-1.5 rounded-lg border border-amber-400 font-mono font-black text-white text-base shadow">
                    {player.totalScore} PTS
                  </div>
                </div>
              </div>

              {/* Active Synergies Badges */}
              {player.activeSynergies && player.activeSynergies.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-mono uppercase text-amber-400/80 mb-2 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active Synergies ({player.activeSynergies.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {player.activeSynergies.map((syn, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-1.5"
                        title={syn.description}
                      >
                        <span>{syn.badge}</span>
                        <span className="font-semibold">{syn.name}</span>
                        <span className="text-green-400 font-mono font-bold">+{syn.bonus}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruited Characters Row */}
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 font-semibold">
                  Recruited Pirate Crew:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {player.squad.map((char) => (
                    <div 
                      key={char.id}
                      className="p-1.5 rounded-lg bg-slate-950 border border-amber-500/20 flex flex-col items-center text-center group relative overflow-hidden"
                    >
                      <div className="w-full aspect-[4/3] rounded bg-slate-900 overflow-hidden mb-1 border border-slate-800">
                        <img 
                          src={char.image} 
                          alt={char.name} 
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white truncate w-full font-serif">
                        {char.name}
                      </span>
                      <span className="text-[9px] text-amber-400 font-mono">
                        PWR {char.stats?.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Rematch Controls */}
      <div className="text-center pt-4 pb-8">
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="px-8 py-3.5 rounded-xl font-pirate text-xl font-bold bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl shadow-red-900/40 flex items-center gap-2 mx-auto cursor-pointer active:scale-95 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN (NEW TOURNAMENT)</span>
          </button>
        ) : (
          <p className="text-xs text-amber-200/70 italic">
            Waiting for Host to initiate a rematch...
          </p>
        )}
      </div>
    </div>
  );
}
