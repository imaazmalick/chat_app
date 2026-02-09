// Capacitor plugin integration helpers for HRM Chat Mobile
// Usage: include this script in your web bundle (www/index.html) or import from your app.

(function () {
  const SERVER = 'https://chat.softexsolution.com';

  async function setupPush() {
    try {
      const { PushNotifications } = window.Capacitor ? window.Capacitor.Plugins || {} : {};
      if (!PushNotifications) return;

      await PushNotifications.requestPermissions();
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        // send token to server to link device -> user
        fetch(SERVER + '/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value })
        }).catch(() => {});
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        // handle inbound push while app in foreground
        console.log('Push received', notification);
      });
    } catch (e) {
      console.warn('Push setup failed', e);
    }
  }

  async function takePhotoAndUpload() {
    try {
      const { Camera } = window.Capacitor ? window.Capacitor.Plugins || {} : {};
      const { Filesystem } = window.Capacitor ? window.Capacitor.Plugins || {} : {};
      if (!Camera || !Filesystem) throw new Error('Camera or Filesystem plugin missing');

      const photo = await Camera.getPhoto({ quality: 70, resultType: 'Base64' });
      const base64Data = photo.base64String;
      // Upload to your server endpoint (adjust path as needed)
      await fetch(SERVER + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'photo.jpg', data: base64Data })
      });
    } catch (e) {
      console.warn('Photo upload failed', e);
    }
  }

  // Expose helpers
  window.HRMChatMobile = {
    setupPush,
    takePhotoAndUpload
  };
})();
