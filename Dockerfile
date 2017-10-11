FROM node:8

MAINTAINER Jo <jo@redcat.ninja>

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD npm run start
