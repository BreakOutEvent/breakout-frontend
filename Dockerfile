FROM mhart/alpine-node
RUN apk add --no-cache git bash make gcc g++ python

COPY . /src
WORKDIR /src

RUN npm install
RUN npm install -g forever
RUN cd public/cms && npm install
RUN npm run cms:build

EXPOSE 3000
CMD ["forever", "server.js"]