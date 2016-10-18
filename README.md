![Travis Build Status](https://travis-ci.org/BreakOutEvent/breakout-frontend.svg?branch=develop)
# frontend
Web Frontend for BreakOut

For related applications check the organization: https://github.com/BreakOutEvent

**Environment Variables**
* `FRONTEND_API_CLIENTID` *Client-ID used to identify at the [backend](https://github.com/BreakOutEvent/breakout-backend)*
* `FRONTEND_API_CLIENTSECRET` *Client-Secret used to authenticate at the [backend](https://github.com/BreakOutEvent/breakout-backend)*
* `FRONTEND_API_URL` *URL to the hosted [backend](https://github.com/BreakOutEvent/breakout-backend)*
* `FRONTEND_DB_USER` *MongoDB user*
* `FRONTEND_DB_PASSWORD` *MongoDB user password*
* `FRONTEND_DB_URL` *URL of the MongoDB*
* `FRONTEND_DB_PORT` *Port of the MongoDB*
* `FRONTEND_DB_NAME` *Name of the MongoDB Database*
* `FRONTEND_CLUSTER` *If 'true': spawns child-processes on each CPU core*
* `FRONTEND_SECRET` *Secret to de/encrypt user sessions*
* `FRONTEND_GDRIVE_DOCUMENT_ID` *Document-ID of the GDrive-Doc containing all members*
* `FRONTEND_GDRIVE_CLIENT_EMAIL` *Email of the GDRive dev-account with at least read rights to the member document*
* `FRONTEND_MEDIA_URL` *URL to the hosted [media uploader](https://github.com/BreakOutEvent/breakout-media-uploader) *
*

**Installation:**

1. `npm i` installs all dependencies and builds the frontend
1. Runs at `localhost:3000`
  
**Commands:**
* `npm build` builds frontend with grunt
* `npm log:info` prints info log
* `npm log:error` prints error log
* `npm log:clean` clears log
* `npm log:live_info` prints info log in real time


**Docker:**

Please note that all the above defined environment variables have to be defined and the MongoDB must be running.

* `docker build -t breakout/frontend .`
* `docker run -d -p 3000:3000 breakout/frontend`

