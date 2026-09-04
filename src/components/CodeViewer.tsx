import React, { useState } from 'react';
import { Copy, Check, FileCode, FolderGit2, ShieldCheck, Layers, Cpu } from 'lucide-react';
import { ALL_PROJECT_FILES } from '../data/projectFiles';
import { FileEntry } from '../types';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileEntry>(
    ALL_PROJECT_FILES.find(f => f.path.includes('ProcessManager.kt')) || ALL_PROJECT_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'Phase 1' | 'Phase 2' | 'Phase 3'>('Phase 3');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredFiles = ALL_PROJECT_FILES.filter(f => {
    const matchesPhase = phaseFilter === 'all' || f.phase === phaseFilter;
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesPhase && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Full Source Code Inspector</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              {ALL_PROJECT_FILES.length} Compilable Files (Phases 1, 2 &amp; 3)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse complete production Gradle KTS, CMakeLists, C11 hev-socks5-tunnel engine, ProcessManager, and DaemonService.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter Tabs */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['all', 'Phase 1', 'Phase 2', 'Phase 3'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPhaseFilter(p)}
                className={`text-xs px-2.5 py-1 rounded transition-colors font-mono ${
                  phaseFilter === p
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {p === 'all' ? 'All Phases' : p}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {(['all', 'c', 'header', 'jni', 'ndk', 'kotlin', 'gradle', 'manifest'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[11px] px-2 py-1 rounded transition-colors uppercase font-mono ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/40 p-3 space-y-1.5 overflow-y-auto max-h-[640px]">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1">
            <span>Project Tree ({filteredFiles.length} files)</span>
            <span>{phaseFilter}</span>
          </div>
          {filteredFiles.map(file => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 font-medium'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate font-mono text-[11px]">
                    <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                      file.phase === 'Phase 2' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {file.phase}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 pl-5">
                  {file.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Code Content Window */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          {/* File bar */}
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-semibold">{selectedFile.path}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{selectedFile.content.split('\n').length} lines</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{selectedFile.phase}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors border border-slate-700 font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="p-4 overflow-auto font-mono text-xs text-slate-300 bg-slate-950 max-h-[560px] leading-relaxed select-text">
            <table className="w-full border-collapse">
              <tbody>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre overflow-x-auto text-[12px] text-slate-200">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
