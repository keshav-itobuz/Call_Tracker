package com.call_tracker

import android.Manifest
import android.content.pm.PackageManager
import android.provider.CallLog
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallLogModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "CallLogModule"
    }

    @ReactMethod
    fun getCallLogs(limit: Int, promise: Promise) {
        // Check if permission is granted
        if (ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.READ_CALL_LOG
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            promise.reject("PERMISSION_DENIED", "READ_CALL_LOG permission not granted")
            return
        }

        try {
            val callLogs = Arguments.createArray()
            
            val cursor = reactApplicationContext.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                null,
                null,
                null,
                "${CallLog.Calls.DATE} DESC"
            )

            cursor?.use {
                val numberIndex = it.getColumnIndex(CallLog.Calls.NUMBER)
                val typeIndex = it.getColumnIndex(CallLog.Calls.TYPE)
                val dateIndex = it.getColumnIndex(CallLog.Calls.DATE)
                val durationIndex = it.getColumnIndex(CallLog.Calls.DURATION)
                val nameIndex = it.getColumnIndex(CallLog.Calls.CACHED_NAME)

                var count = 0
                while (it.moveToNext() && count < limit) {
                    val callLog = Arguments.createMap()
                    
                    val number = if (numberIndex >= 0) it.getString(numberIndex) else ""
                    val type = if (typeIndex >= 0) it.getInt(typeIndex) else 0
                    val date = if (dateIndex >= 0) it.getLong(dateIndex) else 0L
                    val duration = if (durationIndex >= 0) it.getInt(durationIndex) else 0
                    val name = if (nameIndex >= 0) it.getString(nameIndex) else null

                    callLog.putString("phoneNumber", number ?: "Unknown")
                    callLog.putString("name", name ?: "")
                    callLog.putString("type", getCallType(type))
                    callLog.putDouble("timestamp", date.toDouble())
                    callLog.putInt("duration", duration)
                    
                    callLogs.pushMap(callLog)
                    count++
                }
            }

            promise.resolve(callLogs)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to fetch call logs: ${e.message}")
        }
    }

    private fun getCallType(type: Int): String {
        return when (type) {
            CallLog.Calls.INCOMING_TYPE -> "INCOMING"
            CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
            CallLog.Calls.MISSED_TYPE -> "MISSED"
            CallLog.Calls.VOICEMAIL_TYPE -> "VOICEMAIL"
            CallLog.Calls.REJECTED_TYPE -> "REJECTED"
            CallLog.Calls.BLOCKED_TYPE -> "BLOCKED"
            else -> "UNKNOWN"
        }
    }
}
