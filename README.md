![Travis Build Status](https://travis-ci.org/BreakOutEvent/breakout-frontend.svg?branch=develop)
# frontend
Web Frontend for BreakOut

For related applications check the organization: https://github.com/BreakOutEvent

# How to start breakout-frontend
1. Clone the repository: `git clone https://github.com/BreakOutEvent/breakout-frontend`
2. Request the config file `config-someenvname.json`
3. Start mongodb using docker: `docker run --name breakout-mongo -p "27017:27017" -d mongo`
4. Optional: start an instance of breakout-backend (requires further documenation)
5. Run `npm run build` to build project (e.g less -> css, jsx -> js, ...)
6. Run `NODE_ENVIRONMENT=yourenv npm start` to start frontend
7. Your application will be running at localhost:3000

# How to develop with breakout-frontend
1. Execute steps 1 - 4 from above
2. Run `npm run build-watch`. This watches for changes in client-side `*.js` `*.jsx` and `*.less` files and
builds the respective compiled files (which then can be found in `/public`). Keep this running during development!
3. Run `NODE_ENVIRONMENT=yourenv npm start` to start frontend
4. Your application will be running at localhost:3000
