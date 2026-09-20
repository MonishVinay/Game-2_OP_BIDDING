import React, { useState, useMemo } from 'react';
import CharacterCard from './CharacterCard';
import { CHARACTERS, ROSTER_STATS } from '../../data/characters.js';
import { X, Search, Filter, Shield, Swords, Sparkles, BookOpen } from 'lucide-react';

export default function CharacterDex({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [selectedFaction, setSelectedFaction] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const filteredCharacters = useMemo(() => {
    return CHARACTERS.filter(char => {
      const matchSearch = !search || 
        char.name.toLowerCase().includes(search.toLowerCase()) ||
        char.faction.toLowerCase().includes(search.toLowerCase()) ||
        char.role.toLowerCase().includes(search.toLowerCase()) ||
        (char.title && char.title.toLowerCase().includes(search.toLowerCase()));

      const matchTier = selectedTier === 'ALL' || char.tier === selectedTier;
      const matchFaction = selectedFaction === 'ALL' || char.faction === selectedFaction;
      const matchRole = selectedRole === 'ALL' || char.role === selectedRole;

      return matchSearch && matchTier && matchFaction && matchRole;
    });
  }, [search, selectedTier, selectedFaction, selectedRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-600/60 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-amber-300 font-serif">
                Grand Line Character Archive (150 Roster)
              </h2>
              <p className="text-xs text-amber-200/70">
                Explore all 150 One Piece characters, bounties, roles, factions, and combat attributes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search characters by name, title, role, or crew..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>

            {/* Clear button if filtered */}
            {(search || selectedTier !== 'ALL' || selectedFaction !== 'ALL' || selectedRole !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedTier('ALL');
                  setSelectedFaction('ALL');
                  setSelectedRole('ALL');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Tier Filter */}
            <span className="text-slate-400 font-mono text-[11px] uppercase mr-1">TIER:</span>
            {['ALL', 'EX', 'SSR', 'SR', 'R'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border transition ${
                  selectedTier === tier
                    ? 'bg-amber-600 text-white border-amber-400 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {tier}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            {/* Faction Select */}
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Factions ({ROSTER_STATS.factions.length})</option>
              {ROSTER_STATS.factions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Role Select */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Roles ({ROSTER_STATS.roles.length})</option>
              {ROSTER_STATS.roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <span className="ml-auto text-xs text-amber-400/80 font-mono">
              Showing {filteredCharacters.length} of 150
            </span>
          </div>
        </div>

        {/* Character Card Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  size="small"
                  showStats={true}
                  showQuote={false}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl block">🔍</span>
              <p className="text-sm font-serif">No characters match your search filters.</p>
              <p className="text-xs text-slate-500">Try changing your search query or reset the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
