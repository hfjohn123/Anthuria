FROM node:21-alpine

WORKDIR /react-docker/

COPY . .

RUN npm install

RUN npm run build

CMD ["npm", "run", "preview"]

