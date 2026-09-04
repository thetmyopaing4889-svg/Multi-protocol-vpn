import { FileEntry } from '../types';

export const PHASE_4_FILES: FileEntry[] = [
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/parser/ProtocolModels.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Strongly-typed Kotlin data models for VLESS, Hysteria 2, NaiveProxy, TUIC v5, and AmneziaWG.',
    content: `package org.anticensor.vpn.core.parser

import java.util.UUID

enum class ProxyProtocol(val scheme: String, val displayName: String, val defaultPort: Int) {
    VLESS_REALITY("vless", "VLESS XTLS-Reality", 443),
    HYSTERIA2("hysteria2", "Hysteria 2 (Salamander)", 443),
    NAIVE_PROXY("naive+https", "NaïveProxy (Cronet)", 443),
    TUIC("tuic", "TUIC v5 (0-RTT)", 443),
    AMNEZIA_WG("amneziawg", "AmneziaWG (Junk Injection)", 51820);

    companion object {
        fun fromScheme(scheme: String): ProxyProtocol? {
            val normalized = scheme.lowercase().trim().removeSuffix("://")
            return when {
                normalized == "vless" -> VLESS_REALITY
                normalized == "hysteria2" || normalized == "hy2" -> HYSTERIA2
                normalized == "naive+https" || normalized == "naive+quic" || normalized == "naive" -> NAIVE_PROXY
                normalized == "tuic" -> TUIC
                normalized == "amneziawg" || normalized == "awg" -> AMNEZIA_WG
                else -> null
            }
        }
    }
}

/**
 * Base abstract model for all parsed proxy configurations.
 */
sealed class ProxyConfig(
    open val id: String = UUID.randomUUID().toString(),
    open val name: String,
    open val server: String,
    open val port: Int,
    open val protocol: ProxyProtocol
)

/**
 * VLESS Configuration with XTLS-Reality & XHTTP/gRPC/WS transport parameters.
 */
data class VlessConfig(
    override val id: String = UUID.randomUUID().toString(),
    override val name: String,
    override val server: String,
    override val port: Int = 443,
    val uuid: String,
    val flow: String = "xtls-rprx-vision",
    val security: String = "reality",
    val publicKey: String, // pbk: Reality server public key
    val sni: String, // Server Name Indication (camouflage target)
    val fingerprint: String = "chrome", // uTLS fingerprint: chrome, firefox, safari, ios, randomized
    val shortId: String = "", // sid: hex short ID
    val spiderX: String = "/", // spx: SpiderX crawling path
    val transportType: String = "tcp", // tcp, xhttp, grpc, ws
    val path: String = "", // path for xhttp or ws
    val serviceName: String = "", // serviceName for gRPC
    val hostHeader: String = ""
) : ProxyConfig(id, name, server, port, ProxyProtocol.VLESS_REALITY)

/**
 * Hysteria 2 Configuration with Salamander protocol obfuscation and brutal bandwidth control.
 */
data class Hysteria2Config(
    override val id: String = UUID.randomUUID().toString(),
    override val name: String,
    override val server: String,
    override val port: Int = 443,
    val auth: String,
    val obfsType: String = "salamander",
    val obfsPassword: String = "",
    val sni: String = "",
    val insecure: Boolean = false,
    val upMbps: Int = 50,
    val downMbps: Int = 200,
    val hopIntervalSeconds: Int = 0
) : ProxyConfig(id, name, server, port, ProxyProtocol.HYSTERIA2)

/**
 * NaïveProxy Configuration utilizing Chromium network stack (Cronet) camouflage.
 */
data class NaiveConfig(
    override val id: String = UUID.randomUUID().toString(),
    override val name: String,
    override val server: String,
    override val port: Int = 443,
    val username: String,
    val password: String,
    val networkType: String = "https", // https (HTTP/2) or quic (HTTP/3)
    val sni: String = "",
    val padding: Boolean = true,
    val concurrency: Int = 1
) : ProxyConfig(id, name, server, port, ProxyProtocol.NAIVE_PROXY)

/**
 * TUIC v5 Configuration utilizing 0-RTT QUIC multiplexing with custom congestion control.
 */
data class TuicConfig(
    override val id: String = UUID.randomUUID().toString(),
    override val name: String,
    override val server: String,
    override val port: Int = 443,
    val uuid: String,
    val password: String,
    val congestionControl: String = "bbr", // bbr, cubic, new_reno
    val udpRelayMode: String = "native", // native or quic
    val sni: String = "",
    val alpn: List<String> = listOf("h3", "spdy/3.1"),
    val disableSni: Boolean = false,
    val zeroRttHandshake: Boolean = true,
    val heartbeatIntervalMs: Long = 10000L
) : ProxyConfig(id, name, server, port, ProxyProtocol.TUIC)

/**
 * AmneziaWG Configuration with anti-DPI junk packets and mutated handshake headers.
 */
data class AmneziaWgConfig(
    override val id: String = UUID.randomUUID().toString(),
    override val name: String,
    override val server: String,
    override val port: Int = 51820,
    val addressIpv4: String = "10.0.0.2/32",
    val addressIpv6: String? = null,
    val privateKey: String,
    val publicKey: String,
    val presharedKey: String? = null,
    val dns: List<String> = listOf("1.1.1.1", "8.8.8.8"),
    val mtu: Int = 1360,
    // AmneziaWG Header Mutation & Junk Injection Parameters
    val jc: Int = 4,        // Junk Packet Count (0..128)
    val jmin: Int = 40,     // Junk Packet Min Size in bytes
    val jmax: Int = 70,     // Junk Packet Max Size in bytes
    val s1: Int = 20,       // Init Packet Junk Header Size (0..1000)
    val s2: Int = 20,       // Response Packet Junk Header Size (0..1000)
    val h1: Long = 1L,      // Custom Init packet type ID (Default WG=1)
    val h2: Long = 2L,      // Custom Response packet type ID (Default WG=2)
    val h3: Long = 3L,      // Custom Cookie packet type ID (Default WG=3)
    val h4: Long = 4L       // Custom Transport packet type ID (Default WG=4)
) : ProxyConfig(id, name, server, port, ProxyProtocol.AMNEZIA_WG)`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/parser/UriParser.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'High-performance URI parser for vless://, hysteria2://, hy2://, naive+https://, tuic://, and amneziawg:// / .conf.',
    content: `package org.anticensor.vpn.core.parser

import android.net.Uri
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

object UriParser {

    /**
     * Top-level entry point to parse any supported link or config snippet.
     * Throws IllegalArgumentException if the format is invalid or unsupported.
     */
    fun parse(rawInput: String): ProxyConfig {
        val trimmed = rawInput.trim()
        return when {
            trimmed.startsWith("vless://", ignoreCase = true) -> parseVless(trimmed)
            trimmed.startsWith("hysteria2://", ignoreCase = true) ||
            trimmed.startsWith("hy2://", ignoreCase = true) -> parseHysteria2(trimmed)
            trimmed.startsWith("naive+https://", ignoreCase = true) ||
            trimmed.startsWith("naive+quic://", ignoreCase = true) -> parseNaive(trimmed)
            trimmed.startsWith("tuic://", ignoreCase = true) -> parseTuic(trimmed)
            trimmed.startsWith("amneziawg://", ignoreCase = true) ||
            trimmed.startsWith("awg://", ignoreCase = true) -> parseAmneziaUri(trimmed)
            trimmed.contains("[Interface]", ignoreCase = true) &&
            trimmed.contains("[Peer]", ignoreCase = true) -> parseWireGuardConf(trimmed)
            else -> throw IllegalArgumentException("Unsupported protocol scheme or configuration format")
        }
    }

    /**
     * Parses standard VLESS links with Reality / XHTTP / gRPC / WS parameters.
     * Example: vless://uuid@domain.com:443?security=reality&pbk=xxx&type=xhttp&flow=xtls-rprx-vision&sni=dl.google.com&fp=chrome&sid=1a2b&spx=%2F#RealityNode
     */
    fun parseVless(uriString: String): VlessConfig {
        val uri = Uri.parse(uriString)
        val userInfo = uri.userInfo ?: uri.authority?.substringBefore("@")
            ?: throw IllegalArgumentException("Missing UUID in VLESS URI")

        val uuid = userInfo.trim()
        val host = uri.host ?: throw IllegalArgumentException("Missing host in VLESS URI")
        val port = if (uri.port > 0) uri.port else 443

        val queryParams = extractQueryParams(uriString)
        val name = decodeFragment(uri.fragment, "VLESS Reality ($host)")

        return VlessConfig(
            name = name,
            server = host,
            port = port,
            uuid = uuid,
            flow = queryParams["flow"] ?: "xtls-rprx-vision",
            security = queryParams["security"] ?: "reality",
            publicKey = queryParams["pbk"] ?: queryParams["publicKey"] ?: "",
            sni = queryParams["sni"] ?: queryParams["peer"] ?: host,
            fingerprint = queryParams["fp"] ?: "chrome",
            shortId = queryParams["sid"] ?: "",
            spiderX = queryParams["spx"] ?: "/",
            transportType = queryParams["type"] ?: "tcp",
            path = queryParams["path"] ?: "",
            serviceName = queryParams["serviceName"] ?: queryParams["service_name"] ?: "",
            hostHeader = queryParams["host"] ?: ""
        )
    }

    /**
     * Parses Hysteria 2 / Hy2 URIs.
     * Example: hysteria2://secret_auth@server.net:443?insecure=0&sni=bing.com&obfs=salamander&obfs-password=MyObfsPass#Hy2Node
     */
    fun parseHysteria2(uriString: String): Hysteria2Config {
        val standardized = if (uriString.startsWith("hy2://", ignoreCase = true)) {
            "hysteria2://" + uriString.substring(6)
        } else {
            uriString
        }

        val uri = Uri.parse(standardized)
        val auth = uri.userInfo ?: uri.authority?.substringBefore("@")
            ?: throw IllegalArgumentException("Missing auth password in Hysteria 2 URI")

        val host = uri.host ?: throw IllegalArgumentException("Missing host in Hysteria 2 URI")
        val port = if (uri.port > 0) uri.port else 443
        val queryParams = extractQueryParams(standardized)
        val name = decodeFragment(uri.fragment, "Hysteria 2 ($host)")

        val insecure = queryParams["insecure"]?.let { it == "1" || it.equals("true", ignoreCase = true) } ?: false
        val upMbps = queryParams["upmbps"]?.toIntOrNull() ?: queryParams["up"]?.toIntOrNull() ?: 50
        val downMbps = queryParams["downmbps"]?.toIntOrNull() ?: queryParams["down"]?.toIntOrNull() ?: 200

        return Hysteria2Config(
            name = name,
            server = host,
            port = port,
            auth = auth,
            obfsType = queryParams["obfs"] ?: "salamander",
            obfsPassword = queryParams["obfs-password"] ?: queryParams["obfs_password"] ?: "",
            sni = queryParams["sni"] ?: host,
            insecure = insecure,
            upMbps = upMbps,
            downMbps = downMbps,
            hopIntervalSeconds = queryParams["mport"]?.toIntOrNull() ?: 0
        )
    }

    /**
     * Parses NaïveProxy URIs (naive+https:// or naive+quic://).
     * Example: naive+https://user1:SecretPass@proxy.example.com:443?sni=proxy.example.com&padding=1#NaiveNode
     */
    fun parseNaive(uriString: String): NaiveConfig {
        val isQuic = uriString.startsWith("naive+quic://", ignoreCase = true)
        val normalized = uriString.replaceFirst("naive+https://", "https://", ignoreCase = true)
            .replaceFirst("naive+quic://", "https://", ignoreCase = true)

        val uri = Uri.parse(normalized)
        val userInfo = uri.userInfo ?: throw IllegalArgumentException("Missing username/password credentials in NaïveProxy URI")
        val parts = userInfo.split(":")
        val username = parts.getOrNull(0) ?: throw IllegalArgumentException("Missing Naive username")
        val password = parts.getOrNull(1) ?: ""

        val host = uri.host ?: throw IllegalArgumentException("Missing host in Naive URI")
        val port = if (uri.port > 0) uri.port else 443
        val queryParams = extractQueryParams(uriString)
        val name = decodeFragment(uri.fragment, "NaïveProxy ($host)")

        val padding = queryParams["padding"]?.let { it != "0" && !it.equals("false", ignoreCase = true) } ?: true

        return NaiveConfig(
            name = name,
            server = host,
            port = port,
            username = username,
            password = password,
            networkType = if (isQuic) "quic" else "https",
            sni = queryParams["sni"] ?: host,
            padding = padding
        )
    }

    /**
     * Parses TUIC v5 URIs.
     * Example: tuic://uuid:password@tuic.server.com:443?congestion_control=bbr&udp_relay_mode=native&sni=tuic.server.com&alpn=h3#TuicNode
     */
    fun parseTuic(uriString: String): TuicConfig {
        val uri = Uri.parse(uriString)
        val userInfo = uri.userInfo ?: throw IllegalArgumentException("Missing UUID/password in TUIC URI")
        val parts = userInfo.split(":")
        val uuid = parts.getOrNull(0) ?: throw IllegalArgumentException("Missing TUIC UUID")
        val password = parts.getOrNull(1) ?: ""

        val host = uri.host ?: throw IllegalArgumentException("Missing host in TUIC URI")
        val port = if (uri.port > 0) uri.port else 443
        val queryParams = extractQueryParams(uriString)
        val name = decodeFragment(uri.fragment, "TUIC v5 ($host)")

        val alpnRaw = queryParams["alpn"] ?: "h3,spdy/3.1"
        val alpnList = alpnRaw.split(",").map { it.trim() }.filter { it.isNotEmpty() }

        return TuicConfig(
            name = name,
            server = host,
            port = port,
            uuid = uuid,
            password = password,
            congestionControl = queryParams["congestion_control"] ?: "bbr",
            udpRelayMode = queryParams["udp_relay_mode"] ?: "native",
            sni = queryParams["sni"] ?: host,
            alpn = alpnList,
            disableSni = queryParams["disable_sni"] == "1" || queryParams["disable_sni"] == "true",
            zeroRttHandshake = queryParams["zero_rtt_handshake"] != "0"
        )
    }

    /**
     * Parses AmneziaWG URIs (amneziawg:// or awg://).
     * Example: amneziawg://aKey=@awg.host.com:51820?public_key=bKey=&address=10.0.0.2/32&jc=4&jmin=40&jmax=70&s1=20&s2=20&h1=1&h2=2&h3=3&h4=4#AWGNode
     */
    fun parseAmneziaUri(uriString: String): AmneziaWgConfig {
        val normalized = if (uriString.startsWith("awg://", ignoreCase = true)) {
            "amneziawg://" + uriString.substring(6)
        } else {
            uriString
        }

        val uri = Uri.parse(normalized)
        val privateKey = uri.userInfo ?: uri.authority?.substringBefore("@")
            ?: throw IllegalArgumentException("Missing privateKey in AmneziaWG URI")

        val host = uri.host ?: throw IllegalArgumentException("Missing host in AmneziaWG URI")
        val port = if (uri.port > 0) uri.port else 51820
        val queryParams = extractQueryParams(normalized)
        val name = decodeFragment(uri.fragment, "AmneziaWG ($host)")

        return AmneziaWgConfig(
            name = name,
            server = host,
            port = port,
            addressIpv4 = queryParams["address"] ?: "10.0.0.2/32",
            addressIpv6 = queryParams["address6"],
            privateKey = URLDecoder.decode(privateKey, StandardCharsets.UTF_8.name()),
            publicKey = queryParams["public_key"]?.let { URLDecoder.decode(it, StandardCharsets.UTF_8.name()) } ?: "",
            presharedKey = queryParams["preshared_key"]?.let { URLDecoder.decode(it, StandardCharsets.UTF_8.name()) },
            jc = queryParams["jc"]?.toIntOrNull() ?: 4,
            jmin = queryParams["jmin"]?.toIntOrNull() ?: 40,
            jmax = queryParams["jmax"]?.toIntOrNull() ?: 70,
            s1 = queryParams["s1"]?.toIntOrNull() ?: 20,
            s2 = queryParams["s2"]?.toIntOrNull() ?: 20,
            h1 = queryParams["h1"]?.toLongOrNull() ?: 1L,
            h2 = queryParams["h2"]?.toLongOrNull() ?: 2L,
            h3 = queryParams["h3"]?.toLongOrNull() ?: 3L,
            h4 = queryParams["h4"]?.toLongOrNull() ?: 4L
        )
    }

    /**
     * Parses standard WireGuard & AmneziaWG INI-style .conf configuration text.
     */
    fun parseWireGuardConf(confText: String, defaultName: String = "AmneziaWG Conf"): AmneziaWgConfig {
        var currentSection = ""
        val interfaceMap = mutableMapOf<String, String>()
        val peerMap = mutableMapOf<String, String>()

        confText.lineSequence().forEach { rawLine ->
            val line = rawLine.trim()
            if (line.isEmpty() || line.startsWith("#")) return@forEach

            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.substring(1, line.length - 1).trim().lowercase()
                return@forEach
            }

            val eqIdx = line.indexOf('=')
            if (eqIdx > 0) {
                val key = line.substring(0, eqIdx).trim().lowercase()
                val value = line.substring(eqIdx + 1).trim()
                if (currentSection == "interface") {
                    interfaceMap[key] = value
                } else if (currentSection == "peer") {
                    peerMap[key] = value
                }
            }
        }

        val endpoint = peerMap["endpoint"] ?: throw IllegalArgumentException("Missing Endpoint in [Peer] section")
        val (host, port) = parseHostPort(endpoint, 51820)
        val privateKey = interfaceMap["privatekey"] ?: throw IllegalArgumentException("Missing PrivateKey in [Interface] section")
        val publicKey = peerMap["publickey"] ?: throw IllegalArgumentException("Missing PublicKey in [Peer] section")

        val addresses = (interfaceMap["address"] ?: "10.0.0.2/32").split(",").map { it.trim() }
        val ipv4 = addresses.firstOrNull { !it.contains(":") } ?: "10.0.0.2/32"
        val ipv6 = addresses.firstOrNull { it.contains(":") }

        val dnsList = interfaceMap["dns"]?.split(",")?.map { it.trim() } ?: listOf("1.1.1.1", "8.8.8.8")
        val mtu = interfaceMap["mtu"]?.toIntOrNull() ?: 1360

        // Custom AmneziaWG parameters
        val jc = (interfaceMap["jc"] ?: peerMap["jc"])?.toIntOrNull() ?: 4
        val jmin = (interfaceMap["jmin"] ?: peerMap["jmin"])?.toIntOrNull() ?: 40
        val jmax = (interfaceMap["jmax"] ?: peerMap["jmax"])?.toIntOrNull() ?: 70
        val s1 = (interfaceMap["s1"] ?: peerMap["s1"])?.toIntOrNull() ?: 20
        val s2 = (interfaceMap["s2"] ?: peerMap["s2"])?.toIntOrNull() ?: 20
        val h1 = (interfaceMap["h1"] ?: peerMap["h1"])?.toLongOrNull() ?: 1L
        val h2 = (interfaceMap["h2"] ?: peerMap["h2"])?.toLongOrNull() ?: 2L
        val h3 = (interfaceMap["h3"] ?: peerMap["h3"])?.toLongOrNull() ?: 3L
        val h4 = (interfaceMap["h4"] ?: peerMap["h4"])?.toLongOrNull() ?: 4L

        return AmneziaWgConfig(
            name = defaultName,
            server = host,
            port = port,
            addressIpv4 = ipv4,
            addressIpv6 = ipv6,
            privateKey = privateKey,
            publicKey = publicKey,
            presharedKey = peerMap["presharedkey"],
            dns = dnsList,
            mtu = mtu,
            jc = jc,
            jmin = jmin,
            jmax = jmax,
            s1 = s1,
            s2 = s2,
            h1 = h1,
            h2 = h2,
            h3 = h3,
            h4 = h4
        )
    }

    private fun parseHostPort(endpoint: String, defaultPort: Int): Pair<String, Int> {
        val trimmed = endpoint.trim()
        if (trimmed.startsWith("[")) {
            val endBracket = trimmed.indexOf(']')
            if (endBracket > 0) {
                val host = trimmed.substring(1, endBracket)
                val portStr = trimmed.substring(endBracket + 1).removePrefix(":")
                val port = portStr.toIntOrNull() ?: defaultPort
                return Pair(host, port)
            }
        }
        val colonIdx = trimmed.lastIndexOf(':')
        return if (colonIdx > 0) {
            val host = trimmed.substring(0, colonIdx)
            val port = trimmed.substring(colonIdx + 1).toIntOrNull() ?: defaultPort
            Pair(host, port)
        } else {
            Pair(trimmed, defaultPort)
        }
    }

    private fun extractQueryParams(urlString: String): Map<String, String> {
        val map = mutableMapOf<String, String>()
        val queryStart = urlString.indexOf('?')
        if (queryStart < 0) return map

        val fragmentStart = urlString.indexOf('#', queryStart)
        val queryString = if (fragmentStart >= 0) {
            urlString.substring(queryStart + 1, fragmentStart)
        } else {
            urlString.substring(queryStart + 1)
        }

        queryString.split("&").forEach { pair ->
            val idx = pair.indexOf('=')
            if (idx > 0) {
                val key = pair.substring(0, idx).trim()
                val rawVal = pair.substring(idx + 1).trim()
                val decodedVal = try {
                    URLDecoder.decode(rawVal, StandardCharsets.UTF_8.name())
                } catch (_: Exception) {
                    rawVal
                }
                map[key] = decodedVal
            }
        }
        return map
    }

    private fun decodeFragment(fragment: String?, defaultVal: String): String {
        if (fragment.isNullOrBlank()) return defaultVal
        return try {
            URLDecoder.decode(fragment, StandardCharsets.UTF_8.name()).trim()
        } catch (_: Exception) {
            fragment.trim()
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/XrayConfigGenerator.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Generates spec-compliant Xray JSON config files with 127.0.0.1:10808 loopback SOCKS5 and XTLS-Reality / XHTTP outbounds.',
    content: `package org.anticensor.vpn.core.generator

import org.anticensor.vpn.core.parser.VlessConfig
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * Generates spec-compliant Xray JSON configuration files with local SOCKS5 loopback
 * inbound at 127.0.0.1:10808 and production XTLS-Reality / XHTTP / gRPC outbound.
 */
object XrayConfigGenerator {

    fun generateJson(config: VlessConfig, socks5Port: Int = 10808): String {
        val root = JSONObject()

        // 1. Log Settings
        root.put("log", JSONObject().apply {
            put("loglevel", "warning")
        })

        // 2. Inbounds: SOCKS5 Loopback for hev-socks5-tunnel
        val inbounds = JSONArray()
        val socksInbound = JSONObject().apply {
            put("tag", "socks-in")
            put("listen", "127.0.0.1")
            put("port", socks5Port)
            put("protocol", "socks")
            put("settings", JSONObject().apply {
                put("auth", "noauth")
                put("udp", true)
            })
            put("sniffing", JSONObject().apply {
                put("enabled", true)
                put("destOverride", JSONArray(listOf("http", "tls", "quic")))
            })
        }
        inbounds.put(socksInbound)
        root.put("inbounds", inbounds)

        // 3. Outbounds: Target VLESS + Direct Fallback + Blackhole
        val outbounds = JSONArray()

        // Primary Proxy Outbound
        val proxyOutbound = JSONObject().apply {
            put("tag", "proxy")
            put("protocol", "vless")

            // VLESS User Settings
            put("settings", JSONObject().apply {
                val vnext = JSONArray()
                val serverObj = JSONObject().apply {
                    put("address", config.server)
                    put("port", config.port)
                    val users = JSONArray()
                    val userObj = JSONObject().apply {
                        put("id", config.uuid)
                        put("encryption", "none")
                        if (config.flow.isNotBlank()) {
                            put("flow", config.flow)
                        }
                    }
                    users.put(userObj)
                    put("users", users)
                }
                vnext.put(serverObj)
                put("vnext", vnext)
            })

            // StreamSettings (Reality / XHTTP / gRPC / WS)
            put("streamSettings", JSONObject().apply {
                put("network", config.transportType)
                put("security", config.security)

                if (config.security.equals("reality", ignoreCase = true)) {
                    put("realitySettings", JSONObject().apply {
                        put("show", false)
                        put("fingerprint", config.fingerprint.ifBlank { "chrome" })
                        put("serverName", config.sni.ifBlank { config.server })
                        put("publicKey", config.publicKey)
                        put("shortId", config.shortId)
                        put("spiderX", config.spiderX.ifBlank { "/" })
                    })
                }

                // Transport Specific Settings
                when (config.transportType.lowercase()) {
                    "xhttp" -> {
                        put("xhttpSettings", JSONObject().apply {
                            put("path", config.path.ifBlank { "/" })
                            put("mode", "auto")
                            if (config.hostHeader.isNotBlank()) {
                                put("host", config.hostHeader)
                            }
                        })
                    }
                    "grpc" -> {
                        put("grpcSettings", JSONObject().apply {
                            put("serviceName", config.serviceName)
                            put("multiMode", true)
                        })
                    }
                    "ws" -> {
                        put("wsSettings", JSONObject().apply {
                            put("path", config.path.ifBlank { "/" })
                            if (config.hostHeader.isNotBlank()) {
                                put("headers", JSONObject().apply {
                                    put("Host", config.hostHeader)
                                })
                            }
                        })
                    }
                }
            })
        }
        outbounds.put(proxyOutbound)

        // Freedom (Direct) Outbound
        outbounds.put(JSONObject().apply {
            put("tag", "direct")
            put("protocol", "freedom")
        })

        // Blackhole (Block Ad/Private IP) Outbound
        outbounds.put(JSONObject().apply {
            put("tag", "block")
            put("protocol", "blackhole")
        })

        root.put("outbounds", outbounds)

        // 4. DNS Settings
        root.put("dns", JSONObject().apply {
            put("servers", JSONArray(listOf("1.1.1.1", "8.8.8.8", "localhost")))
        })

        // 5. Routing Rules
        root.put("routing", JSONObject().apply {
            put("domainStrategy", "IPIfNonMatch")
            val rules = JSONArray()

            // Bypass private local addresses
            rules.put(JSONObject().apply {
                put("type", "field")
                put("outboundTag", "direct")
                put("ip", JSONArray(listOf("geoip:private")))
            })

            // Route everything else to the primary proxy outbound
            rules.put(JSONObject().apply {
                put("type", "field")
                put("outboundTag", "proxy")
                put("network", "tcp,udp")
            })
            put("rules", rules)
        })

        return root.toString(2)
    }

    fun writeConfigFile(config: VlessConfig, targetFile: File, socks5Port: Int = 10808): File {
        val json = generateJson(config, socks5Port)
        targetFile.parentFile?.mkdirs()
        targetFile.writeText(json)
        return targetFile
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/HysteriaConfigGenerator.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Generates spec-compliant YAML config files for Hysteria 2 with Salamander obfuscation and brutal bandwidth tuning.',
    content: `package org.anticensor.vpn.core.generator

import org.anticensor.vpn.core.parser.Hysteria2Config
import java.io.File

/**
 * Generates spec-compliant YAML configuration files for the Hysteria 2 native client.
 * Features Salamander protocol obfuscation, BBR/brutal congestion control, and local SOCKS5 binding.
 */
object HysteriaConfigGenerator {

    fun generateYaml(config: Hysteria2Config, socks5Port: Int = 10808): String {
        val sb = StringBuilder()

        // Server Address
        sb.appendLine("server: \${config.server}:\${config.port}")
        sb.appendLine("auth: \\"\${escapeYaml(config.auth)}\\"")
        sb.appendLine()

        // Local SOCKS5 Inbound for hev-socks5-tunnel
        sb.appendLine("socks5:")
        sb.appendLine("  listen: 127.0.0.1:\$socks5Port")
        sb.appendLine("  timeout: 300")
        sb.appendLine()

        // Obfuscation (Salamander)
        if (config.obfsPassword.isNotBlank()) {
            sb.appendLine("obfs:")
            sb.appendLine("  type: \${config.obfsType}")
            sb.appendLine("  \${config.obfsType}:")
            sb.appendLine("    password: \\"\${escapeYaml(config.obfsPassword)}\\"")
            sb.appendLine()
        }

        // TLS & Camouflage
        sb.appendLine("tls:")
        val sni = if (config.sni.isNotBlank()) config.sni else config.server
        sb.appendLine("  sni: \$sni")
        sb.appendLine("  insecure: \${config.insecure}")
        sb.appendLine()

        // Bandwidth Limits
        sb.appendLine("bandwidth:")
        sb.appendLine("  up: \${config.upMbps} mbps")
        sb.appendLine("  down: \${config.downMbps} mbps")
        sb.appendLine()

        // QUIC Tunables for Anti-Censorship
        sb.appendLine("quic:")
        sb.appendLine("  initStreamReceiveWindow: 8388608")
        sb.appendLine("  maxStreamReceiveWindow: 8388608")
        sb.appendLine("  initConnReceiveWindow: 20971520")
        sb.appendLine("  maxConnReceiveWindow: 20971520")
        sb.appendLine("  maxIdleTimeout: 30s")
        sb.appendLine("  keepAlivePeriod: 10s")
        sb.appendLine("  disablePathMTUDiscovery: false")
        sb.appendLine()

        // Fast Open
        sb.appendLine("fastOpen: true")

        return sb.toString()
    }

    private fun escapeYaml(value: String): String {
        return value.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"")
    }

    fun writeConfigFile(config: Hysteria2Config, targetFile: File, socks5Port: Int = 10808): File {
        val yaml = generateYaml(config, socks5Port)
        targetFile.parentFile?.mkdirs()
        targetFile.writeText(yaml)
        return targetFile
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/NaiveConfigGenerator.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Generates JSON config files for NaïveProxy (Chromium Cronet network stack).',
    content: `package org.anticensor.vpn.core.generator

import org.anticensor.vpn.core.parser.NaiveConfig
import org.json.JSONObject
import java.io.File
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * Generates JSON configuration files for NaïveProxy (Chromium Cronet network stack).
 */
object NaiveConfigGenerator {

    fun generateJson(config: NaiveConfig, socks5Port: Int = 10808): String {
        val root = JSONObject()

        // SOCKS5 listener for hev-socks5-tunnel
        root.put("listen", "socks://127.0.0.1:\$socks5Port")

        // Encoded Proxy URI: scheme://user:pass@host:port
        val scheme = if (config.networkType.equals("quic", ignoreCase = true)) "quic" else "https"
        val encUser = URLEncoder.encode(config.username, StandardCharsets.UTF_8.name())
        val encPass = URLEncoder.encode(config.password, StandardCharsets.UTF_8.name())
        val proxyUri = "\$scheme://\$encUser:\$encPass@\${config.server}:\${config.port}"
        root.put("proxy", proxyUri)

        // Anti-DPI Padding & Concurrency
        root.put("padding", config.padding)
        root.put("insecure_concurrency", config.concurrency.coerceAtLeast(1))
        root.put("log", "")

        return root.toString(2)
    }

    fun writeConfigFile(config: NaiveConfig, targetFile: File, socks5Port: Int = 10808): File {
        val json = generateJson(config, socks5Port)
        targetFile.parentFile?.mkdirs()
        targetFile.writeText(json)
        return targetFile
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/TuicConfigGenerator.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Generates JSON config files for TUIC v5 with 0-RTT QUIC multiplexing and custom ALPN.',
    content: `package org.anticensor.vpn.core.generator

import org.anticensor.vpn.core.parser.TuicConfig
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * Generates JSON configuration files for TUIC v5 (0-RTT QUIC multiplexed proxy client).
 */
object TuicConfigGenerator {

    fun generateJson(config: TuicConfig, socks5Port: Int = 10808): String {
        val root = JSONObject()

        // Relay remote server configuration
        val relay = JSONObject().apply {
            put("server", "\${config.server}:\${config.port}")
            put("uuid", config.uuid)
            put("password", config.password)
            put("certificates", JSONArray())
            put("udp_relay_mode", config.udpRelayMode)
            put("zero_rtt_handshake", config.zeroRttHandshake)
            put("disable_sni", config.disableSni)
            put("congestion_control", config.congestionControl)
            put("heartbeat", "\${config.heartbeatIntervalMs / 1000}s")

            if (config.sni.isNotBlank() && !config.disableSni) {
                put("sni", config.sni)
            }
            put("alpn", JSONArray(config.alpn))
        }
        root.put("relay", relay)

        // Local SOCKS5 listener for hev-socks5-tunnel
        val local = JSONObject().apply {
            put("server", "127.0.0.1:\$socks5Port")
            put("dual_stack", false)
            put("max_packet_size", 1500)
        }
        root.put("local", local)

        root.put("log_level", "warn")

        return root.toString(2)
    }

    fun writeConfigFile(config: TuicConfig, targetFile: File, socks5Port: Int = 10808): File {
        val json = generateJson(config, socks5Port)
        targetFile.parentFile?.mkdirs()
        targetFile.writeText(json)
        return targetFile
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/AmneziaConfigGenerator.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Generates AmneziaWG .conf with junk injection parameters (Jc, Jmin, Jmax, S1, S2, H1..H4).',
    content: `package org.anticensor.vpn.core.generator

import org.anticensor.vpn.core.parser.AmneziaWgConfig
import java.io.File

/**
 * Generates AmneziaWG / WireGuard configuration files (.conf).
 * Preserves all anti-DPI junk injection parameters (Jc, Jmin, Jmax, S1, S2, H1, H2, H3, H4)
 * used to defeat state-level deep packet inspection of WireGuard handshakes.
 */
object AmneziaConfigGenerator {

    fun generateConf(config: AmneziaWgConfig): String {
        val sb = StringBuilder()

        // [Interface] Section
        sb.appendLine("[Interface]")
        val addresses = mutableListOf(config.addressIpv4)
        if (!config.addressIpv6.isNullOrBlank()) {
            addresses.add(config.addressIpv6)
        }
        sb.appendLine("Address = \${addresses.joinToString(\", \")}")
        sb.appendLine("PrivateKey = \${config.privateKey}")
        sb.appendLine("DNS = \${config.dns.joinToString(\", \")}")
        sb.appendLine("MTU = \${config.mtu}")

        // Anti-Censorship Junk Packet Injection & Header Mutation
        sb.appendLine("Jc = \${config.jc}")
        sb.appendLine("Jmin = \${config.jmin}")
        sb.appendLine("Jmax = \${config.jmax}")
        sb.appendLine("S1 = \${config.s1}")
        sb.appendLine("S2 = \${config.s2}")
        sb.appendLine("H1 = \${config.h1}")
        sb.appendLine("H2 = \${config.h2}")
        sb.appendLine("H3 = \${config.h3}")
        sb.appendLine("H4 = \${config.h4}")
        sb.appendLine()

        // [Peer] Section
        sb.appendLine("[Peer]")
        sb.appendLine("PublicKey = \${config.publicKey}")
        if (!config.presharedKey.isNullOrBlank()) {
            sb.appendLine("PresharedKey = \${config.presharedKey}")
        }
        sb.appendLine("Endpoint = \${config.server}:\${config.port}")
        sb.appendLine("AllowedIPs = 0.0.0.0/0, ::/0")
        sb.appendLine("PersistentKeepalive = 25")

        return sb.toString()
    }

    fun writeConfigFile(config: AmneziaWgConfig, targetFile: File): File {
        val conf = generateConf(config)
        targetFile.parentFile?.mkdirs()
        targetFile.writeText(conf)
        return targetFile
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/generator/ConfigGeneratorFactory.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 4',
    description: 'Unified factory that parses URIs, executes protocol-specific generators, and saves ready-to-launch files into context.filesDir.',
    content: `package org.anticensor.vpn.core.generator

import android.content.Context
import org.anticensor.vpn.core.parser.*
import java.io.File

data class GeneratedConfigResult(
    val configFile: File,
    val configText: String,
    val protocol: ProxyProtocol,
    val binaryName: String,
    val socks5Port: Int,
    val launchArgs: List<String>
)

/**
 * Unified factory that takes any parsed ProxyConfig, applies protocol-specific generators,
 * and writes ready-to-execute configuration files into context.filesDir.
 */
object ConfigGeneratorFactory {

    private const val DEFAULT_SOCKS5_PORT = 10808

    fun generateAndSave(
        context: Context,
        config: ProxyConfig,
        socks5Port: Int = DEFAULT_SOCKS5_PORT
    ): GeneratedConfigResult {
        val configDir = File(context.filesDir, "configs").apply { mkdirs() }

        return when (config) {
            is VlessConfig -> {
                val targetFile = File(configDir, "xray_config.json")
                val text = XrayConfigGenerator.generateJson(config, socks5Port)
                targetFile.writeText(text)
                GeneratedConfigResult(
                    configFile = targetFile,
                    configText = text,
                    protocol = ProxyProtocol.VLESS_REALITY,
                    binaryName = "xray",
                    socks5Port = socks5Port,
                    launchArgs = listOf("run", "-c", targetFile.absolutePath)
                )
            }
            is Hysteria2Config -> {
                val targetFile = File(configDir, "hysteria2_config.yaml")
                val text = HysteriaConfigGenerator.generateYaml(config, socks5Port)
                targetFile.writeText(text)
                GeneratedConfigResult(
                    configFile = targetFile,
                    configText = text,
                    protocol = ProxyProtocol.HYSTERIA2,
                    binaryName = "hysteria",
                    socks5Port = socks5Port,
                    launchArgs = listOf("client", "-c", targetFile.absolutePath)
                )
            }
            is NaiveConfig -> {
                val targetFile = File(configDir, "naive_config.json")
                val text = NaiveConfigGenerator.generateJson(config, socks5Port)
                targetFile.writeText(text)
                GeneratedConfigResult(
                    configFile = targetFile,
                    configText = text,
                    protocol = ProxyProtocol.NAIVE_PROXY,
                    binaryName = "naive",
                    socks5Port = socks5Port,
                    launchArgs = listOf(targetFile.absolutePath)
                )
            }
            is TuicConfig -> {
                val targetFile = File(configDir, "tuic_config.json")
                val text = TuicConfigGenerator.generateJson(config, socks5Port)
                targetFile.writeText(text)
                GeneratedConfigResult(
                    configFile = targetFile,
                    configText = text,
                    protocol = ProxyProtocol.TUIC,
                    binaryName = "tuic-client",
                    socks5Port = socks5Port,
                    launchArgs = listOf("-c", targetFile.absolutePath)
                )
            }
            is AmneziaWgConfig -> {
                val targetFile = File(configDir, "amnezia_wg0.conf")
                val text = AmneziaConfigGenerator.generateConf(config)
                targetFile.writeText(text)
                GeneratedConfigResult(
                    configFile = targetFile,
                    configText = text,
                    protocol = ProxyProtocol.AMNEZIA_WG,
                    binaryName = "amneziawg-go",
                    socks5Port = socks5Port,
                    launchArgs = listOf("-f", targetFile.absolutePath)
                )
            }
        }
    }

    /**
     * Convenience method to parse a raw URI and immediately produce the configuration file.
     */
    fun parseAndGenerate(
        context: Context,
        rawUri: String,
        socks5Port: Int = DEFAULT_SOCKS5_PORT
    ): GeneratedConfigResult {
        val parsedConfig = UriParser.parse(rawUri)
        return generateAndSave(context, parsedConfig, socks5Port)
    }
}`
  }
];
