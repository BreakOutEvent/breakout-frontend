# frontend
Web Frontend


## CMS
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

*das CMS ist im [standard style](https://github.com/feross/standard) geschrieben*

**Environment Variablen**
* `FRONTEND_API_CLIENTID`
* `FRONTEND_API_CLIENTSECRET`
* `FRONTEND_API_URL`
* `FRONTEND_DB_USER`
* `FRONTEND_DB_PASSWORD`
* `FRONTEND_DB_URL`
* `FRONTEND_DB_PORT`
* `FRONTEND_DB_NAME`

**Benutzung:**

1. `npm i` *installiert alle module des frontend und cms und baut das cms*
1. `npm start` *Baut das cms und startet den server*
1. Verfügbar unter `localhost:3000`, cms unter `localhost:3000/admin`

**Commands:**
* `npm start` baut cms und startet server
* `npm run cms:build` baut das cms
* `npm run cms:update` updated das cms und baut es
* `npm run cms:server` startet den webpack live-reload server des cms und macht es verfügbar unter `localhost:8080`, *`npm start` muss ebenfalls laufen*


**Docker:**
* `docker build -t breakout/frontend .`
* `docker run -d -p 3000:3000 breakout/frontend`