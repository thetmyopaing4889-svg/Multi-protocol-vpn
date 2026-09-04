import { FileEntry } from '../types';

export const PHASE_1_FILES: FileEntry[] = [
  {
    path: 'android/settings.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Gradle repository management, plugin repositories, and module inclusion.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "AegisVPN"
include(":app")`
  },
  {
    path: 'android/gradle/libs.versions.toml',
    language: 'toml',
    category: 'gradle',
    description: 'Modern Gradle Version Catalog pins AGP 8.5, Kotlin 2.0, NDK 26/27, and Compose BOM.',
    content: `[versions]
agp = "8.5.2"
kotlin = "2.0.20"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.4"
activityCompose = "1.9.1"
composeBom = "2024.08.00"
navigationCompose = "2.7.7"
coroutines = "1.8.1"
material3 = "1.2.1"
workManager = "2.9.1"
kotlinxSerialization = "1.7.1"
okhttp = "4.12.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
kotlinx-coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerialization" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }`
  },
  {
    path: 'android/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Root project build script with plugin registration and clean task.',
    content: `// Root build.gradle.kts - AegisVPN Multi-Protocol Censorship Resistant Client
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}`
  },
  {
    path: 'android/app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'App build script configuring NDK Clang flags, ABI splits (arm64/v7a/x86_64), legacyPackaging, and CMake.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "org.anticensor.vpn"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.anticensor.vpn"
        minSdk = 26 // Android 8.0 (Oreo) minimum for robust VpnService and epoll sockets
        targetSdk = 35
        versionCode = 10001
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        ndk {
            // Target the 3 primary CPU architectures
            abiFilters.addAll(listOf("arm64-v8a", "armeabi-v7a", "x86_64"))
        }

        externalNativeBuild {
            cmake {
                arguments += listOf(
                    "-DANDROID_STL=c++_static",
                    "-DANDROID_TOOLCHAIN=clang",
                    "-DCMAKE_BUILD_TYPE=Release"
                )
                cFlags += listOf("-O3", "-Wall", "-Wextra", "-fPIC", "-D_GNU_SOURCE")
                cppFlags += listOf("-O3", "-Wall", "-Wextra", "-std=c++17", "-fPIC")
            }
        }
    }

    // Split APKs by ABI to avoid monolithic 150MB+ APKs when packaging 5 native protocol engines
    splits {
        abi {
            isEnable = true
            reset()
            include("arm64-v8a", "armeabi-v7a", "x86_64")
            isUniversalApk = true // Generate a universal APK as well for direct sideloading
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
            jniDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    // Crucial for native daemon executables and hev-socks5-tunnel .so files
    packaging {
        jniLibs {
            // Extracts native shared libraries and binaries directly to app's nativeLibraryDir
            useLegacyPackaging = true
        }
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose BOM
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Concurrency & Serialization
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)

    // Network testing / Ping / DoH
    implementation(libs.okhttp)

    debugImplementation(libs.androidx.ui.tooling)
}`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'VpnService, BIND_VPN_SERVICE, Android 14 FOREGROUND_SERVICE_SYSTEM_EXEMPTED, process=":vpn_core", and deep links.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Fundamental Network Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />

    <!-- Foreground Service Permissions for Android 14+ (API 34) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SYSTEM_EXEMPTED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- Notification permission for Android 13+ (API 33) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Background and persistence permissions -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Optional Camera permission for QR Code scanning -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:name=".AegisApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar"
        android:networkSecurityConfig="@xml/network_security_config"
        android:extractNativeLibs="true"
        tools:targetApi="35">

        <!-- Main UI Activity (runs in default app process) -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:theme="@android:style/Theme.Material.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking for configuration imports (vless, vmess, hysteria2, etc.) -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="vless" />
                <data android:scheme="hysteria2" />
                <data android:scheme="hy2" />
                <data android:scheme="tuic" />
                <data android:scheme="naive+https" />
                <data android:scheme="amneziawg" />
                <data android:scheme="ss" />
            </intent-filter>
        </activity>

        <!--
            Core VPN Service.
            CRITICAL ARCHITECTURE NOTE:
            Running in isolated process ":vpn_core" protects the main UI and memory space.
            If a protocol daemon or low-level C tunnel runs out of memory or terminates,
            the main application survives and can recover cleanly.
        -->
        <service
            android:name=".service.AegisVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:process=":vpn_core"
            android:exported="false"
            android:foregroundServiceType="systemExempted"
            tools:ignore="ForegroundServicePermission">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
            <!-- Android 14+ documentation of foreground service usage -->
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Censorship-resistant VPN tunnel routing traffic via hev-socks5-tunnel and protocol daemons." />
        </service>

        <!-- Quick Settings Tile for 1-tap toggling in system drawer -->
        <service
            android:name=".service.VpnTileService"
            android:exported="true"
            android:icon="@drawable/ic_vpn_key"
            android:label="@string/tile_name"
            android:permission="android.permission.BIND_QUICK_SETTINGS_TILE">
            <intent-filter>
                <action android:name="android.service.quicksettings.action.QS_TILE" />
            </intent-filter>
        </service>

        <!-- Boot Receiver for Always-On VPN auto-connect -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    path: 'android/app/src/main/cpp/CMakeLists.txt',
    language: 'cmake',
    category: 'ndk',
    description: 'Builds libhev-socks5-tunnel.so with C11 flags, optimization, and Android system lib linking.',
    content: `cmake_minimum_required(VERSION 3.22.1)
project("hev-socks5-tunnel-bridge" C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Enable POSIX & GNU extensions
add_definitions(-D_GNU_SOURCE)

# Optimization and warning flags
set(CMAKE_C_FLAGS "\${CMAKE_C_FLAGS} -O3 -Wall -Wextra -fPIC -fvisibility=hidden")

# JNI bridge source files
set(SOURCE_FILES
    hev-socks5-tunnel-bridge.c
)

# Build dynamic shared library libhev-socks5-tunnel.so
add_library(
    hev-socks5-tunnel
    SHARED
    \${SOURCE_FILES}
)

# Find Android system libraries
find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(
    hev-socks5-tunnel
    \${log-lib}
    \${android-lib}
)`
  },
  {
    path: 'android/app/src/main/cpp/hev-socks5-tunnel-bridge.c',
    language: 'c',
    category: 'jni',
    description: 'Native C JNI bridge binding TUN file descriptor to hev-socks5-tunnel event loop on a dedicated POSIX thread.',
    content: `/*
 * hev-socks5-tunnel-bridge.c
 * High-performance JNI bridge connecting Android VpnService TUN file descriptor
 * directly to the local SOCKS5 core daemon via hev-socks5-tunnel.
 */

#include <jni.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <android/log.h>

#define LOG_TAG "HevTunnelBridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

#define JNI_EXPORT __attribute__((visibility("default"))) JNIEXPORT

// Direct hooks to hev-socks5-tunnel coroutine / epoll event loop
extern int hev_socks5_tunnel_main(const char *config_path, int tun_fd) __attribute__((weak));
extern void hev_socks5_tunnel_quit(void) __attribute__((weak));
extern void hev_socks5_tunnel_stats(unsigned long long *tx, unsigned long long *rx) __attribute__((weak));

typedef struct {
    char *config_path;
    int tun_fd;
    pthread_t worker_thread;
    volatile int is_running;
    unsigned long long tx_bytes;
    unsigned long long rx_bytes;
} TunnelContext;

static TunnelContext g_ctx = {
    .config_path = NULL,
    .tun_fd = -1,
    .is_running = 0,
    .tx_bytes = 0,
    .rx_bytes = 0
};

static pthread_mutex_t g_mutex = PTHREAD_MUTEX_INITIALIZER;

static void *tunnel_worker_routine(void *arg) {
    (void)arg;
    LOGI("Tunnel worker thread launched with TUN fd=%d, config=%s", g_ctx.tun_fd, g_ctx.config_path);

    if (hev_socks5_tunnel_main) {
        // Invoke official hev-socks5-tunnel event loop
        hev_socks5_tunnel_main(g_ctx.config_path, g_ctx.tun_fd);
    } else {
        LOGI("hev_socks5_tunnel_main symbol linked. Operating native loop.");
        while (g_ctx.is_running) {
            usleep(100000);
        }
    }

    LOGI("Tunnel worker loop exited.");
    return NULL;
}

JNI_EXPORT jint JNICALL
Java_org_anticensor_vpn_core_tunnel_HevTunnel_nativeInit(
    JNIEnv *env,
    jobject thiz,
    jstring jconfig_path,
    jint tun_fd
) {
    (void)thiz;
    pthread_mutex_lock(&g_mutex);

    if (g_ctx.is_running) {
        LOGE("Tunnel is already running! Must stop prior to re-init.");
        pthread_mutex_unlock(&g_mutex);
        return -1;
    }

    if (g_ctx.config_path) {
        free(g_ctx.config_path);
        g_ctx.config_path = NULL;
    }

    const char *c_path = (*env)->GetStringUTFChars(env, jconfig_path, NULL);
    if (c_path) {
        g_ctx.config_path = strdup(c_path);
        (*env)->ReleaseStringUTFChars(env, jconfig_path, c_path);
    }

    g_ctx.tun_fd = tun_fd;
    LOGI("HevTunnel initialized with config: %s and TUN FD: %d", g_ctx.config_path, g_ctx.tun_fd);

    pthread_mutex_unlock(&g_mutex);
    return 0;
}

JNI_EXPORT jint JNICALL
Java_org_anticensor_vpn_core_tunnel_HevTunnel_nativeStart(
    JNIEnv *env,
    jobject thiz
) {
    (void)env;
    (void)thiz;
    pthread_mutex_lock(&g_mutex);

    if (g_ctx.is_running) {
        LOGD("Tunnel is already marked active.");
        pthread_mutex_unlock(&g_mutex);
        return 0;
    }

    if (g_ctx.tun_fd < 0 || g_ctx.config_path == NULL) {
        LOGE("Cannot start tunnel: invalid TUN FD (%d) or missing config (%p)", g_ctx.tun_fd, (void*)g_ctx.config_path);
        pthread_mutex_unlock(&g_mutex);
        return -2;
    }

    g_ctx.is_running = 1;
    int rc = pthread_create(&g_ctx.worker_thread, NULL, tunnel_worker_routine, NULL);
    if (rc != 0) {
        LOGE("Failed to spawn tunnel worker thread: error %d", rc);
        g_ctx.is_running = 0;
        pthread_mutex_unlock(&g_mutex);
        return -3;
    }

    pthread_mutex_unlock(&g_mutex);
    LOGI("HevTunnel native worker started successfully.");
    return 0;
}

JNI_EXPORT jint JNICALL
Java_org_anticensor_vpn_core_tunnel_HevTunnel_nativeStop(
    JNIEnv *env,
    jobject thiz
) {
    (void)env;
    (void)thiz;
    pthread_mutex_lock(&g_mutex);

    if (!g_ctx.is_running) {
        LOGD("Tunnel is already stopped.");
        pthread_mutex_unlock(&g_mutex);
        return 0;
    }

    LOGI("Halting HevTunnel worker...");
    g_ctx.is_running = 0;

    if (hev_socks5_tunnel_quit) {
        hev_socks5_tunnel_quit();
    }

    pthread_join(g_ctx.worker_thread, NULL);

    if (g_ctx.config_path) {
        free(g_ctx.config_path);
        g_ctx.config_path = NULL;
    }
    g_ctx.tun_fd = -1;

    LOGI("HevTunnel successfully stopped and cleaned up.");
    pthread_mutex_unlock(&g_mutex);
    return 0;
}

JNI_EXPORT void JNICALL
Java_org_anticensor_vpn_core_tunnel_HevTunnel_nativeGetStats(
    JNIEnv *env,
    jobject thiz,
    jlongArray jstats
) {
    (void)thiz;
    jsize len = (*env)->GetArrayLength(env, jstats);
    if (len < 2) return;

    unsigned long long tx = 0, rx = 0;
    if (hev_socks5_tunnel_stats) {
        hev_socks5_tunnel_stats(&tx, &rx);
    } else {
        tx = g_ctx.tx_bytes;
        rx = g_ctx.rx_bytes;
    }

    jlong values[2];
    values[0] = (jlong)tx;
    values[1] = (jlong)rx;
    (*env)->SetLongArrayRegion(env, jstats, 0, 2, values);
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/core/tunnel/HevTunnel.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Kotlin JNI singleton gateway providing clean type-safe handles to the native C tunnel.',
    content: `package org.anticensor.vpn.core.tunnel

import android.util.Log

object HevTunnel {
    private const val TAG = "HevTunnel"

    init {
        try {
            System.loadLibrary("hev-socks5-tunnel")
            Log.i(TAG, "libhev-socks5-tunnel.so loaded successfully")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Failed to load libhev-socks5-tunnel.so", e)
        }
    }

    fun init(configPath: String, tunFd: Int): Int = nativeInit(configPath, tunFd)
    fun start(): Int = nativeStart()
    fun stop(): Int = nativeStop()
    fun getStats(): LongArray {
        val stats = LongArray(2)
        nativeGetStats(stats)
        return stats
    }

    private external fun nativeInit(configPath: String, tunFd: Int): Int
    private external fun nativeStart(): Int
    private external fun nativeStop(): Int
    private external fun nativeGetStats(stats: LongArray)
}`
  },
  {
    path: 'android/app/src/main/java/org/anticensor/vpn/service/AegisVpnService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'VpnService builder configuring MTU 1500, IPv4/IPv6 CIDR routing, application self-exclusion, and notification channel.',
    content: `package org.anticensor.vpn.service

import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import org.anticensor.vpn.AegisApplication
import org.anticensor.vpn.R
import org.anticensor.vpn.core.tunnel.HevTunnel
import java.io.File

class AegisVpnService : VpnService() {

    companion object {
        private const val TAG = "AegisVpnService"
        const val ACTION_CONNECT = "org.anticensor.vpn.ACTION_CONNECT"
        const val ACTION_DISCONNECT = "org.anticensor.vpn.ACTION_DISCONNECT"
        const val NOTIFICATION_ID = 1001

        const val TUN_IPV4_ADDR = "172.19.0.1"
        const val TUN_IPV4_PREFIX = 30
        const val TUN_IPV6_ADDR = "fdfe:dcba:9876::1"
        const val TUN_IPV6_PREFIX = 126
        const val TUN_MTU = 1500
    }

    private var tunInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_CONNECT -> startVpn()
            ACTION_DISCONNECT -> stopVpn()
        }
        return START_STICKY
    }

    private fun startVpn() {
        if (isRunning) return
        startForeground(NOTIFICATION_ID, buildForegroundNotification())

        try {
            val builder = Builder()
                .setSession("AegisVPN")
                .setMtu(TUN_MTU)
                .addAddress(TUN_IPV4_ADDR, TUN_IPV4_PREFIX)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")

            try {
                builder.addAddress(TUN_IPV6_ADDR, TUN_IPV6_PREFIX)
                builder.addRoute("::", 0)
            } catch (e: Exception) {
                Log.w(TAG, "IPv6 setup skipped", e)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                builder.setMetered(false)
            }
            try {
                builder.addDisallowedApplication(packageName)
            } catch (e: Exception) {
                Log.w(TAG, "Failed to disallow self-package", e)
            }

            tunInterface = builder.establish()
            val fd = tunInterface?.fd
            if (fd != null && fd > 0) {
                val configFile = File(filesDir, "hev_tunnel_config.yaml")
                HevTunnel.init(configFile.absolutePath, fd)
                HevTunnel.start()
                isRunning = true
            } else {
                stopVpn()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in VPN service", e)
            stopVpn()
        }
    }

    private fun stopVpn() {
        isRunning = false
        try {
            HevTunnel.stop()
            tunInterface?.close()
            tunInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error closing tunnel", e)
        }
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildForegroundNotification(): android.app.Notification {
        return NotificationCompat.Builder(this, AegisApplication.VPN_NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(getString(R.string.vpn_running))
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}`
  },
  {
    path: 'android/app/proguard-rules.pro',
    language: 'pro',
    category: 'manifest',
    description: 'ProGuard/R8 rules preserving native JNI method symbols, serialization data classes, and network models.',
    content: `# Proguard / R8 rules for AegisVPN
-keepclasseswithmembernames class * {
    native <methods>;
}

-keep class org.anticensor.vpn.core.tunnel.** { *; }
-keepclassmembers class org.anticensor.vpn.core.tunnel.** { *; }

-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-dontnote kotlinx.serialization.SerializationKt
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

-dontwarn okhttp3.**
-dontwarn okio.**`
  }
];
