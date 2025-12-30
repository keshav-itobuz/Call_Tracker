package com.call_tracker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.telephony.TelephonyManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallDetectionModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val MODULE_NAME = "CallDetectionModule"
        private const val CALL_ENDED_EVENT = "CallEnded"
    }
    
    private var phoneStateReceiver: BroadcastReceiver? = null
    private var wasRinging = false
    private var wasOffHook = false

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun startListening() {
        if (phoneStateReceiver != null) return // Already listening

        phoneStateReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val state = intent?.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return

                when (state) {
                    TelephonyManager.EXTRA_STATE_RINGING -> {
                        wasRinging = true
                    }
                    TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                        wasOffHook = true
                    }
                    TelephonyManager.EXTRA_STATE_IDLE -> {
                        if (wasRinging || wasOffHook) {
                            sendCallEndedEvent()
                            wasRinging = false
                            wasOffHook = false
                        }
                    }
                }
            }
        }

        val filter = IntentFilter(TelephonyManager.ACTION_PHONE_STATE_CHANGED)
        reactApplicationContext.registerReceiver(phoneStateReceiver, filter)
    }

    @ReactMethod
    fun stopListening() {
        phoneStateReceiver?.let {
            try {
                reactApplicationContext.unregisterReceiver(it)
            } catch (e: IllegalArgumentException) {
                // Receiver not registered
            }
            phoneStateReceiver = null
        }
    }

    private fun sendCallEndedEvent() {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(CALL_ENDED_EVENT, null)
    }

    override fun onCatalystInstanceDestroy() {
        stopListening()
    }
}
