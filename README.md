CI build for a signed APK (no Android Studio needed)

If you don't have Android Studio and want a production-signed APK, you can use the included GitHub Actions workflow to build and sign the APK in CI. I added a workflow at `.github/workflows/android-build.yml` that will:
- Install Node/pnpm, Capacitor and Android SDK tooling
- Add the Android platform and run `./gradlew assembleRelease`
- If you provide a keystore via repository secrets, it will sign the generated APK and upload the APK as a workflow artifact

Required repository secrets (add these in GitHub Settings → Secrets):

- `RELEASE_KEYSTORE_BASE64` — your JKS keystore file encoded as base64 (use `base64 release-keystore.jks | pbcopy` or similar)
- `RELEASE_KEYSTORE_PASSWORD` — the keystore password
- `RELEASE_KEY_ALIAS` — the alias inside the keystore

How to run the CI build
1. Push your changes to `main` (or open the workflow_dispatch in Actions and run manually).
2. After the workflow completes, download the artifact named `hrmchat-android-apk` from the workflow run's summary.

If you want, I can:
- Prepare a small script to convert your JKS keystore to base64 for uploading, or
- Attempt to run the build here (I cannot sign or produce a final APK in this environment because Android SDK is not configured with build-tools and signing credentials locally).

Encode keystore helper

I added a small helper script at `scripts/encode-keystore.sh` that converts a JKS keystore to a single-line base64 string suitable for the `RELEASE_KEYSTORE_BASE64` secret.

Example (on your local machine):

```bash
cd chat_app
sh scripts/encode-keystore.sh path/to/release-keystore.jks > release-keystore.base64
# then copy the contents of release-keystore.base64 into the GitHub secret `RELEASE_KEYSTORE_BASE64`
```

If you prefer not to provide a keystore, the CI will generate one and upload it as an artifact alongside the signed APK so you can download and keep the key for future updates.
HRM Chat Mobile (Capacitor wrapper)

This folder provides a minimal Capacitor mobile wrapper for the `hrm_chat` web app.

Strategy chosen: WebView to hosted server — the app loads your hosted `hrm_chat` URL inside a native WebView. This preserves server-side features and keeps parity with the web app.

Quick start

1. Install dependencies (run in this folder):

```bash
cd chat_app
pnpm install
```

2. The project is configured to load the hosted HRM Chat URL. If you need to change it, edit `capacitor.config.json` and set the `server.url` to your hosted HRM Chat URL, for example:

```json
{
  "server": { "url": "https://chat.softexsolution.com", "cleartext": false }
}
```

Note: `capacitor.config.json` in this repo is already set to `https://chat.softexsolution.com` and `www/index.html` will redirect there when opened.

3. Initialize Capacitor (if not already):

```bash
pnpm run cap:init
```

4. Add platforms and sync:

```bash
pnpm run cap:add-android
pnpm run cap:add-ios
pnpm run cap:sync
```

5. Open the native project in Android Studio / Xcode:

```bash
pnpm run cap:open:android
pnpm run cap:open:ios
```

Notes

- If you want the app to bundle the web build instead of loading a hosted URL, replace the contents of `www/` with a production web build and remove `server.url` from `capacitor.config.json`.
- To enable push notifications and other native plugins, install the corresponding Capacitor/Cordova plugins and follow their setup steps in the native projects.

Plugin & native features

- This project includes example plugin helpers at `www/capacitor-plugins.js` for:
  - Push notifications (`@capacitor/push-notifications`)
  - Camera (`@capacitor/camera`) and simple upload to your server
  - Filesystem (`@capacitor/filesystem`)

Install plugins (run in `chat_app`):

```bash
pnpm install @capacitor/cli@^5 @capacitor/core@^5 @capacitor/android@latest @capacitor/camera@^5 @capacitor/filesystem@^5 @capacitor/push-notifications@^5
pnpm run cap:sync
```

Push (Android) setup summary

- Add Firebase project and download `google-services.json` into `android/app/`.
- Add Firebase setup lines to `android/build.gradle` and `android/app/build.gradle` as described in the plugin docs.
- Configure FCM server key on your backend so you can send pushes to device tokens returned by the plugin.

iOS push notes

- For iOS, you'll need an Apple Developer account, APNs key/cert, and to configure push entitlements in Xcode.

Generating a release APK (requirements)

- Local machine with Android SDK, JDK 11+, Gradle, and Android Studio installed.
- `pnpm`, `node` and `npx` available.

Build steps (after `pnpm install` and `pnpm run cap:sync`):

```bash
# Add Android platform if not present
pnpm run cap:add-android

# Sync web/native
pnpm run cap:sync

# Open Android Studio for signing & generating release APK
pnpm run cap:open:android

# Or build from CLI (requires proper signing config in android/app/build.gradle):
cd android && ./gradlew assembleRelease
```

Signing the APK (quick commands)

```bash
# Create a keystore if you don't have one
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hrmchatkey

# Add the keystore properties to android/gradle.properties or configure signing in Android Studio
```

Why I cannot directly provide a signed APK here

- Building a production APK and signing it requires the Android SDK/JDK and keystore (private key) which are not available or appropriate to run inside this environment. I prepared everything so you can generate a signed release APK locally or in your CI using the steps above.

If you want, I can:
- Run `npx cap add android` and `npx cap sync` here (may succeed if Node toolchain exists), or
- Walk through adding Firebase `google-services.json` and a sample server endpoint to deliver push registration tokens to your backend.

If you'd like, I can:

- Attempt a static export of `hrm_chat` and adapt it for bundling (may fail if the project relies on server features).
- Add plugin setup for push notifications and socket background handling.
