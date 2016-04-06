FROM mhart/alpine-node
RUN apk add git bash make gcc g++ python

COPY . /src
WORKDIR /src

RUN npm install
RUN npm run build
RUN cd public/cms && npm install
RUN npm run cms:build
RUN npm install -g forever

EXPOSE 3000
CMD ["forever", "server.js"]