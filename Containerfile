FROM docker.io/library/node:12

RUN useradd --create-home rhythmbot
WORKDIR /home/rhythmbot
USER rhythmbot

COPY package.json/ ./
COPY package-lock.json/ ./
RUN npm install

COPY tsconfig.json/ ./
COPY src/ ./src
RUN npm run build

COPY helptext.txt ./

COPY LICENSE ./
COPY README.md ./

VOLUME /home/rhythmbot/data

CMD npm run start:prod

# HEALTHCHECK CMD
