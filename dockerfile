FROM node:21-alpine

WORKDIR /react-docker/

COPY . .


RUN npm install


CMD ["npm", "run", "dev"]

