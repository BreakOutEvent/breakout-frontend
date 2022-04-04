FROM node:16-alpine

WORKDIR /frontend

RUN npm install -g forever

COPY package.json /frontend
COPY package-lock.json /frontend

RUN npm ci

COPY . /frontend

RUN npm run build

ENV NODE_ENVIRONMENT prod

EXPOSE 3000
CMD ["forever", "src/server/app.js"]
