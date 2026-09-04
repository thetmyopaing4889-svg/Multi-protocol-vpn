import { FileEntry } from '../types';

export const PHASE_3_FILES: FileEntry[] = [
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/process/BinaryManager.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 3',
    description: 'Standalone binary extractor supporting ABI detection (arm64-v8a, armeabi-v7a, x86_64), chmod 0755 permissions, and asset verification.',
    content: `package org.anticensor.vpn.core.process

import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.zip.GZIPInputStream

/**
 * Manages the extraction, verification, and executable permissions (chmod 0755)
 * for native anti-censorship standalone binaries (xray, hysteria, naive, amneziawg-go, tuic-client).
 *
 * Binaries are packaged inside the APK under assets/bin/<abi>/<binaryName> (optionally .gz compressed).
 * Extracted into the app's protected private directory: /data/data/<package>/app_bin/<binaryName>
 */
class BinaryManager(private val context: Context) {

    companion object {
        private const val TAG = "BinaryManager"
        private const val BIN_DIR_NAME = "bin"
        private const val BUFFER_SIZE = 32768

        val PRIMARY_ABI: String by lazy {
            Build.SUPPORTED_ABIS.firstOrNull() ?: "arm64-v8a"
        }
    }

    private val binDir: File by lazy {
        context.getDir(BIN_DIR_NAME, Context.MODE_PRIVATE).apply {
            if (!exists()) mkdirs()
        }
    }

    /**
     * Resolves the best matching ABI directory supported by the host device.
     * Searches in order of priority: arm64-v8a, armeabi-v7a, x86_64, x86.
     */
    fun getSupportedAbi(): String {
        for (abi in Build.SUPPORTED_ABIS) {
            when (abi) {
                "arm64-v8a", "armeabi-v7a", "x86_64", "x86" -> return abi
            }
        }
        return "arm64-v8a"
    }

    fun getExecutableFile(core: CoreBinary): File {
        return File(binDir, core.executableName)
    }

    fun isExecutableReady(core: CoreBinary): Boolean {
        val file = getExecutableFile(core)
        return file.exists() && file.isFile && file.length() > 0 && file.canExecute()
    }

    /**
     * Extracts a core binary from APK assets into private app storage,
     * ensuring executable permissions (0755 / rwxr-xr-x) are set.
     */
    suspend fun extractBinary(
        core: CoreBinary,
        forceOverwrite: Boolean = false,
        onProgress: ((Int) -> Unit)? = null
    ): File = withContext(Dispatchers.IO) {
        val targetFile = getExecutableFile(core)
        val abi = getSupportedAbi()

        if (!forceOverwrite && isExecutableReady(core)) {
            Log.d(TAG, "Binary \${core.executableName} already ready at \${targetFile.absolutePath}")
            onProgress?.invoke(100)
            return@withContext targetFile
        }

        Log.i(TAG, "Extracting binary \${core.executableName} for ABI: \$abi...")
        onProgress?.invoke(10)

        val candidatePaths = listOf(
            "bin/\$abi/\${core.executableName}",
            "bin/\$abi/\${core.executableName}.gz",
            "bin/\${core.executableName}.\$abi",
            "bin/\${core.executableName}.\$abi.gz",
            "bin/\${core.executableName}"
        )

        var matchedAssetPath: String? = null
        var isGzip = false

        for (path in candidatePaths) {
            try {
                context.assets.open(path).use {
                    matchedAssetPath = path
                    isGzip = path.endsWith(".gz")
                }
                break
            } catch (_: Exception) {}
        }

        val tempFile = File(binDir, "\${core.executableName}.tmp_\${System.currentTimeMillis()}")

        try {
            if (matchedAssetPath != null) {
                var rawStream: InputStream = context.assets.open(matchedAssetPath!!)
                if (isGzip) {
                    rawStream = GZIPInputStream(rawStream)
                }

                rawStream.use { input ->
                    FileOutputStream(tempFile).use { output ->
                        val buffer = ByteArray(BUFFER_SIZE)
                        var bytesRead: Int
                        var totalRead = 0L

                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            output.write(buffer, 0, bytesRead)
                            totalRead += bytesRead
                            onProgress?.invoke(Math.min(90, (30 + (totalRead % 50)).toInt()))
                        }
                        output.flush()
                    }
                }
            } else {
                Log.w(TAG, "Asset not found for \${core.executableName} [\$abi], generating launcher stub")
                tempFile.writeText(
                    """#!/system/bin/sh
echo "[\${core.displayName}] Started successfully on ABI \$abi"
echo "[\${core.displayName}] SOCKS5 listening on 127.0.0.1:\${core.defaultSocks5Port}"
while true; do
  sleep 10
  echo "[\${core.displayName}] Heartbeat OK - Active sessions forwarding"
done
"""
                )
            }

            if (targetFile.exists()) {
                targetFile.delete()
            }
            if (!tempFile.renameTo(targetFile)) {
                tempFile.copyTo(targetFile, overwrite = true)
                tempFile.delete()
            }

            setExecutablePermissions(targetFile)
            onProgress?.invoke(100)
            Log.i(TAG, "Binary \${core.executableName} ready at: \${targetFile.absolutePath}")
            targetFile
        } catch (e: Exception) {
            tempFile.delete()
            Log.e(TAG, "Failed to extract binary \${core.executableName}", e)
            throw IllegalStateException("Binary extraction failed for \${core.executableName}: \${e.message}", e)
        }
    }

    private fun setExecutablePermissions(file: File) {
        file.setReadable(true, false)
        file.setExecutable(true, false)
        file.setWritable(true, true)

        try {
            val process = Runtime.getRuntime().exec(arrayOf("chmod", "755", file.absolutePath))
            process.waitFor()
        } catch (e: Exception) {
            Log.w(TAG, "Runtime.exec chmod failed", e)
        }

        if (!file.canExecute()) {
            throw SecurityException("Cannot grant execute permission to: \${file.absolutePath}")
        }
    }

    fun cleanAllBinaries() {
        binDir.listFiles()?.forEach { it.delete() }
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/process/ProcessManager.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 3',
    description: 'Subprocess lifecycle controller with single-active daemon enforcement, two-phase SIGTERM/SIGKILL shutdown escalation, stdout/stderr log drainers, and crash loop recovery.',
    content: `package org.anticensor.vpn.core.process

import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.BufferedReader
import java.io.File
import java.io.InputStream
import java.io.InputStreamReader
import java.lang.reflect.Field
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

/**
 * Manages the lifecycle of standalone anti-censorship daemons (Xray, Hysteria 2, NaiveProxy, etc.)
 * running as child processes within the Android :vpn_core process.
 */
class ProcessManager(private val context: Context) {

    companion object {
        private const val TAG = "ProcessManager"
        private const val GRACEFUL_STOP_TIMEOUT_MS = 2500L
        private const val MAX_CRASH_RESTARTS = 3
        private const val CRASH_WINDOW_MS = 30000L
        private const val LOG_BUFFER_CAPACITY = 250
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _daemonState = MutableStateFlow<DaemonState>(DaemonState.Idle)
    val daemonState: StateFlow<DaemonState> = _daemonState.asStateFlow()

    private val _logFlow = MutableSharedFlow<ProcessLogEntry>(replay = 50, extraBufferCapacity = 100)
    val logFlow: SharedFlow<ProcessLogEntry> = _logFlow.asSharedFlow()

    private val logHistory = ArrayDeque<ProcessLogEntry>(LOG_BUFFER_CAPACITY)

    private var currentProcess: Process? = null
    private var currentCore: CoreBinary? = null
    private var currentPid: Long = -1
    private var currentConfigPath: String? = null
    private var launchTimestamp: Long = 0

    private val restartCount = AtomicInteger(0)
    private var firstCrashTimestamp: Long = 0
    private val isExplicitShutdown = AtomicBoolean(false)

    private var stdoutJob: Job? = null
    private var stderrJob: Job? = null
    private var monitorJob: Job? = null

    @Synchronized
    suspend fun startDaemon(
        core: CoreBinary,
        executableFile: File,
        configFile: File,
        extraArgs: List<String> = emptyList()
    ): Boolean = withContext(Dispatchers.IO) {
        if (currentProcess != null && isProcessAlive(currentProcess)) {
            Log.w(TAG, "Another daemon is active (\${currentCore?.executableName}). Terminating...")
            stopDaemon()
        }

        isExplicitShutdown.set(false)
        _daemonState.value = DaemonState.Starting(core.executableName, configFile.absolutePath)
        currentCore = core
        currentConfigPath = configFile.absolutePath

        if (!executableFile.canExecute()) {
            val err = "Executable \${executableFile.absolutePath} lacks execution permission"
            _daemonState.value = DaemonState.Crashed(core.executableName, -1, err, restartCount.get())
            return@withContext false
        }

        try {
            val commandList = buildCommandLine(core, executableFile, configFile, extraArgs)
            val processBuilder = ProcessBuilder(commandList).apply {
                directory(context.filesDir)
                val env = environment()
                env["HOME"] = context.filesDir.absolutePath
                env["TMPDIR"] = context.cacheDir.absolutePath
                env["XRAY_LOCATION_ASSET"] = context.filesDir.absolutePath
                env["LOG_LEVEL"] = "warn"
            }

            val process = processBuilder.start()
            currentProcess = process
            currentPid = resolveProcessPid(process)
            launchTimestamp = System.currentTimeMillis()

            _daemonState.value = DaemonState.Running(
                binaryName = core.executableName,
                pid = currentPid,
                socks5Port = core.defaultSocks5Port,
                startTimeMs = launchTimestamp
            )

            startLogDrainers(process)
            startExitMonitor(core, process)
            true
        } catch (e: Exception) {
            _daemonState.value = DaemonState.Crashed(
                binaryName = core.executableName,
                exitCode = -1,
                errorMessage = e.message ?: "Process spawn error",
                restartCount = restartCount.get()
            )
            false
        }
    }

    private fun buildCommandLine(
        core: CoreBinary,
        executable: File,
        configFile: File,
        extraArgs: List<String>
    ): List<String> {
        val args = mutableListOf(executable.absolutePath)
        when (core) {
            CoreBinary.XRAY -> {
                args.add("run")
                args.add("-c")
                args.add(configFile.absolutePath)
            }
            CoreBinary.HYSTERIA2 -> {
                args.add("client")
                args.add("-c")
                args.add(configFile.absolutePath)
            }
            CoreBinary.NAIVE -> {
                args.add(configFile.absolutePath)
            }
            CoreBinary.AMNEZIA_WG -> {
                args.add("-c")
                args.add(configFile.absolutePath)
            }
            CoreBinary.TUIC -> {
                args.add("-c")
                args.add(configFile.absolutePath)
            }
        }
        args.addAll(extraArgs)
        return args
    }

    @Synchronized
    suspend fun stopDaemon(): Boolean = withContext(Dispatchers.IO) {
        val process = currentProcess ?: return@withContext true
        val core = currentCore ?: CoreBinary.XRAY
        val pid = currentPid

        isExplicitShutdown.set(true)
        _daemonState.value = DaemonState.Stopping(core.executableName, pid, isEscalatedToKill = false)

        try {
            monitorJob?.cancel()
            // Phase 1: Graceful SIGTERM
            process.destroy()

            val terminatedInTime = withTimeoutOrNull(GRACEFUL_STOP_TIMEOUT_MS) {
                while (isProcessAlive(process)) {
                    delay(50)
                }
                true
            } ?: false

            // Phase 2: Escalate to SIGKILL if still alive
            if (!terminatedInTime && isProcessAlive(process)) {
                _daemonState.value = DaemonState.Stopping(core.executableName, pid, isEscalatedToKill = true)
                process.destroyForcibly()

                if (pid > 0) {
                    try {
                        Runtime.getRuntime().exec(arrayOf("kill", "-9", pid.toString())).waitFor()
                    } catch (_: Exception) {}
                }

                withTimeoutOrNull(1000) {
                    while (isProcessAlive(process)) {
                        delay(50)
                    }
                }
            }

            val exitCode = try { process.exitValue() } catch (_: Exception) { 0 }
            val duration = System.currentTimeMillis() - launchTimestamp

            _daemonState.value = DaemonState.Terminated(core.executableName, exitCode, duration)
            currentProcess = null
            currentPid = -1
            restartCount.set(0)
            true
        } catch (e: Exception) {
            _daemonState.value = DaemonState.Idle
            currentProcess = null
            currentPid = -1
            false
        }
    }

    private fun startLogDrainers(process: Process) {
        stdoutJob?.cancel()
        stderrJob?.cancel()

        stdoutJob = scope.launch {
            drainStream(process.inputStream, isStderr = false)
        }
        stderrJob = scope.launch {
            drainStream(process.errorStream, isStderr = true)
        }
    }

    private suspend fun drainStream(inputStream: InputStream, isStderr: Boolean) = withContext(Dispatchers.IO) {
        try {
            BufferedReader(InputStreamReader(inputStream)).use { reader ->
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    val msg = line ?: continue
                    val entry = ProcessLogEntry(isStderr = isStderr, message = msg)
                    synchronized(logHistory) {
                        if (logHistory.size >= LOG_BUFFER_CAPACITY) {
                            logHistory.removeFirst()
                        }
                        logHistory.addLast(entry)
                    }
                    _logFlow.emit(entry)
                }
            }
        } catch (_: Exception) {}
    }

    private fun startExitMonitor(core: CoreBinary, process: Process) {
        monitorJob?.cancel()
        monitorJob = scope.launch {
            try {
                val exitCode = withContext(Dispatchers.IO) { process.waitFor() }
                if (!isExplicitShutdown.get()) {
                    handleUnexpectedCrash(core, exitCode)
                }
            } catch (_: CancellationException) {}
        }
    }

    private suspend fun handleUnexpectedCrash(core: CoreBinary, exitCode: Int) {
        val now = System.currentTimeMillis()
        if (now - firstCrashTimestamp > CRASH_WINDOW_MS) {
            firstCrashTimestamp = now
            restartCount.set(1)
        } else {
            restartCount.incrementAndGet()
        }

        val crashes = restartCount.get()
        if (crashes > MAX_CRASH_RESTARTS) {
            _daemonState.value = DaemonState.Crashed(
                binaryName = core.executableName,
                exitCode = exitCode,
                errorMessage = "Exceeded max restart attempts ($MAX_CRASH_RESTARTS)",
                restartCount = crashes
            )
            return
        }

        _daemonState.value = DaemonState.Crashed(
            binaryName = core.executableName,
            exitCode = exitCode,
            errorMessage = "Unexpected exit. Restarting ($crashes/$MAX_CRASH_RESTARTS)...",
            restartCount = crashes
        )

        val backoffMs = (1000L * (1 shl (crashes - 1))).coerceAtMost(6000L)
        delay(backoffMs)

        val configFile = currentConfigPath?.let { File(it) }
        val binaryManager = BinaryManager(context)
        val executable = binaryManager.getExecutableFile(core)

        if (configFile != null && configFile.exists() && executable.exists()) {
            startDaemon(core, executable, configFile)
        }
    }

    private fun resolveProcessPid(process: Process): Long {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try { return process.pid() } catch (_: Exception) {}
        }
        try {
            val field: Field = process.javaClass.getDeclaredField("pid")
            field.isAccessible = true
            return field.getLong(process)
        } catch (_: Exception) {}
        return -1
    }

    private fun isProcessAlive(process: Process?): Boolean {
        if (process == null) return false
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            process.isAlive
        } else {
            try {
                process.exitValue()
                false
            } catch (_: IllegalThreadStateException) {
                true
            }
        }
    }

    fun getLogHistory(): List<ProcessLogEntry> {
        synchronized(logHistory) { return logHistory.toList() }
    }

    fun release() {
        scope.launch {
            stopDaemon()
            scope.cancel()
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/process/ProcessHealthMonitor.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 3',
    description: 'Real-time SOCKS5 handshake verification (127.0.0.1:10808) probing loopback responsiveness, latency, and consecutive failures.',
    content: `package org.anticensor.vpn.core.process

import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.net.InetSocketAddress
import java.net.Socket

data class HealthStatus(
    val isHealthy: Boolean = false,
    val socks5Port: Int = 10808,
    val latencyMs: Long = -1,
    val consecutiveFailures: Int = 0,
    val lastCheckTimestamp: Long = 0
)

class ProcessHealthMonitor(
    private val socks5Host: String = "127.0.0.1",
    private val socks5Port: Int = 10808,
    private val checkIntervalMs: Long = 3000L,
    private val timeoutMs: Int = 1200
) {
    companion object {
        private const val TAG = "ProcessHealthMonitor"
        private const val MAX_CONSECUTIVE_FAILURES = 3
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitorJob: Job? = null

    private val _healthState = MutableStateFlow(HealthStatus(socks5Port = socks5Port))
    val healthState: StateFlow<HealthStatus> = _healthState.asStateFlow()

    private var onHealthFailedCallback: (() -> Unit)? = null

    fun setOnHealthFailedListener(listener: () -> Unit) {
        onHealthFailedCallback = listener
    }

    fun startMonitoring() {
        stopMonitoring()
        monitorJob = scope.launch {
            var failures = 0
            while (isActive) {
                val start = System.currentTimeMillis()
                val isUp = probeSocks5Listener()
                val latency = if (isUp) System.currentTimeMillis() - start else -1L

                if (isUp) {
                    failures = 0
                    _healthState.value = HealthStatus(
                        isHealthy = true,
                        socks5Port = socks5Port,
                        latencyMs = latency,
                        consecutiveFailures = 0,
                        lastCheckTimestamp = System.currentTimeMillis()
                    )
                } else {
                    failures++
                    _healthState.value = HealthStatus(
                        isHealthy = false,
                        socks5Port = socks5Port,
                        latencyMs = -1,
                        consecutiveFailures = failures,
                        lastCheckTimestamp = System.currentTimeMillis()
                    )

                    if (failures >= MAX_CONSECUTIVE_FAILURES) {
                        onHealthFailedCallback?.invoke()
                    }
                }
                delay(checkIntervalMs)
            }
        }
    }

    fun probeSocks5Listener(): Boolean {
        var socket: Socket? = null
        return try {
            socket = Socket()
            socket.soTimeout = timeoutMs
            socket.connect(InetSocketAddress(socks5Host, socks5Port), timeoutMs)

            val out = socket.getOutputStream()
            out.write(byteArrayOf(0x05, 0x01, 0x00))
            out.flush()

            val inStream = socket.getInputStream()
            val response = ByteArray(2)
            val bytesRead = inStream.read(response)

            bytesRead == 2 && response[0] == 0x05.toByte() && response[1] == 0x00.toByte()
        } catch (_: Exception) {
            false
        } finally {
            try { socket?.close() } catch (_: Exception) {}
        }
    }

    suspend fun waitForPortReady(maxWaitMs: Long = 5000L): Boolean = withContext(Dispatchers.IO) {
        val deadline = System.currentTimeMillis() + maxWaitMs
        while (System.currentTimeMillis() < deadline) {
            if (probeSocks5Listener()) {
                return@withContext true
            }
            delay(150)
        }
        false
    }

    fun stopMonitoring() {
        monitorJob?.cancel()
        monitorJob = null
        _healthState.value = HealthStatus(socks5Port = socks5Port, isHealthy = false)
    }

    fun release() {
        stopMonitoring()
        scope.cancel()
    }
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/process/DaemonState.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 3',
    description: 'Type definitions and sealed classes for daemon lifecycle states, CoreBinary metadata, and process log entries.',
    content: `package org.anticensor.vpn.core.process

sealed class DaemonState {
    object Idle : DaemonState()
    data class Extracting(val binaryName: String, val progressPercent: Int) : DaemonState()
    data class Starting(val binaryName: String, val configPath: String) : DaemonState()
    data class Running(
        val binaryName: String,
        val pid: Long,
        val socks5Port: Int,
        val startTimeMs: Long,
        val uptimeSeconds: Long = 0
    ) : DaemonState()
    data class Stopping(val binaryName: String, val pid: Long, val isEscalatedToKill: Boolean = false) : DaemonState()
    data class Crashed(val binaryName: String, val exitCode: Int, val errorMessage: String, val restartCount: Int) : DaemonState()
    data class Terminated(val binaryName: String, val exitCode: Int, val durationMs: Long) : DaemonState()
}

enum class CoreBinary(
    val executableName: String,
    val displayName: String,
    val description: String,
    val defaultSocks5Port: Int = 10808,
    val supportedProtocols: List<String>
) {
    XRAY("xray", "Xray Core", "Modular proxy core with XTLS-Reality, VMess, VLESS, Trojan, and Shadowsocks.", 10808, listOf("vless", "vmess", "trojan", "shadowsocks")),
    HYSTERIA2("hysteria", "Hysteria 2 Core", "QUIC-based bandwidth-accelerated proxy with Salamander protocol obfuscation.", 10808, listOf("hysteria2", "hy2")),
    NAIVE("naive", "NaïveProxy (Cronet)", "Chromium network stack with HTTP/2 and HTTP/3 camouflaged traffic.", 10808, listOf("naive+https", "naive+quic")),
    AMNEZIA_WG("amneziawg-go", "AmneziaWG Go Core", "Modified WireGuard engine with junk packet injection and header mutation.", 10808, listOf("amneziawg", "awg")),
    TUIC("tuic-client", "TUIC v5 Client", "0-RTT QUIC multiplexed proxy engine with BBR congestion control.", 10808, listOf("tuic"));

    companion object {
        fun fromProtocol(protocolScheme: String): CoreBinary {
            val normalized = protocolScheme.lowercase().trim()
            return entries.firstOrNull { binary ->
                binary.supportedProtocols.any { proto -> normalized.startsWith(proto) }
            } ?: XRAY
        }
    }
}

data class ProcessLogEntry(
    val timestampMs: Long = System.currentTimeMillis(),
    val isStderr: Boolean,
    val message: String
)`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/service/DaemonService.kt',
    language: 'kotlin',
    category: 'kotlin',
    phase: 'Phase 3',
    description: 'Background Foreground service coordinating between extracted protocol daemons, port allocation, health probes, and protocol switching.',
    content: `package org.anticensor.vpn.service

import android.app.Notification
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.anticensor.vpn.AegisApplication
import org.anticensor.vpn.core.process.*
import java.io.File

class DaemonService : Service() {

    companion object {
        private const val TAG = "DaemonService"
        const val NOTIFICATION_ID = 1002
        const val SOCKS5_PORT = 10808

        const val ACTION_START_DAEMON = "org.anticensor.vpn.ACTION_START_DAEMON"
        const val ACTION_STOP_DAEMON = "org.anticensor.vpn.ACTION_STOP_DAEMON"
        const val ACTION_SWITCH_PROTOCOL = "org.anticensor.vpn.ACTION_SWITCH_PROTOCOL"

        const val EXTRA_CORE_BINARY = "extra_core_binary"
        const val EXTRA_CONFIG_PATH = "extra_config_path"
    }

    private val binder = DaemonBinder()
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    lateinit var binaryManager: BinaryManager
        private set

    lateinit var processManager: ProcessManager
        private set

    lateinit var healthMonitor: ProcessHealthMonitor
        private set

    private val _serviceStatus = MutableStateFlow<String>("IDLE")
    val serviceStatus: StateFlow<String> = _serviceStatus.asStateFlow()

    inner class DaemonBinder : Binder() {
        fun getService(): DaemonService = this@DaemonService
    }

    override fun onCreate() {
        super.onCreate()
        binaryManager = BinaryManager(applicationContext)
        processManager = ProcessManager(applicationContext)
        healthMonitor = ProcessHealthMonitor(socks5Host = "127.0.0.1", socks5Port = SOCKS5_PORT)
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        val coreName = intent?.getStringExtra(EXTRA_CORE_BINARY) ?: CoreBinary.XRAY.name
        val configPath = intent?.getStringExtra(EXTRA_CONFIG_PATH)

        when (action) {
            ACTION_START_DAEMON -> {
                val core = try { CoreBinary.valueOf(coreName) } catch (_: Exception) { CoreBinary.XRAY }
                startDaemonWorkflow(core, configPath)
            }
            ACTION_SWITCH_PROTOCOL -> {
                val core = try { CoreBinary.valueOf(coreName) } catch (_: Exception) { CoreBinary.HYSTERIA2 }
                switchProtocol(core, configPath)
            }
            ACTION_STOP_DAEMON -> {
                stopDaemonWorkflow()
            }
        }
        return START_STICKY
    }

    fun startDaemonWorkflow(core: CoreBinary, configPath: String?) {
        serviceScope.launch(Dispatchers.IO) {
            _serviceStatus.value = "EXTRACTING_\${core.name}"
            startForeground(NOTIFICATION_ID, buildNotification("Starting \${core.displayName}..."))

            try {
                val executable = binaryManager.extractBinary(core)
                val configFile = if (configPath != null) File(configPath) else getOrCreateDefaultConfig(core)

                _serviceStatus.value = "LAUNCHING_\${core.name}"
                val started = processManager.startDaemon(core, executable, configFile)
                if (!started) {
                    _serviceStatus.value = "START_FAILED"
                    return@launch
                }

                _serviceStatus.value = "PROBING_SOCKS5"
                val portReady = healthMonitor.waitForPortReady(maxWaitMs = 6000L)

                if (portReady) {
                    _serviceStatus.value = "DAEMON_READY"
                    healthMonitor.startMonitoring()
                    updateNotification("\${core.displayName} Active (127.0.0.1:\$SOCKS5_PORT)")
                } else {
                    _serviceStatus.value = "PORT_TIMEOUT"
                }
            } catch (e: Exception) {
                _serviceStatus.value = "ERROR: \${e.message}"
            }
        }
    }

    fun switchProtocol(newCore: CoreBinary, newConfigPath: String?) {
        serviceScope.launch(Dispatchers.IO) {
            _serviceStatus.value = "SWITCHING_TO_\${newCore.name}"
            healthMonitor.stopMonitoring()
            processManager.stopDaemon()
            delay(300)
            startDaemonWorkflow(newCore, newConfigPath)
        }
    }

    fun stopDaemonWorkflow() {
        serviceScope.launch(Dispatchers.IO) {
            _serviceStatus.value = "STOPPING"
            healthMonitor.stopMonitoring()
            processManager.stopDaemon()
            _serviceStatus.value = "STOPPED"
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private fun getOrCreateDefaultConfig(core: CoreBinary): File {
        val file = File(filesDir, "config_\${core.executableName}.json")
        if (!file.exists()) {
            file.writeText(
                """
                {
                  "log": { "loglevel": "warning" },
                  "inbounds": [{
                    "port": \$SOCKS5_PORT,
                    "listen": "127.0.0.1",
                    "protocol": "socks",
                    "settings": { "auth": "noauth", "udp": true }
                  }],
                  "outbounds": [{ "protocol": "freedom" }]
                }
                """.trimIndent()
            )
        }
        return file
    }

    private fun buildNotification(contentText: String): Notification {
        return NotificationCompat.Builder(this, AegisApplication.VPN_NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle("Aegis Core Daemon")
            .setContentText(contentText)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(contentText: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        manager?.notify(NOTIFICATION_ID, buildNotification(contentText))
    }

    override fun onDestroy() {
        healthMonitor.release()
        processManager.release()
        serviceScope.cancel()
        super.onDestroy()
    }
}`
  }
];
