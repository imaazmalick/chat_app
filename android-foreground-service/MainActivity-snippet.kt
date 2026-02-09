// Add these methods to your MainActivity (which should extend BridgeActivity)
// to start the foreground service when the app goes to background and stop it when returning.

override fun onStart() {
    super.onStart()
    // app returned to foreground — stop background foreground service
    try {
        com.example.hrmchat.ForegroundService.stopService(this)
    } catch (e: Exception) { /* ignore */ }
}

override fun onStop() {
    super.onStop()
    // app moved to background — start foreground service to keep sockets alive
    try {
        com.example.hrmchat.ForegroundService.startService(this)
    } catch (e: Exception) { /* ignore */ }
}
