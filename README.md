# frontend
Web Frontend


## CMS
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

*das CMS ist im [standard style](https://github.com/feross/standard) geschrieben*

**Environment Variablen**
* `FRONTEND_API_CLIENTID` *Client-ID dieses Node-Servers für das Backend*
* `FRONTEND_API_CLIENTSECRET` *Client-Secret für das Backend*
* `FRONTEND_API_URL` *URL der Backend-API*
* `FRONTEND_DB_USER` *Datenbankuser*
* `FRONTEND_DB_PASSWORD` *Passwort vom Datenbankuser*
* `FRONTEND_DB_URL` *URL oder IP der Datenbank*
* `FRONTEND_DB_PORT` *Port der Datenbank*
* `FRONTEND_DB_NAME` *Datenbank-Name*
* `FRONTEND_CLUSTER` *Startet einen Child-Prozess pro CPU-Kern, falls diese Variable "true"
enthält*
* `FRONTEND_SECRET` *Secret für die Benutzer-Sessions*

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