FROM mhart/alpine-node
RUN apk add --no-cache git bash make gcc g++ python

COPY . /src
WORKDIR /src

RUN npm install
RUN npm run build
RUN npm install -g forever

EXPOSE 3000
CMD ["forever", "app.js"]