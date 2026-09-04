import React, { useState } from 'react';
import { PROTOCOLS } from '../types';
import { Play, FileText, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';

export const UriConfigLab: React.FC = () => {
  const [selectedProtocolId, setSelectedProtocolId] = useState(PROTOCOLS[0].id);
  const [customUri, setCustomUri] = useState(PROTOCOLS[0].sampleUri);
  const [copied, setCopied] = useState(false);

  const activeProto = PROTOCOLS.find(p => p.id === selectedProtocolId) || PROTOCOLS[0];

  const handleSelectProto = (id: string) => {
    setSelectedProtocolId(id);
    const p = PROTOCOLS.find(x => x.id === id);
    if (p) {
      setCustomUri(p.sampleUri);
    }
  };

  // Generate daemon-specific configuration preview based on the URI and protocol
  const generateDaemonConfig = () => {
    if (selectedProtocolId.startsWith('vless')) {
      return JSON.stringify(
        {
          log: { loglevel: 'warning' },
          inbounds: [
            {
              tag: 'socks-in',
              port: 10808,
              listen: '127.0.0.1',
              protocol: 'socks',
              settings: { auth: 'noauth', udp: true }
            }
          ],
          outbounds: [
            {
              protocol: 'vless',
              settings: {
                vnext: [
                  {
                    address: '198.51.100.1',
                    port: 443,
                    users: [{ id: '9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210', encryption: 'none' }]
                  }
                ]
              },
              streamSettings: {
                network: selectedProtocolId.includes('xhttp') ? 'xhttp' : 'tcp',
                security: 'reality',
                realitySettings: {
                  show: false,
                  fingerprint: 'chrome',
                  serverName: 'www.apple.com',
                  publicKey: '7z_K_kH2xP3R9wQ0aB8c-DeFgHiJkLmNoPqRsTuVwXy',
                  shortId: '1a2b3c4d',
                  spiderX: ''
                }
              }
            }
          ]
        },
        null,
        2
      );
    }

    if (selectedProtocolId === 'hysteria2') {
      return `# Hysteria 2 Config (YAML) for hysteria-daemon
server: 203.0.113.50:443
auth: supersecretpass

tls:
  sni: gateway.icloud.com
  insecure: false

obfs:
  type: salamander
  salamander:
    password: saltKey998

socks5:
  listen: 127.0.0.1:10808

bandwidth:
  up: 80 mbps
  down: 300 mbps

quic:
  initStreamReceiveWindow: 8388608
  maxStreamReceiveWindow: 8388608`;
    }

    if (selectedProtocolId === 'amnezia-wg') {
      return `[Interface]
PrivateKey = Y2xpZW50X3ByaXZhdGVfa2V5=
Address = 10.8.0.2/24
DNS = 1.1.1.1
# AmneziaWG DPI-Resistant Header & Junk parameters
Jc = 4
Jmin = 40
Jmax = 70
S1 = 56
S2 = 112
H1 = 1
H2 = 2
H3 = 3
H4 = 4

[Peer]
PublicKey = c2VydmVyX3B1YmxpY19rZXk=
Endpoint = 198.51.100.80:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;
    }

    if (selectedProtocolId === 'naiveproxy') {
      return JSON.stringify(
        {
          listen: 'socks://127.0.0.1:10808',
          proxy: 'https://user:password@proxy.example.com:443',
          insecure_concurrency: 1,
          padding: true
        },
        null,
        2
      );
    }

    if (selectedProtocolId === 'tuic-v5') {
      return JSON.stringify(
        {
          relay: {
            server: '198.51.100.4:8443',
            uuid: '9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210',
            password: 'auth_token_99',
            ip: '198.51.100.4',
            alpn: ['h3'],
            sni: 'cf.cloudflare.com',
            udp_relay_mode: 'native',
            zero_rtt_handshake: true,
            congestion_controller: 'bbr'
          },
          local: {
            server: '127.0.0.1:10808',
            dual_stack: false
          }
        },
        null,
        2
      );
    }

    return `# Default daemon config\nlisten: 127.0.0.1:10808`;
  };

  const hevTunnelYaml = `tunnel:
  name: tun0
  mtu: 1500
  multi-queue: false

socks5:
  port: 10808
  address: 127.0.0.1
  udp: 'udp'

misc:
  task-stack-size: 20480
  connect-timeout: 5000
  read-write-timeout: 60000
  log-level: warn`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Play className="w-3.5 h-3.5" />
            <span>Phase 4 Generator Preview</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">URI-to-Daemon Config Generator Testbench</h2>
          <p className="text-xs text-slate-400">
            Verify how input share links convert into isolated executable daemon configuration files on localhost:10808.
          </p>
        </div>
      </div>

      {/* Protocol selector tabs */}
      <div className="flex flex-wrap gap-2">
        {PROTOCOLS.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelectProto(p.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
              selectedProtocolId === p.id
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Input URI Box */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
          Input URI / Deep-Link (Android Intent Scheme: <span className="text-cyan-400">{activeProto.sampleUri.split(':')[0]}</span>)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customUri}
            onChange={(e) => setCustomUri(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSelectProto(selectedProtocolId)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700"
            title="Reset to default sample"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Side-by-side Config generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Generated Core Config */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-white">
                  Generated Daemon Config: <span className="text-cyan-400">{activeProto.binaryName}</span>
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateDaemonConfig())}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre-wrap">
              {generateDaemonConfig()}
            </pre>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Binds daemon outbound to proxy & inbound to 127.0.0.1:10808
          </div>
        </div>

        {/* hev-socks5-tunnel yaml config */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-semibold text-white">
                  hev-socks5-tunnel Config (<span className="text-amber-400">hev_tunnel_config.yaml</span>)
                </span>
              </div>
              <button
                onClick={() => handleCopy(hevTunnelYaml)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono text-amber-300/90 overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre-wrap">
              {hevTunnelYaml}
            </pre>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Fed directly to native C JNI bridge <code className="text-white">HevTunnel.init(path, tunFd)</code>
          </div>
        </div>
      </div>
    </div>
  );
};
