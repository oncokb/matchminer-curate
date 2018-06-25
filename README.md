# MatchMinerCurate
MatchMinerCurate is a realtime trial curation platform by using [Clinical Trial Markup Language] (CTML) to label 
patient-specific genomic and clinical data, and structured eligibility criteria for clinical trials. We use Firebase 
realtime database to store all trials.

## Install Project
    npm install

## Prepare Firebase Realtime Database
1. Go to [Firebase Console] to create a project.
2. Select `Realtime Database` to store and synchronize data in realtime.
3. Choose sign-in method and add domain. Go to `Authentication` page and click `Sign-in method`, enable Google as 
default login method. Of course, you are welcome to try other sign-in providers. Next, add your domain name in 
`Authorized domains` like "localhost". 

## Prepare configuration files
1. Prepare files for front-end. 
    ```
    cp src/main/webapp/app/environments/environment.example.ts src/main/webapp/app/environments/environment.ts
    ```
2. Go to `Authentication` page in Firebase console, click `Web setup` button and Firebase config will pop up. Copy 
required fields to `environments.ts`.
    ```html
    <script src="https://www.gstatic.com/firebasejs/5.1.0/firebase.js"></script>
    <script>
      // Initialize Firebase
      var config = {
        apiKey: "********",
        authDomain: "example.firebaseapp.com",
        databaseURL: "https://example.firebaseio.com",
        projectId: "example",
        storageBucket: "example.appspot.com",
        messagingSenderId: "*******"
      };
      firebase.initializeApp(config);
    </script>
    ```
    
## Run Project
    yarn start

[Clinical Trial Markup Language]: https://matchminer.org
[Firebase Console]: https://console.firebase.google.com
