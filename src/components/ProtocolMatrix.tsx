import React, { useState } from 'react';
import { PROTOCOLS, ProtocolInfo } from '../types';
import { Shield, Zap, Radio, Globe, Terminal, ChevronRight } from 'lucide-react';

export const ProtocolMatrix: React.FC = () => {
  const [selectedProto, setSelectedProto] = useState<ProtocolInfo>(PROTOCOLS[0]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>Multi-Core Engine Registry</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">7+ Censorship-Resistant Protocols</h2>
          <p className="text-xs text-slate-400">
            Each protocol engine is decoupled into a standalone daemon binary. When selected, the app stops the active binary and spawns the target daemon binding to 127.0.0.1:10808.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/50">
          Core Collision Risk: <span className="text-emerald-400 font-semibold">0% (Port Isolated)</span>
        </div>
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROTOCOLS.map(proto => {
          const isSelected = selectedProto.id === proto.id;
          return (
            <button
              key={proto.id}
              onClick={() => setSelectedProto(proto)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/70 shadow-lg ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    proto.protocolType === 'QUIC'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : proto.protocolType === 'XHTTP'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : proto.protocolType === 'HTTP/2'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {proto.protocolType}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Port {proto.defaultPort}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">{proto.name}</div>
                <div className="text-xs font-mono text-cyan-400/90 mb-2">Core: {proto.core}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{proto.camouflage}</div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Daemon: {proto.binaryName}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Protocol Deep Dive */}
      <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">{selectedProto.name}</span>
            <span className="text-xs text-slate-400 font-mono">({selectedProto.core})</span>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            Loopback SOCKS5 Target: 127.0.0.1:10808
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Anti-DPI / Censorship Circumvention Mechanism
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProto.antiDpiMechanism}
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Traffic Camouflage & Handshake Signature
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProto.camouflage}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Standard Connection URI Representation
          </div>
          <div className="p-2 bg-slate-950 rounded font-mono text-xs text-cyan-300 break-all select-all border border-slate-800/80">
            {selectedProto.sampleUri}
          </div>
        </div>
      </div>
    </div>
  );
};
