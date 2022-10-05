FROM node:14

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY tsconfig.json /app
COPY .eslintrc /app
COPY .eslintignore /app
COPY views /app/views
COPY src /app/src
COPY public /app/public
COPY bin /app/bin

EXPOSE 7020

CMD ["node", "/app/bin/run"]
