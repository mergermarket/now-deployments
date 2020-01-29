FROM node:13-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN npm i &&\
  npm run build &&\
  npm prune --production

FROM node:13-alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/node_modules ./node_modules
CMD ["node", "index.js"]

