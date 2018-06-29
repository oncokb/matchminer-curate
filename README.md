# MatchMinerCurate
MatchMinerCurate is a realtime trial curation platform by using [Clinical Trial Markup Language] (CTML) to label 
patient-specific genomic and clinical data, and structured eligibility criteria for clinical trials. We use Firebase 
realtime database to store all trials.

## Preparation
### Install Project
Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.
2. [Yarn][]: We use Yarn to manage Node dependencies.
   Depending on your system, you can install Yarn either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

### Prepare Firebase Realtime Database
1. Go to [Firebase Console] and login with your Google account.
2. Create a new project by clicking "Add Project".
3. Choose sign-in method and add domain. Click "Authentication" under "Develop" section on the left panel and choose 
`Sign-in method` tab, enable Google as default login method. Of course, you are welcome to try other sign-in providers. 
Next, add your domain name in `Authorized domains` like "localhost". 

Note: **Please store all trials in a list named `Trials`.**

### Prepare configuration files
1. Prepare files for front-end. 
    ```
    cp src/main/webapp/app/environments/environment.example.ts src/main/webapp/app/environments/environment.ts
    ```
2. Go to `Authentication` page in Firebase console, click `Web setup` button and Firebase config will pop up. Copy 
required fields to `environments.ts`.
    ```
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
    ```
    
### Run Project
We use yarn scripts and [Webpack][] as our build system.


Run the following command in a terminal to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    yarn start

[Yarn][] is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `yarn update` and `yarn install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `yarn help update`.

The `yarn run` command will list all of the scripts available to run for this project.

## Building for production

To optimize the matchminerCurate application for production, run:

    ./mvnw -Pprod clean package

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

    java -jar target/*.war

Then navigate to [http://localhost:8090](http://localhost:8090) in your browser.

Refer to [Using JHipster in production][] for more details.

## Database Features   
### Assign Permission
You can decide who has read and write access to your database by setting [Firebase Realtime Database Rules].

There is an example below to show how to assign permission for users in the `WhiteList` to read and write data in 
`Trials` list.
    
    {
      "rules": {
        "Trials": {
          ".read": "root.child('WhiteList').val().contains(auth.email)",
          ".write": "root.child('WhiteList').val().contains(auth.email)"
        }, 
        "WhiteList": {
          ".read": false,
          ".write": false
        }  
      }
    }
        
### Auto-backup
Firebase provides service to [auto-backup] database everyday. You can turn on auto-backup by clicking `Backup` tab on 
"Database" page. 

You may pay for auto-backup. Firebase will charge money for backup files placed in Google Cloud Storage bucket. For 
realtime database, you will be charged once data storage is over 1 GB.

You can enable `storage 30 day lifecycle`, which means files in your bucket will be automatically 
deleted after 30 days. This helps to reduce unwanted old backups, saving you on storage costs, and keeping your bucket directory clean.

For detailed price information, please take a look at [Pricing Plans].

## Development
### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

    yarn add --exact leaflet

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

    yarn add --dev --exact @types/leaflet

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Edit [src/main/webapp/app/vendor.ts](src/main/webapp/app/vendor.ts) file:
~~~
import 'leaflet/dist/leaflet.js';
~~~

Edit [src/main/webapp/content/css/vendor.css](src/main/webapp/content/css/vendor.css) file:
~~~
@import '~leaflet/dist/leaflet.css';
~~~
Note: there are still few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

### Using angular-cli

You can also use [Angular CLI][] to generate some custom client code.

For example, the following command:

    ng generate component my-component

will generate few files:

    create src/main/webapp/app/my-component/my-component.component.html
    create src/main/webapp/app/my-component/my-component.component.ts
    update src/main/webapp/app/app.module.ts

### Doing API-First development using swagger-codegen

[Swagger-Codegen]() is configured for this application. You can generate API code from the `src/main/resources/swagger/api.yml` definition file by running:
```bash
./mvnw generate-sources
```
Then implements the generated interfaces with `@RestController` classes.

To edit the `api.yml` definition file, you can use a tool such as [Swagger-Editor](). Start a local instance of the swagger-editor using docker by running: `docker-compose -f src/main/docker/swagger-editor.yml up -d`. The editor will then be reachable at [http://localhost:7742](http://localhost:7742).

Refer to [Doing API-First development][] for more details.

## Testing

To launch your application's tests, run:

    ./mvnw clean test

### Client tests

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:

    yarn test



For more information, refer to the [Running tests page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

For example, to start a mongodb database in a docker container, run:

    docker-compose -f src/main/docker/mongodb.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/mongodb.yml down

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

    ./mvnw verify -Pprod dockerfile:build

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[Clinical Trial Markup Language]: https://matchminer.org
[Firebase Console]: https://console.firebase.google.com
[Firebase Realtime Database Rules]: https://firebase.google.com/docs/database/security
[auto-backup]: https://firebase.google.com/docs/database/backups
[Pricing Plans]:https://firebase.google.com/pricing

[JHipster Homepage and latest documentation]: http://www.jhipster.tech
[JHipster 4.13.3 archive]: http://www.jhipster.tech/documentation-archive/v4.13.3

[Using JHipster in development]: http://www.jhipster.tech/documentation-archive/v4.13.3/development/
[Using Docker and Docker-Compose]: http://www.jhipster.tech/documentation-archive/v4.13.3/docker-compose
[Using JHipster in production]: http://www.jhipster.tech/documentation-archive/v4.13.3/production/
[Running tests page]: http://www.jhipster.tech/documentation-archive/v4.13.3/running-tests/
[Setting up Continuous Integration]: http://www.jhipster.tech/documentation-archive/v4.13.3/setting-up-ci/


[Node.js]: https://nodejs.org/
[Yarn]: https://yarnpkg.org/
[Webpack]: https://webpack.github.io/
[Angular CLI]: https://cli.angular.io/
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/
[Leaflet]: http://leafletjs.com/
[DefinitelyTyped]: http://definitelytyped.org/
[Swagger-Codegen]: https://github.com/swagger-api/swagger-codegen
[Swagger-Editor]: http://editor.swagger.io
[Doing API-First development]: http://www.jhipster.tech/documentation-archive/v4.13.3/doing-api-first-development/
