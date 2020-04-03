FROM node:12-slim

RUN npm i -g --registry=https://registry.npm.taobao.org cnpm npm@latest

VOLUME ["/app/log"]

ENTRYPOINT []

ENV APP_PORT 80
EXPOSE 80
CMD ["npm", "run", "app"]

WORKDIR /app
ADD . .
RUN cnpm i \
    && npm run init \
    && npm run build
