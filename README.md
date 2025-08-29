# FitnessApp

A cross-platform fitness tracking app built with React Native, Expo, and NativeWind. Supports English and Spanish, persistent user preferences, and a local exercise/routine database.

## Features

* Multi-language support (English & Spanish) via [`src/i18n.ts`](https://www.google.com/search?q=src/i1n.ts)

* Persistent user preferences (theme, language, etc.) via [`src/services/preferencesService.ts`](https://www.google.com/search?q=src/services/preferencesService.ts)

* Local database for exercises and routines

* Responsive UI with NativeWind and Tailwind CSS

* Tab-based navigation using Expo Router

## Getting Started

### Prerequisites

* Node.js & npm

* Expo CLI (`npm install -g expo-cli`)

### Installation

```sh
npm install
````

### Running the app

```sh
npm start
```

## Building for Android (Manual Guide on Ubuntu)

This guide explains how to build a signed Android APK for testing or sharing without using Expo's cloud services. It's a great option if you prefer to build locally and have more control.

### Step 1: Install Native Prerequisites

To build the app locally, you need a full Android development environment.

1.  **Install Java Development Kit (JDK):** The Android build system requires a JDK. OpenJDK is the standard choice on Ubuntu.

    ```bash
    sudo apt update
    sudo apt install openjdk-17-jdk
    ```

2.  **Install Android Studio:** This is the easiest way to get the necessary Android SDK, build tools, and emulator.

      * Download and install **Android Studio** for Linux from the official website.

      * Follow the on-screen instructions to complete the setup wizard, which will install the Android SDK and SDK Platform-Tools.

### Step 2: Configure Your Environment

After installing Android Studio, you must set up environment variables so your system can find the Android build tools.

1.  **Set `ANDROID_HOME` and `PATH`:** Open your shell's configuration file (e.g., `~/.bashrc`, `~/.zshrc`). Add the following lines to the end of the file.

    ```bash
    # Android SDK
    export ANDROID_HOME=$HOME/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
    ```

2.  **Apply the changes:** Run `source ~/.bashrc` (or `source ~/.zshrc`) or restart your terminal.

### Step 3: Prepare the Project

The manual build process requires your project to have the native Android directory. Expo's `prebuild` command handles this for you.

1.  **Generate the `android` directory:** From your project's root, run the following command. This will create the `android` and `ios` folders.

    ```bash
    npx expo prebuild
    ```

### Step 4: Build a Development (Debug) APK

This is the simplest way to get a build you can test on a connected device or emulator. It's not signed for distribution.

1.  **Run the command:**

    ```bash
    npx expo run:android
    ```

    This command will automatically build a debug APK and attempt to install it on a connected device or an active Android emulator.

### Step 5: Build a Production (Release) APK for Distribution

If you want to share a final, signed version of the app with your friend, follow these steps.

1.  **Generate a Signing Key:** This key proves that the app came from you. Run the command inside your project's `android/app` directory.

    ```bash
    cd android/app
    sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```

    You'll be prompted to create a password for the keystore. **Remember this password and all the details you provide\!** The `my-upload-key.keystore` file will be created in this folder.

2.  **Configure Gradle:** Open `android/gradle.properties` and add your key information. **Note:** Do not share this file publicly.

    ```properties
    # Store the passwords and alias here
    MYAPP_UPLOAD_KEY_STORE_FILE=my-upload-key.keystore
    MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
    MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
    MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
    ```

    Next, open `android/app/build.gradle`. Find the `android` block and add `signingConfigs` and `buildTypes` to enable signing for the release build.

    ```gradle
    android {
        ...
        defaultConfig { ... }
        signingConfigs {
            release {
                storeFile file(MYAPP_UPLOAD_KEY_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
        buildTypes {
            release {
                ...
                signingConfig signingConfigs.release
            }
        }
    }
    ```

3.  **Build the Release File:** Navigate to the `android` directory and run the Gradle command to build the final APK or AAB file.

    ```bash
    # Change to the android directory
    cd ../
    # Build a signed APK for sharing
    ./gradlew assembleRelease
    # Or, build a signed AAB (recommended for Google Play)
    # ./gradlew bundleRelease
    ```

4.  **Locate the APK/AAB:** Your final signed file will be in the `android/app/build/outputs/apk/release/` or `android/app/build/outputs/bundle/release/` directory.

<!-- end list -->

```
```