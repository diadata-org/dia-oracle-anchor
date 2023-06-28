FROM node:14-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:14-alpine

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
COPY .husky/* /usr/src/app/.husky/

RUN npm i --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

CMD [ "node", "dist/server.js" ]
