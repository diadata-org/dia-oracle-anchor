FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate
# RUN npx prisma migrate deploy

COPY . .

RUN npm run build

FROM node:18

ENV NODE_ENV production

WORKDIR /usr/src/app
COPY package*.json ./
COPY .husky/* /usr/src/app/.husky/

RUN npm i --omit=dev


COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
 
CMD [ "node", "dist/server.js" ]
