FROM public.ecr.aws/docker/library/node:current-alpine

WORKDIR /react-docker/

COPY . .



RUN npm install

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "80"]

