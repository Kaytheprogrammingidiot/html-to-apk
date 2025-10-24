const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const sharp = require("sharp");
const { exec } = require("child_process");

const app = express();
app.use(require("cors")());

const upload = multer({ dest: "uploads/" });

app.post("/api/build-apk", upload.fields([
  { name: "htmlZip", maxCount: 1 },
  { name: "icon", maxCount: 1 }
]), async (req, res) => {
  const { appName, packageName, versionName, permissions } = req.body;
  const htmlZip = req.files["htmlZip"][0];
  const icon = req.files["icon"][0];

  const projectPath = path.join(__dirname, "android-project");

  

  // 1. Unzip HTML
  await fs.createReadStream(htmlZip.path)
    .pipe(unzipper.Extract({ path: path.join(projectPath, "app/src/main/assets") }))
    .promise();

  // 2. Resize icon
  const densities = {
    mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192
  };
  for (const [folder, size] of Object.entries(densities)) {
    await sharp(icon.path)
      .resize(size, size)
      .toFile(`${projectPath}/app/src/main/res/mipmap-${folder}/ic_launcher.png`);
  }

  // 3. Inject manifest + gradle
  const manifestPath = `${projectPath}/app/src/main/AndroidManifest.xml`;
  const manifest = `
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">
    <uses-permission android:name="android.permission.${permissions}" />
    <application android:label="${appName}" android:icon="@mipmap/ic_launcher">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  fs.writeFileSync(manifestPath, manifest);

  const gradlePath = `${projectPath}/app/build.gradle`;
  const gradle = `
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}
android {
    namespace '${packageName}'
    compileSdk 33
    defaultConfig {
        applicationId "${packageName}"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "${versionName}"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    sourceSets {
        main {
            assets.srcDirs = ['src/main/assets']
        }
    }
}
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.webkit:webkit:1.8.0'
}`;
  fs.writeFileSync(gradlePath, gradle);

  // 4. Build APK
  exec("./gradlew assembleRelease", { cwd: projectPath }, (err) => {
    if (err) return res.status(500).send("Build failed");
    const apkPath = path.join(projectPath, "app/build/outputs/apk/release/app-release.apk");
    res.download(apkPath);
  });
});

app.listen(3000, () => console.log("API running on port 3000"));