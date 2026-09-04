export interface ProtocolInfo {
  id: string;
  name: string;
  core: string;
  binaryName: string;
  protocolType: 'TCP' | 'UDP' | 'QUIC' | 'HTTP/2' | 'XHTTP';
  camouflage: string;
  antiDpiMechanism: string;
  sampleUri: string;
  defaultPort: number;
}

export const PROTOCOLS: ProtocolInfo[] = [
  {
    id: 'vless-xhttp-reality',
    name: 'VLESS + XHTTP + REALITY',
    core: 'Xray-core (v1.8.11+)',
    binaryName: 'xray-daemon',
    protocolType: 'XHTTP',
    camouflage: 'Steals TLS cert from genuine CDN/SNI (e.g. www.microsoft.com)',
    antiDpiMechanism: 'XHTTP packet framing mimics HTTP/3 and HTTP/2 POST streams; zero TLS fingerprinting via uTLS ClientHello mimicry.',
    sampleUri: 'vless://9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210@198.51.100.1:443?encryption=none&flow=&security=reality&sni=www.apple.com&fp=chrome&pbk=7z_K_kH2xP3R9wQ0aB8c-DeFgHiJkLmNoPqRsTuVwXy&sid=1a2b3c4d&type=xhttp&path=%2Fpush-notification#US-VLESS-XHTTP-Reality',
    defaultPort: 443
  },
  {
    id: 'hysteria2',
    name: 'Hysteria 2 (with Salamander)',
    core: 'Hysteria-core v2.x',
    binaryName: 'hysteria-daemon',
    protocolType: 'QUIC',
    camouflage: 'Custom QUIC protocol masquerading as standard UDP media',
    antiDpiMechanism: 'Salamander obfuscation scrambles packet header bytes into uniform random noise; Brutal congestion control overrides ISP bandwidth throttling.',
    sampleUri: 'hysteria2://supersecretpass@203.0.113.50:443/?insecure=0&sni=gateway.icloud.com&obfs=salamander&obfs-password=saltKey998#SG-Hysteria2-Salamander',
    defaultPort: 443
  },
  {
    id: 'amnezia-wg',
    name: 'AmneziaWG (Patched WireGuard)',
    core: 'AmneziaWG-go',
    binaryName: 'awg-daemon',
    protocolType: 'UDP',
    camouflage: 'Randomized WireGuard initiation and handshake headers',
    antiDpiMechanism: 'Prepends Jc (junk count) random packets of size Jmin..Jmax before handshake, with custom initiation/response headers H1..H4 and cookie/transport magic values S1, S2.',
    sampleUri: 'amneziawg://Y2xpZW50X3ByaXZhdGVfa2V5=@198.51.100.80:51820?server_pub=c2VydmVyX3B1YmxpY19rZXk=&jc=4&jmin=40&jmax=70&s1=56&s2=112&h1=1&h2=2&h3=3&h4=4#AmneziaWG-DPI-Resistant',
    defaultPort: 51820
  },
  {
    id: 'naiveproxy',
    name: 'NaiveProxy (Chromium Cronet)',
    core: 'NaiveProxy (Cronet)',
    binaryName: 'naive-daemon',
    protocolType: 'HTTP/2',
    camouflage: 'Genuine Chromium browser TLS/HTTP network stack',
    antiDpiMechanism: 'Uses Chrome network stack (identical TLS ClientHello, HTTP/2 multiplexing, padding, and ALPN negotiate) indistinguishable from real web surfing.',
    sampleUri: 'naive+https://user:password@proxy.example.com:443#DE-NaiveProxy-Cronet',
    defaultPort: 443
  },
  {
    id: 'tuic-v5',
    name: 'TUIC v5',
    core: 'tuic-client v5.x',
    binaryName: 'tuic-daemon',
    protocolType: 'QUIC',
    camouflage: 'Direct QUIC 0-RTT tunnel with custom ALPN',
    antiDpiMechanism: 'Zero-RTT UDP connection, BBR congestion control, user authentication inside TLS application layer, resilient against UDP rate limits.',
    sampleUri: 'tuic://9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210:auth_token_99@198.51.100.4:8443?congestion_control=bbr&alpn=h3&sni=cf.cloudflare.com&udp_relay_mode=native#JP-TUICv5-BBR',
    defaultPort: 8443
  },
  {
    id: 'vless-reality-tcp',
    name: 'VLESS + REALITY (TCP/Vision)',
    core: 'Xray-core',
    binaryName: 'xray-daemon',
    protocolType: 'TCP',
    camouflage: 'Direct SNI TLS Camouflage with XTLS Vision flow',
    antiDpiMechanism: 'XTLS Vision padding eliminates TLS-in-TLS packet length signatures; REALITY handshakes directly with real web server.',
    sampleUri: 'vless://9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210@198.51.100.10:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=www.samsung.com&fp=chrome&pbk=8z_K_kH2xP3R9wQ0aB8c-DeFgHiJkLmNoPqRsTuVwXz&sid=2a3b4c5d&type=tcp#KR-VLESS-Vision-Reality',
    defaultPort: 443
  },
  {
    id: 'shadowsocks-2022',
    name: 'Shadowsocks-2022 (AEAD)',
    core: 'Shadowsocks-rust',
    binaryName: 'ss-daemon',
    protocolType: 'TCP',
    camouflage: 'AEAD-2022 Blake3 session subkey encryption',
    antiDpiMechanism: 'Zero-length packet detection resistance, strict timestamp replay protection, independent salt entropy.',
    sampleUri: 'ss://2022-blake3-aes-128-gcm:ZXhhbXBsZXBhc3N3b3JkMTI4=@198.51.100.99:8388#Shadowsocks-2022',
    defaultPort: 8388
  },
  {
    id: 'cloudflare-warp-cleanip',
    name: 'Cloudflare WARP (Clean-IP Anycast)',
    core: 'Cloudflare Zero-Trust / WireGuard-go',
    binaryName: 'warp-daemon',
    protocolType: 'UDP',
    camouflage: 'WireGuard packets disguised with Cloudflare Client identity headers [0,0,0]',
    antiDpiMechanism: 'Zero-config instant access with Clean Anycast IP Scanner (162.159.192.x) to evade ISP IP-blocking filters.',
    sampleUri: 'warp://aHR0cHM6Ly9jbG91ZGZsYXJlLndhcnAucHJpdmF0ZS5rZXk=@162.159.192.1:2408?reserved=0,0,0&mtu=1280&plus=true#Cloudflare-WARP-CleanIP',
    defaultPort: 2408
  },
  {
    id: 'ssh-tunnel-ws-cdn',
    name: 'SSH over WebSocket / CDN',
    core: 'OpenSSH + wstunnel client',
    binaryName: 'ssh-daemon',
    protocolType: 'TCP',
    camouflage: 'Cloudflare CDN reverse-proxy with HTTP 101 Switching Protocols header',
    antiDpiMechanism: 'Camouflages SSH interactive session inside standard CDN WebSocket streams, bypassing port 22 firewalls.',
    sampleUri: 'ssh://free_user:free_pass@ssh.anticensor.org:443?sni=cdn.cloudflare.net&ws=1&proxy=104.16.132.229&proxy_port=443#SSH-WebSocket-CDN',
    defaultPort: 443
  },
  {
    id: 'shadowsocks-cloak-cdn',
    name: 'Shadowsocks + Cloak (TLS SNI Camouflage)',
    core: 'Shadowsocks-rust + Cloak plugin',
    binaryName: 'cloak-daemon',
    protocolType: 'TCP',
    camouflage: 'Mimics real Google/Cloudflare TLS ClientHello & genuine web certs',
    antiDpiMechanism: 'Multi-user multiplexed TLS camouflage; unauthorized probes receive real web server landing page responses.',
    sampleUri: 'ss://YWVzLTEyOC1nY206Y2xvYWtfYWVhZF9wYXNzd29yZA==@198.51.100.150:443?plugin=cloak&plugin-opts=fakeDomain%3Ddl.google.com%3Bbrowser%3Dchrome#SS-Cloak-Google-Camouflage',
    defaultPort: 443
  }
];

export interface FileEntry {
  path: string;
  language: string;
  category: 'gradle' | 'manifest' | 'ndk' | 'jni' | 'kotlin' | 'c' | 'header';
  phase?: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 5';
  description: string;
  content: string;
}
