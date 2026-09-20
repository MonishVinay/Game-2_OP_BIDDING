import React, { useState, useEffect } from 'react';
import CharacterCard from './CharacterCard';
import { X, Shield, Sparkles, Award, Coins, Users, Flame } from 'lucide-react';
import { calculateCrewSynergies } from '../synergyEngine';

export default function SquadDrawer({ 
  isOpen, 
  onClose, 
  players, 
  currentPlayerId, 
  initialPlayerId,
  squadSize 
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayerId || currentPlayerId);

  useEffect(() => {
    if (initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
    }
  }, [initialPlayerId, isOpen]);

  if (!isOpen) return null;

  const targetPlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const isYou = targetPlayer.id === currentPlayerId;
  const squad = targetPlayer?.squad || [];
  const synergyReport = calculateCrewSynergies(squad, targetPlayer?.berries || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-600/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏴‍☠️</span>
            <div>
              <h2 className="text-lg font-bold text-amber-300 font-serif">
                Pirate Crew Review
              </h2>
              <p className="text-xs text-amber-200/70">
                Inspect drafted squads, live crew power, and active lore synergies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Switcher Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          {players.map((p) => {
            const isSelected = p.id === selectedPlayerId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-400 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-amber-300 font-mono">
                  {p.squad?.length || 0}/{squadSize}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Captain Banner & Power Summary */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-800/80 to-amber-950/60 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
                {targetPlayer?.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-serif">
                    {targetPlayer?.name}'s Crew
                  </h3>
                  {isYou && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-300 font-pirate tracking-wider text-base mt-0.5">
                  "{synergyReport.crewTitle}"
                </div>
                <div className="text-xs text-amber-400 font-mono mt-1">
                  Remaining Treasure: ฿ {((targetPlayer?.berries || 0) / 1000000).toLocaleString()}M
                </div>
              </div>
            </div>

            {/* Score Stats Badges */}
            <div className="flex items-center gap-3 text-center">
              <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/30 min-w-20">
                <div className="text-[9px] uppercase font-mono text-slate-400">BASE POWER</div>
                <div className="text-base font-black text-amber-300 font-mono">{synergyReport.basePower}</div>
              </div>
              <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-amber-500/30 min-w-20">
                <div className="text-[9px] uppercase font-mono text-slate-400">SYNERGIES</div>
                <div className="text-base font-black text-green-400 font-mono">
                  +{synergyReport.factionBonus + synergyReport.roleBonus + synergyReport.loreBonus}
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-900 to-amber-900 px-4 py-2 rounded-xl border border-amber-400 shadow min-w-24">
                <div className="text-[9px] uppercase font-mono text-amber-200">TOTAL SCORE</div>
                <div className="text-xl font-black text-white font-mono">{synergyReport.totalScore}</div>
              </div>
            </div>
          </div>

          {/* Active Synergies Display */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>ACTIVE SYNERGIES TRIGGERED ({synergyReport.activeSynergies.length})</span>
            </h4>

            {synergyReport.activeSynergies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {synergyReport.activeSynergies.map((syn, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/20 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-200">{syn.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-medium">
                          {syn.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {syn.description}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-green-400 shrink-0">
                      +{syn.bonus} PTS
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500 italic">
                No major synergies activated yet. Recruiter more characters from the same crew, match key roles, or draft iconic duos!
              </div>
            )}
          </div>

          {/* Recruited Characters Grid */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>RECRUITED CHARACTERS ({squad.length}/{squadSize})</span>
            </h4>

            {squad.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {squad.map((char) => (
                  <CharacterCard 
                    key={char.id} 
                    character={char} 
                    size="small" 
                    showStats={false}
                  />
                ))}
                {/* Empty Remaining Slots */}
                {Array.from({ length: Math.max(0, squadSize - squad.length) }).map((_, idx) => (
                  <div
                    key={`empty_${idx}`}
                    className="border-2 border-dashed border-slate-700 rounded-lg aspect-[3/4] flex flex-col items-center justify-center p-3 text-center text-slate-600"
                  >
                    <span className="text-2xl mb-1">⚓</span>
                    <span className="text-xs font-serif">Empty Slot</span>
                    <span className="text-[10px] opacity-70">Awaiting Bid</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-slate-400 space-y-2">
                <span className="text-3xl block">⛵</span>
                <p className="text-sm font-serif">No characters recruited into this crew yet.</p>
                <p className="text-xs text-slate-500">Place bids on the auction table to draft legendary pirates!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
