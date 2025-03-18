FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --production --silent --force

COPY . .

RUN npx prisma generate

RUN addgroup -g 1001 dev && adduser -D -u 1001 -G dev dev && chown -R dev:dev /usr/src/app

USER dev

CMD ["npm", "run", "start"]