FROM public.ecr.aws/docker/library/node:current-alpine

WORKDIR /react-docker/

COPY . .



RUN npm install

RUN npm run build

CMD ["npm", "run", "preview"]

