import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  FileCode,
  Radio,
  Play,
  Terminal,
  Download,
  CheckCircle2,
  Shield,
  Activity,
  Zap,
  Smartphone
} from 'lucide-react';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { CodeViewer } from './components/CodeViewer';
import { ProtocolMatrix } from './components/ProtocolMatrix';
import { PhaseRoadmap } from './components/PhaseRoadmap';
import { Phase2TunnelLab } from './components/Phase2TunnelLab';
import { Phase3DaemonLab } from './components/Phase3DaemonLab';
import { Phase4ConfigLab } from './components/Phase4ConfigLab';
import { Phase5ComposeLab } from './components/Phase5ComposeLab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'phase5' | 'phase4' | 'phase3' | 'phase2' | 'architecture' | 'code' | 'protocols' | 'roadmap'>('phase5');

  const downloadProjectZip = () => {
    // Allows developer to export the Phase 1, 2, 3 & 4 structure summary
    const summary = `# AegisVPN - Android Censorship-Resistant VPN Client (Phases 1, 2, 3 & 4 Delivered)
Delivered files are stored in /android directory:

### Phase 1: Build & Process Foundation
- android/settings.gradle.kts
- android/gradle/libs.versions.toml
- android/build.gradle.kts
- android/app/build.gradle.kts
- android/app/src/main/AndroidManifest.xml
- android/app/src/main/java/org/anticensor/vpn/AegisApplication.kt
- android/app/proguard-rules.pro

### Phase 2: hev-socks5-tunnel NDK C & YAML Architecture
- android/app/src/main/cpp/CMakeLists.txt
- android/app/src/main/cpp/hev-socks5-tunnel.h
- android/app/src/main/cpp/hev-socks5-tunnel-bridge.c
- android/app/src/main/cpp/hev-socks5-tunnel-core.c
- android/app/src/main/cpp/hev-socks5-tunnel-config.h
- android/app/src/main/cpp/hev-socks5-tunnel-config.c
- android/app/src/main/cpp/hev-task-system.h
- android/app/src/main/cpp/hev-task-system.c
- android/app/src/main/java/org/anticensor/vpn/core/tunnel/HevTunnel.kt
- android/app/src/main/java/org/anticensor/vpn/core/tunnel/HevTunnelConfig.kt
- android/app/src/main/java/org/anticensor/vpn/service/AegisVpnService.kt

### Phase 3: ProcessManager, BinaryManager & DaemonService
- android/app/src/main/java/org/anticensor/vpn/core/process/DaemonState.kt
- android/app/src/main/java/org/anticensor/vpn/core/process/BinaryManager.kt
- android/app/src/main/java/org/anticensor/vpn/core/process/ProcessManager.kt
- android/app/src/main/java/org/anticensor/vpn/core/process/ProcessHealthMonitor.kt
- android/app/src/main/java/org/anticensor/vpn/service/DaemonService.kt

### Phase 4: Config Parsers & Generators
- android/app/src/main/java/org/anticensor/vpn/core/parser/ProtocolModels.kt
- android/app/src/main/java/org/anticensor/vpn/core/parser/UriParser.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/XrayConfigGenerator.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/HysteriaConfigGenerator.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/NaiveConfigGenerator.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/TuicConfigGenerator.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/AmneziaConfigGenerator.kt
- android/app/src/main/java/org/anticensor/vpn/core/generator/ConfigGeneratorFactory.kt

### Phase 5: Jetpack Compose UI & Latency Engine
- android/app/src/main/java/org/anticensor/vpn/core/network/PingLatencyTester.kt
- android/app/src/main/java/org/anticensor/vpn/ui/theme/Color.kt
- android/app/src/main/java/org/anticensor/vpn/ui/theme/Theme.kt
- android/app/src/main/java/org/anticensor/vpn/ui/viewmodel/ServerViewModel.kt
- android/app/src/main/java/org/anticensor/vpn/ui/screens/MainScreen.kt
- android/app/src/main/java/org/anticensor/vpn/ui/screens/ServerListScreen.kt
- android/app/src/main/java/org/anticensor/vpn/ui/screens/LogViewerScreen.kt
- android/app/src/main/java/org/anticensor/vpn/ui/MainActivity.kt
`;
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AegisVPN-Phases-1-to-5-Complete-Spec.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base">AegisVPN Engine</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  All 5 Phases Complete
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Multi-Core Censorship-Resistant Android Client Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadProjectZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export Spec
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>tun2socks :: 10808</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('phase5')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'phase5'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-300" />
            Phase 5: Jetpack Compose UI
          </button>

          <button
            onClick={() => setActiveTab('phase4')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'phase4'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-300" />
            Phase 4: URI &amp; Config Generators
          </button>

          <button
            onClick={() => setActiveTab('phase3')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'phase3'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Phase 3: Daemon &amp; Process Lab
          </button>

          <button
            onClick={() => setActiveTab('phase2')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'phase2'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Phase 2: hev-socks5-tunnel Lab
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Zero-Collision Architecture
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Source Code Inspector (36+ Files)
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'protocols'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            7+ Protocol Matrix &amp; Cores
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'roadmap'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Execution Roadmap (Phases 1-5)
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'phase5' && (
          <div className="space-y-6">
            <Phase5ComposeLab />
          </div>
        )}

        {activeTab === 'phase4' && (
          <div className="space-y-6">
            <Phase4ConfigLab />
          </div>
        )}

        {activeTab === 'phase3' && (
          <div className="space-y-6">
            <Phase3DaemonLab />
          </div>
        )}

        {activeTab === 'phase2' && (
          <div className="space-y-6">
            <Phase2TunnelLab />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureDiagram />

            {/* Architectural Highlights Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  No Monolithic Collision
                </div>
                <h3 className="text-sm font-semibold text-white">Modular Subprocess Daemons</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instead of compiling Go (Xray, Hysteria), Rust (Shadowsocks, TUIC), and C/C++ (Cronet NaiveProxy) into one massive library with symbol clashes, each engine lives as a standalone executable spawned only on demand.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Ultra-Fast C tun2socks
                </div>
                <h3 className="text-sm font-semibold text-white">hev-socks5-tunnel via JNI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traffic from Android's virtual TUN interface is piped via Linux File Descriptor into <code className="text-cyan-300">libhev-socks5-tunnel.so</code>, using an epoll coroutine event loop with zero-copy buffers.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Process Isolation
                </div>
                <h3 className="text-sm font-semibold text-white">:vpn_core Sandbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The <code className="text-purple-300">AegisVpnService</code> runs in an isolated Android OS process (<code className="text-cyan-300">:vpn_core</code>). If any native daemon runs out of memory or hits an unhandled signal, the main Compose UI stays intact.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeViewer />
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="space-y-6">
            <ProtocolMatrix />
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <PhaseRoadmap />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            AegisVPN Open-Source Censorship Resistance Engine • Android NDK 26+ / CMake 3.22 / Kotlin 2.0
          </div>
          <div className="text-emerald-400">
            Phases 1, 2, 3 &amp; 4 Delivered • Ready for Phase 5 (Jetpack Compose UI &amp; Testing)
          </div>
        </div>
      </footer>
    </div>
  );
}
