# cordova-android-www-dev-sync
Sync compiled android -> www folder with the latest files from your remote workstation

- Define your asset folder in server.js (ASSETS_FOLDER)
- Define your asset folder in client.js (ANDROID_WWW_FOLDER)



## ANDROID_WWW_FOLDER

Is the folder inside your compiled android project.


## ASSETS_FOLDER

Is the folder in your workstation (Ex: cordova_project/www)

## Watch directories

Server.js has a function to watch directories. By default, it watch js and css directories and sync any file.