FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --production --silent

COPY . .

RUN addgroup -g 1001 dev && adduser -D -u 1001 -G dev dev && chown -R dev:dev /usr/src/app

USER dev

CMD ["sh", "-c", "ls -la /usr/src/app && node deploy-commands.js && node bot.js"]