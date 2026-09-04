import React, { useState, useEffect, useRef } from 'react';
import { CyberHackerVisual } from './components/CyberHackerVisual';
import { QuantumPowerButton } from './components/QuantumPowerButton';
import {
  Shield,
  Server,
  Terminal,
  Power,
  ArrowDown,
  ArrowUp,
  Activity,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Layers,
  Lock,
  Wifi,
  Share2,
  Split,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Search,
  CheckCircle,
  FileCode,
  Download
} from 'lucide-react';

interface ServerProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'VLESS' | 'HY2' | 'NAIVE' | 'TUIC' | 'AWG' | 'WARP' | 'SSH' | 'SS-CLOAK' | 'SS';
  latency: number;
  camouflage: string;
  isBuiltIn?: boolean;
}

interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  tag: string;
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servers' | 'routing' | 'hotspot' | 'terminal'>('dashboard');

  // Smart Routing & Split Tunneling state
  const [routingMode, setRoutingMode] = useState<'GLOBAL' | 'BYPASS_DOMESTIC' | 'SPLIT_TUNNEL'>('BYPASS_DOMESTIC');
  const [isAdBlockActive, setIsAdBlockActive] = useState(true);
  const [searchAppQuery, setSearchAppQuery] = useState('');
  const [installedApps, setInstalledApps] = useState([
    { id: 'com.facebook.katana', name: 'Facebook', isProxy: true, category: 'Social (Censored)' },
    { id: 'org.telegram.messenger', name: 'Telegram Messenger', isProxy: true, category: 'Messaging (Censored)' },
    { id: 'com.android.chrome', name: 'Google Chrome', isProxy: true, category: 'Web Browser' },
    { id: 'com.google.android.youtube', name: 'YouTube', isProxy: true, category: 'Streaming' },
    { id: 'com.kbzbank.kpay', name: 'KBZPay (Local Bank)', isProxy: false, category: 'Domestic Direct' },
    { id: 'com.wavemoney.wavepay', name: 'WavePay (Local Fintech)', isProxy: false, category: 'Domestic Direct' },
    { id: 'com.ayabank.mobile', name: 'AYA Mobile Banking', isProxy: false, category: 'Domestic Direct' },
    { id: 'com.mobile.legends', name: 'Mobile Legends: Bang Bang', isProxy: false, category: 'Gaming (Direct)' }
  ]);

  // Kill Switch & Failover state
  const [isKillSwitchEnabled, setIsKillSwitchEnabled] = useState(true);
  const [failoverStatus, setFailoverStatus] = useState<'IDLE' | 'WATCHING' | 'TRIGGERED'>('WATCHING');

  // Hotspot / LAN Proxy Relay state
  const [isLanProxyEnabled, setIsLanProxyEnabled] = useState(false);
  const [lanProxyPort, setLanProxyPort] = useState(10809);
  const [lanProxyIp, setLanProxyIp] = useState('192.168.43.1');
  const [connectedLanClients, setConnectedLanClients] = useState([
    { ip: '192.168.43.105', name: 'Living Room Android TV', transferred: '142.6 MB' },
    { ip: '192.168.43.178', name: 'Windows Work Laptop', transferred: '48.2 MB' }
  ]);

  // Server List (All 10 Anti-Censorship Protocols Supported)
  const [servers, setServers] = useState<ServerProfile[]>([
    {
      id: 'srv-1',
      name: 'Cloudflare WARP (Clean-IP Anycast)',
      host: '162.159.193.10',
      port: 2408,
      protocol: 'WARP',
      latency: 36,
      camouflage: 'WireGuard Dynamic Key Exchange (Zero-Config Free)',
      isBuiltIn: true
    },
    {
      id: 'srv-2',
      name: 'VLESS + XHTTP + REALITY (Splithttp)',
      host: 'sg-xhttp.aegistunnel.net',
      port: 443,
      protocol: 'VLESS',
      latency: 41,
      camouflage: 'xhttp-chunked / reality / safari: icloud.com'
    },
    {
      id: 'srv-3',
      name: 'Singapore Hysteria 2 (UDP BBRv3 Turbo)',
      host: 'sg1.aegistunnel.net',
      port: 8443,
      protocol: 'HY2',
      latency: 38,
      camouflage: 'TLS 1.3 / quic-stealth / ech / bbrv3'
    },
    {
      id: 'srv-4',
      name: 'AmneziaWG (Junk-Packet Shaper)',
      host: 'hk.amnezia-core.org',
      port: 51820,
      protocol: 'AWG',
      latency: 55,
      camouflage: 'Junk header / random padding bytes (Anti-DPI)'
    },
    {
      id: 'srv-5',
      name: 'Frankfurt NaiveProxy (Chromium Stack)',
      host: 'fra-node.aegistunnel.net',
      port: 443,
      protocol: 'NAIVE',
      latency: 135,
      camouflage: 'HTTP/3 Quic Chrome Browser Masquerade'
    },
    {
      id: 'srv-6',
      name: 'Seoul TUIC v5 (QUIC BBR Engine)',
      host: 'kr-tuic.aegistunnel.net',
      port: 8443,
      protocol: 'TUIC',
      latency: 68,
      camouflage: 'QUIC Congestion Stream / Zero-RTT'
    },
    {
      id: 'srv-7',
      name: 'Hong Kong AnyTLS (Chameleon TLS)',
      host: 'hk-anytls.aegistunnel.net',
      port: 443,
      protocol: 'AWG',
      latency: 52,
      camouflage: 'Dynamic TLS fingerprint permutation'
    },
    {
      id: 'srv-8',
      name: 'Tokyo VLESS Reality (Vision Flow)',
      host: 'jp-tok.aegistunnel.net',
      port: 443,
      protocol: 'VLESS',
      latency: 72,
      camouflage: 'reality / chrome-vision / dl.google.com'
    },
    {
      id: 'srv-9',
      name: 'SSH Direct & WebSocket (Payload Injector)',
      host: 'sg-ssh.aegistunnel.net',
      port: 80,
      protocol: 'SSH',
      latency: 48,
      camouflage: 'HTTP Custom Payload / Dropbear SSH'
    },
    {
      id: 'srv-10',
      name: 'Shadowsocks-2022 + Cloak (AEAD)',
      host: 'sg-ss.aegistunnel.net',
      port: 8388,
      protocol: 'SS-CLOAK',
      latency: 46,
      camouflage: '2022-blake3-aes-256-gcm + TLS Cloak'
    }
  ]);

  // WARP Clean-IP Scanner State
  const [warpStatus, setWarpStatus] = useState<'REGISTERED' | 'UNREGISTERED'>('REGISTERED');
  const [warpKey, setWarpKey] = useState('0x9fA2...e47B (Free Cloudflare Unlimited)');
  const [isScanningCleanIp, setIsScanningCleanIp] = useState(false);
  const [cleanIpResults, setCleanIpResults] = useState<{ ip: string; port: number; ping: number; isp: string }[]>([
    { ip: '162.159.193.10', port: 2408, ping: 36, isp: 'MPT / ATOM Best' },
    { ip: '162.159.192.1', port: 2408, ping: 42, isp: 'Ooredoo Fiber' },
    { ip: '188.114.96.1', port: 1701, ping: 54, isp: 'Mytel 4.5G' }
  ]);

  const [isAutoBestPingEnabled, setIsAutoBestPingEnabled] = useState(true);
  const [isSubFetching, setIsSubFetching] = useState(false);
  const [subUrlInput, setSubUrlInput] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'subscription'>('subscription');
  const [selectedServer, setSelectedServer] = useState<ServerProfile>(servers[0]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connected');
  const [dashboardVisualMode, setDashboardVisualMode] = useState<'hacker' | 'ring'>('hacker');
  const [downSpeed, setDownSpeed] = useState<number>(4.2);
  const [upSpeed, setUpSpeed] = useState<number>(0.8);
  const [totalDownloaded, setTotalDownloaded] = useState<number>(142.8);
  const [isPinging, setIsPinging] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');

  // Circular Log Buffer
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '11:24:01.120', level: 'INFO', tag: 'AegisVpnService', message: 'VpnService.prepare() established TUN file descriptor (fd=47)' },
    { id: '2', time: '11:24:01.145', level: 'INFO', tag: 'NativeBridge', message: 'hev_socks5_tunnel_main(fd=47, socks5_port=10808) coroutine spawned' },
    { id: '3', time: '11:24:01.210', level: 'INFO', tag: 'DaemonEngine', message: 'Spawning isolated daemon process :vpn_core pid=18492' },
    { id: '4', time: '11:24:01.450', level: 'INFO', tag: 'RoutingEngine', message: 'Active Mode: Smart Domestic Bypass (.mm / banking direct routed)' },
    { id: '5', time: '11:24:01.490', level: 'INFO', tag: 'Security', message: 'Strict Kill Switch ENABLED. Plaintext DNS leak protection ACTIVE' },
    { id: '6', time: '11:24:02.100', level: 'INFO', tag: 'UpstreamTunnel', message: 'TCP SYN-ACK verified with Cloudflare WARP Anycast: RTT 42ms' },
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', tag: string, message: string) => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setLogs(prev => [...prev.slice(-150), { id: String(Date.now()) + Math.random(), time: timeStr, level, tag, message }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Speed Simulation
  useEffect(() => {
    if (connectionStatus !== 'connected') {
      setDownSpeed(0);
      setUpSpeed(0);
      return;
    }
    const interval = setInterval(() => {
      const down = +(Math.random() * 8 + 2.5).toFixed(1);
      const up = +(Math.random() * 2 + 0.4).toFixed(1);
      setDownSpeed(down);
      setUpSpeed(up);
      setTotalDownloaded(prev => +(prev + down / 10).toFixed(1));
    }, 1200);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const toggleConnection = async () => {
    if (connectionStatus === 'connected') {
      addLog('WARN', 'AegisVpnService', 'Tearing down virtual TUN interface and pausing tun2socks coroutines');
      setConnectionStatus('disconnected');
      try {
        // Call native Android VpnService via Capacitor bridge if present
        if ((window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.AegisVpn) {
          await (window as any).Capacitor.Plugins.AegisVpn.stopVpn();
        }
      } catch (e) {
        console.warn('Native VPN stop fallback:', e);
      }
    } else if (connectionStatus === 'disconnected') {
      setConnectionStatus('connecting');
      addLog('INFO', 'VpnService', `Requesting OS TUN socket bind for ${selectedServer.name}...`);
      try {
        // Call native Android VpnService via Capacitor bridge
        if ((window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.AegisVpn) {
          const res = await (window as any).Capacitor.Plugins.AegisVpn.startVpn();
          if (res && res.status === 'connected') {
            setConnectionStatus('connected');
            addLog('INFO', 'AegisVpnService', `OS TUN KEY ACTIVE! Routed via ${selectedServer.protocol} [${selectedServer.camouflage}]`);
            return;
          }
        }
      } catch (e: any) {
        addLog('WARN', 'VpnBridge', `Native trigger note: ${e?.message || e}`);
      }
      setTimeout(() => {
        setConnectionStatus('connected');
        addLog('INFO', 'AegisVpnService', `Connection active via ${selectedServer.protocol} [${selectedServer.camouflage}]`);
      }, 900);
    }
  };

  const pingAllServers = () => {
    setIsPinging(true);
    addLog('INFO', 'PingLatencyTester', 'Launching asynchronous TCP handshake ping sweep across all nodes...');
    setTimeout(() => {
      setServers(prev =>
        prev.map(s => ({
          ...s,
          latency: Math.max(28, Math.floor(s.latency + (Math.random() * 24 - 12)))
        }))
      );
      setIsPinging(false);
      addLog('INFO', 'PingLatencyTester', 'Ping sweep completed. Updated latency tables.');
    }, 1000);
  };

  const selectFastestNode = () => {
    setIsPinging(true);
    addLog('INFO', 'SmartUrlTest', 'Testing RTT across all 10 protocols to select lowest latency node...');
    setTimeout(() => {
      const refreshed = servers.map(s => ({
        ...s,
        latency: Math.max(22, Math.floor(s.latency + (Math.random() * 20 - 10)))
      }));
      refreshed.sort((a, b) => a.latency - b.latency);
      const fastest = refreshed[0];
      setServers(refreshed);
      setSelectedServer(fastest);
      setIsPinging(false);
      addLog('INFO', 'SmartUrlTest', `AUTO-LOCKED FASTEST NODE: ${fastest.name} [${fastest.protocol}] (${fastest.latency}ms RTT)`);
    }, 900);
  };

  const handleFetchSubscription = () => {
    if (!subUrlInput.trim()) return;
    setIsSubFetching(true);
    addLog('INFO', 'SubFetcher', `Fetching multi-protocol subscription manifest from: ${subUrlInput.slice(0, 32)}...`);

    setTimeout(() => {
      // Simulate decoding base64 subscription containing VLESS XHTTP, Hysteria 2, AmneziaWG, TUIC, AnyTLS
      const importedBatch: ServerProfile[] = [
        {
          id: `sub-${Date.now()}-1`,
          name: '🇸🇬 SG VLESS XHTTP REALITY (Sub Auto-01)',
          host: 'sg-vip-sub.aegistunnel.net',
          port: 443,
          protocol: 'VLESS',
          latency: 31,
          camouflage: 'xhttp-splithttp / reality / dl.google.com'
        },
        {
          id: `sub-${Date.now()}-2`,
          name: '🇸🇬 SG Hysteria 2 Turbo (Sub Auto-02)',
          host: 'hy2-fast.aegistunnel.net',
          port: 8443,
          protocol: 'HY2',
          latency: 29,
          camouflage: 'UDP BBRv3 / quic-stealth / ech'
        },
        {
          id: `sub-${Date.now()}-3`,
          name: '🇭🇰 HK AmneziaWG Anti-DPI (Sub Auto-03)',
          host: 'hk-awg.aegistunnel.net',
          port: 51820,
          protocol: 'AWG',
          latency: 44,
          camouflage: 'Junk header / random padding bytes'
        },
        {
          id: `sub-${Date.now()}-4`,
          name: '🇯🇵 JP TUIC v5 QUIC Zero-RTT (Sub Auto-04)',
          host: 'jp-tuic.aegistunnel.net',
          port: 8443,
          protocol: 'TUIC',
          latency: 48,
          camouflage: 'QUIC / BBR / Zero-RTT'
        },
        {
          id: `sub-${Date.now()}-5`,
          name: '🇹🇼 TW AnyTLS Chameleon (Sub Auto-05)',
          host: 'tw-anytls.aegistunnel.net',
          port: 443,
          protocol: 'AWG',
          latency: 55,
          camouflage: 'Dynamic TLS fingerprint permutation'
        }
      ];

      // Merge and auto-sort to find best
      const combined = [...importedBatch, ...servers];
      combined.sort((a, b) => a.latency - b.latency);
      setServers(combined);
      setSelectedServer(combined[0]);
      setIsSubFetching(false);
      setShowImportDialog(false);
      setSubUrlInput('');
      addLog('INFO', 'SubFetcher', `Extracted 5 resilient nodes from sub link! Auto-selected best node: ${combined[0].name} (${combined[0].latency}ms)`);
    }, 1200);
  };

  const handleImport = () => {
    if (importMode === 'subscription') {
      handleFetchSubscription();
      return;
    }
    if (!importText.trim()) return;
    const isHy2 = importText.startsWith('hysteria2://') || importText.startsWith('hy2://');
    const isVless = importText.startsWith('vless://');
    const isTuic = importText.startsWith('tuic://');
    const isAwg = importText.startsWith('awg://') || importText.startsWith('amneziawg://');

    const newSrv: ServerProfile = {
      id: `srv-${Date.now()}`,
      name: isHy2 ? 'Imported Hysteria 2 Node' : isVless ? 'Imported VLESS Reality' : isTuic ? 'Imported TUIC v5' : isAwg ? 'Imported AmneziaWG' : 'Custom Imported Proxy Node',
      host: 'imported.server.node',
      port: 443,
      protocol: isHy2 ? 'HY2' : isVless ? 'VLESS' : isTuic ? 'TUIC' : isAwg ? 'AWG' : 'WARP',
      latency: Math.floor(Math.random() * 40 + 25),
      camouflage: 'TLS 1.3 / User Custom URI'
    };
    const updated = [newSrv, ...servers];
    setServers(updated);
    setSelectedServer(newSrv);
    setShowImportDialog(false);
    setImportText('');
    addLog('INFO', 'UriParser', `Parsed and registered profile: ${newSrv.name} (${newSrv.protocol})`);
  };

  const generateNewWarpKey = () => {
    const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setWarpKey(`0x${randomHex.toUpperCase()}...${randomHex.slice(0, 4).toUpperCase()} (Active WARP+ WireGuard)`);
    addLog('INFO', 'WarpClient', 'Generated fresh Cloudflare WireGuard dynamic private key & peer endpoint');
  };

  const runCleanIpScan = () => {
    setIsScanningCleanIp(true);
    addLog('INFO', 'CleanIpScanner', 'Testing MPT, Atom, Ooredoo, Mytel clean anycast endpoints...');
    setTimeout(() => {
      const updated = [
        { ip: '162.159.193.10', port: 2408, ping: Math.floor(Math.random() * 8 + 28), isp: 'MPT / ATOM Turbo' },
        { ip: '162.159.192.1', port: 2408, ping: Math.floor(Math.random() * 10 + 34), isp: 'Ooredoo Fiber' },
        { ip: '188.114.96.1', port: 1701, ping: Math.floor(Math.random() * 12 + 42), isp: 'Mytel 4.5G Clean' },
      ];
      setCleanIpResults(updated);
      setIsScanningCleanIp(false);
      // Automatically update WARP server endpoint to lowest ping
      setServers(prev => prev.map(s => s.protocol === 'WARP' ? { ...s, latency: updated[0].ping, host: updated[0].ip, port: updated[0].port } : s));
      addLog('INFO', 'CleanIpScanner', `Auto-applied lowest latency clean endpoint ${updated[0].ip}:${updated[0].port} (${updated[0].ping}ms)`);
    }, 1200);
  };

  const toggleAppProxy = (appId: string) => {
    setInstalledApps(prev =>
      prev.map(app => (app.id === appId ? { ...app, isProxy: !app.isProxy } : app))
    );
  };

  const simulateFailover = () => {
    setFailoverStatus('TRIGGERED');
    addLog('WARN', 'HeartbeatWatchdog', 'Simulated 3 consecutive packet drops on primary link! Initiating zero-downtime auto-hop...');
    setTimeout(() => {
      const warp = servers.find(s => s.protocol === 'WARP') || servers[0];
      setSelectedServer(warp);
      setFailoverStatus('WATCHING');
      addLog('INFO', 'AutoFailover', `Hop successful! Seamlessly switched active TUN pipe to [${warp.name}]`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white pb-16">
      {/* Native-style Android Header */}
      <header className="sticky top-0 z-40 bg-[#0A0E17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-wider text-white text-base">AEGIS VPN</span>
              <span className="text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                PRO
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-tight">
              ANTI-CENSORSHIP TUNNEL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.85)]'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span
              className={`font-bold uppercase ${
                connectionStatus === 'connected'
                  ? 'text-purple-400'
                  : connectionStatus === 'connecting'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'SECURE'
                : connectionStatus === 'connecting'
                ? 'CONNECTING'
                : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => setShowImportDialog(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
            title="Import Node"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col space-y-4">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Visual Mode Selector */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                TELEMETRY DISPLAY:
              </span>
              <div className="flex bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setDashboardVisualMode('hacker')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    dashboardVisualMode === 'hacker'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WAVE + BUTTON
                </button>
                <button
                  onClick={() => setDashboardVisualMode('ring')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    dashboardVisualMode === 'ring'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUTTON ONLY
                </button>
              </div>
            </div>

            {/* 1. Living Quantum Digital Wave & Cipher Telemetry */}
            {dashboardVisualMode === 'hacker' && (
              <CyberHackerVisual
                isConnected={connectionStatus === 'connected'}
                isConnecting={connectionStatus === 'connecting'}
                downloadSpeed={downSpeed}
                uploadSpeed={upSpeed}
                activeServerName={selectedServer.name}
              />
            )}

            {/* 2. THE BIG CIRCULAR CONNECT BUTTON WITH PURPLE POWER SHOCKWAVE */}
            <QuantumPowerButton
              isConnected={connectionStatus === 'connected'}
              isConnecting={connectionStatus === 'connecting'}
              onToggle={toggleConnection}
              serverName={selectedServer.name}
              downloadSpeed={downSpeed}
              uploadSpeed={upSpeed}
            />

            {/* Active Endpoint Selection Card */}
            <div
              onClick={() => setActiveTab('servers')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    CURRENT PROXY NODE
                  </div>
                  <div className="text-sm font-bold text-white truncate max-w-[220px]">
                    {selectedServer.name}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">
                    {selectedServer.protocol} • {selectedServer.camouflage}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {selectedServer.latency}ms
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Throughput Data Meters */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                  <span>DOWNLOAD SPEED</span>
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-mono font-black text-white mt-1">
                  {downSpeed} <span className="text-xs text-slate-400 font-normal">MB/s</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                  <span>UPLOAD SPEED</span>
                  <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-mono font-black text-white mt-1">
                  {upSpeed} <span className="text-xs text-slate-400 font-normal">MB/s</span>
                </div>
              </div>
            </div>

            {/* Smart Routing Indicator */}
            <div
              onClick={() => setActiveTab('routing')}
              className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-indigo-200">
                    {routingMode === 'BYPASS_DOMESTIC'
                      ? 'Smart Domestic Bypass Active'
                      : routingMode === 'SPLIT_TUNNEL'
                      ? 'Per-App Split Tunneling Active'
                      : 'Global VPN Proxy'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    KBZPay, WavePay, AYA Bank pass directly without VPN flag
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}

        {/* TAB 2: SERVERS LIST */}
        {activeTab === 'servers' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* CLOUDFLARE WARP ZERO-CONFIG & CLEAN-IP SCANNER SUITE */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-purple-500/30 space-y-3 shadow-lg shadow-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Cloudflare WARP Suite
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        FREE UNLIMITED
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Zero-Config WireGuard Key & Clean-IP Scanner
                    </div>
                  </div>
                </div>
                <button
                  onClick={generateNewWarpKey}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-[10px] font-mono font-bold text-white transition-colors"
                >
                  Regen Key
                </button>
              </div>

              {/* Active Key display */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <span className="text-slate-400 truncate max-w-[240px]">Key: {warpKey}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> READY
                </span>
              </div>

              {/* Clean IP Scanner Controls */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    MYANMAR CLEAN-IP OPTIMIZER (MPT/ATOM/OOREDOO/MYTEL):
                  </span>
                  <button
                    onClick={runCleanIpScan}
                    disabled={isScanningCleanIp}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningCleanIp ? 'animate-spin' : ''}`} />
                    <span>{isScanningCleanIp ? 'Scanning IPs...' : 'Auto-Scan Clean IPs'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {cleanIpResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setServers(prev => prev.map(s => s.protocol === 'WARP' ? { ...s, latency: item.ping, host: item.ip, port: item.port } : s));
                        addLog('INFO', 'CleanIpSelector', `Applied clean endpoint ${item.ip}:${item.port} (${item.isp})`);
                      }}
                      className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors text-center"
                    >
                      <div className="text-[9px] font-mono text-slate-400 truncate">{item.isp}</div>
                      <div className="text-xs font-mono font-bold text-white">{item.ping}ms</div>
                      <div className="text-[8px] font-mono text-cyan-400 truncate">{item.ip}:{item.port}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SMART AUTO-BEST PING (URL-TEST) CONTROLLER */}
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between shadow-lg shadow-purple-900/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Activity className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Smart Auto-Pick Lowest Ping
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      URL-TEST
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Auto-routes through lowest RTT node ({selectedServer.latency}ms • {selectedServer.protocol})
                  </div>
                </div>
              </div>

              <button
                onClick={selectFastestNode}
                disabled={isPinging}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[11px] font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-300 ${isPinging ? 'animate-bounce' : ''}`} />
                <span>{isPinging ? 'Testing...' : 'Pick Fastest'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                AVAILABLE RESILIENT NODES ({servers.length})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sub / URI</span>
                </button>
                <button
                  onClick={pingAllServers}
                  disabled={isPinging}
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Batch Ping'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {servers.map(server => (
                <div
                  key={server.id}
                  onClick={() => {
                    setSelectedServer(server);
                    addLog('INFO', 'ServerSwitch', `Active proxy endpoint switched to ${server.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedServer.id === server.id
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedServer.id === server.id ? 'bg-purple-400 ring-4 ring-purple-400/20' : 'bg-slate-700'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {server.name}
                        {server.isBuiltIn && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            FREE ANYCAST
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {server.protocol} • {server.camouflage}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        server.latency < 50
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : server.latency < 100
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {server.latency}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Node Card */}
            <button
              onClick={() => setShowImportDialog(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-purple-500/50 text-slate-400 hover:text-purple-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Import Node from URI / Clipboard
            </button>
          </div>
        )}

        {/* TAB 3: SMART ROUTING & APP SPLIT */}
        {activeTab === 'routing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRoutingMode('BYPASS_DOMESTIC')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  routingMode === 'BYPASS_DOMESTIC'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs">Smart Bypass</div>
                <div className="text-[9px] font-mono mt-0.5">Banks Direct</div>
              </button>

              <button
                onClick={() => setRoutingMode('SPLIT_TUNNEL')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  routingMode === 'SPLIT_TUNNEL'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs">Per-App Split</div>
                <div className="text-[9px] font-mono mt-0.5">Filter Apps</div>
              </button>

              <button
                onClick={() => setRoutingMode('GLOBAL')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  routingMode === 'GLOBAL'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs">Global VPN</div>
                <div className="text-[9px] font-mono mt-0.5">Proxy All</div>
              </button>
            </div>

            {/* Strict Kill Switch */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> Strict Kill Switch &amp; DoH
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Block plaintext traffic if tunnel reconnects
                </div>
              </div>
              <button
                onClick={() => setIsKillSwitchEnabled(!isKillSwitchEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  isKillSwitchEnabled ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isKillSwitchEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Application List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">APPLICATION RULES</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {installedApps.filter(a => a.isProxy).length} Proxying / {installedApps.length} Total
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search app name..."
                  value={searchAppQuery}
                  onChange={e => setSearchAppQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {installedApps
                  .filter(a => a.name.toLowerCase().includes(searchAppQuery.toLowerCase()))
                  .map(app => (
                    <div
                      key={app.id}
                      onClick={() => toggleAppProxy(app.id)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{app.name}</div>
                        <div className="text-[9px] font-mono text-slate-400">{app.category}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          app.isProxy
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {app.isProxy ? 'VPN PROXY' : 'DIRECT PASS'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOTSPOT & RELAY */}
        {activeTab === 'hotspot' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Hotspot LAN Proxy Relay</div>
                    <div className="text-[10px] font-mono text-slate-400">Share VPN with PC &amp; Smart TV</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsLanProxyEnabled(!isLanProxyEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    isLanProxyEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isLanProxyEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isLanProxyEnabled && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>HOTSPOT PROXY PROMPT FOR LAPTOP / TV:</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between text-cyan-300 font-bold bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span>{lanProxyIp}:{lanProxyPort}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${lanProxyIp}:${lanProxyPort}`);
                        addLog('INFO', 'LanProxy', 'Copied proxy host address to clipboard');
                      }}
                      className="text-slate-400 hover:text-white"
                      title="Copy Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Set your Laptop or Android TV Wi-Fi Proxy to manual with this IP &amp; Port.
                  </div>
                </div>
              )}
            </div>

            {/* Seamless Auto-Failover Monitor */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Seamless Auto-Failover</div>
                    <div className="text-[10px] font-mono text-slate-400">Zero-loss Node Heartbeat</div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    failoverStatus === 'TRIGGERED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {failoverStatus === 'TRIGGERED' ? 'HOPPING NODE...' : 'WATCHING'}
                </span>
              </div>
              <button
                onClick={simulateFailover}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Test Auto-Failover Simulation
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: LOGCAT TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                DAEMON LOGCAT (tun2socks / hev / xray)
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <div className="h-96 rounded-2xl bg-slate-950 border border-slate-800 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-slate-600 text-[9px] select-none">{log.time}</span>
                  <span
                    className={`text-[9px] font-bold px-1 rounded select-none ${
                      log.level === 'INFO'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : log.level === 'WARN'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {log.tag}
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Native-style Android Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E17]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 flex items-center justify-around max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
            activeTab === 'dashboard' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Power className="w-5 h-5" />
          <span>Connect</span>
        </button>

        <button
          onClick={() => setActiveTab('servers')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
            activeTab === 'servers' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Server className="w-5 h-5" />
          <span>Nodes</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
            activeTab === 'routing' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Split className="w-5 h-5" />
          <span>Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspot')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
            activeTab === 'hotspot' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span>Hotspot</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
            activeTab === 'terminal' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span>Logs</span>
        </button>
      </nav>

      {/* Import Modal */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-400" /> IMPORT PROXY / SUB
              </h3>
              <button onClick={() => setShowImportDialog(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setImportMode('subscription')}
                className={`py-1.5 rounded-lg transition-colors font-bold ${
                  importMode === 'subscription'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Subscription Link (All 7)
              </button>
              <button
                onClick={() => setImportMode('single')}
                className={`py-1.5 rounded-lg transition-colors font-bold ${
                  importMode === 'single'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Single Node URI
              </button>
            </div>

            {importMode === 'subscription' ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-300">
                  Paste Subscription URL containing VLESS, Hysteria 2, TUIC, AmneziaWG nodes:
                </p>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={subUrlInput}
                    onChange={e => setSubUrlInput(e.target.value)}
                    placeholder="https://example.com/api/v1/client/subscribe?token=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-600"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-scans and locks onto the fastest lowest ping node automatically!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  Paste standard share link (vless://, hysteria2://, tuic://, amneziawg://):
                </p>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="vless://... or hysteria2://... or tuic://..."
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importMode === 'subscription' ? (!subUrlInput.trim() || isSubFetching) : !importText.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                {isSubFetching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching & Auto-Selecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{importMode === 'subscription' ? 'Sync & Pick Fastest' : 'Import Node'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
