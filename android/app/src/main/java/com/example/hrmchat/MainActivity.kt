package com.example.hrmchat

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Initializes the Bridge
    }

    override fun onStart() {
        super.onStart()
        // App returned to foreground — stop background foreground service
        try {
            ForegroundService.stopService(this)
        } catch (e: Exception) { /* ignore */ }
    }

    override fun onStop() {
        super.onStop()
        // App moved to background — start foreground service to keep sockets alive
        try {
            ForegroundService.startService(this)
        } catch (e: Exception) { /* ignore */ }
    }
}
