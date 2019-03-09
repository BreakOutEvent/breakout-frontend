FROM mhart/alpine-node:10
RUN apk add --no-cache git bash make gcc g++ python

COPY . /frontend
WORKDIR /frontend

RUN npm install
RUN npm run build
RUN npm install -g forever

ENV NODE_ENVIRONMENT prod

EXPOSE 3000
CMD ["forever", "src/server/app.js"]
