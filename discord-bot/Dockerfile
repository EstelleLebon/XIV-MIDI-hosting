FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --silent --include=dev
RUN npm install -g nodemon --silent

COPY ./src ./src

RUN addgroup -g 1001 dev && adduser -D -u 1001 -G dev dev && chown -R dev:dev /usr/src/app

USER dev


CMD ["sh", "-c", "ls -la /usr/src/app && node src/deploy-commands.js && node src/bot.js"]