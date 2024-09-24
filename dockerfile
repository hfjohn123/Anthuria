FROM public.ecr.aws/docker/library/node:current-alpine

WORKDIR /react-docker/

COPY . .

ENV REACT_APP_API_URL=https://polaris-sales-backend.triedgesandbox.com
ENV REACT_APP_TOMTOM_API_KEY=NJj5BsC8yDKN9J9Mm70AsrinHSLvKFWE
ENV REACT_APP_AUTH0_DOMAIN=dev-ucgser2lbx5pc5zf.us.auth0.com
ENV REACT_APP_AUTH0_CLIENT_ID=FjsJq8s4ojstkU9UxRRix9WA45LNYuhD
ENV REACT_APP_AUTH0_AUDIENCE=http://localhost:3005
ENV REACT_APP_BASE_URL=https://polaris-sales-tool.triedgesandbox.com
ENV REACT_APP_LOGOUT_REDIRECT_URL=www.example.com

RUN npm install

RUN npm run build

CMD ["npm", "run", "preview"]

