FROM node:22.11.0

ARG NPM_TOKEN
ARG SERVER_API_KEY
ARG VERTEX_URL
ARG JWT_SECRET_KEY
ARG RP_ID
ARG RP_NAME
ARG ORIGIN
ARG DATABASE_URL="file:./dev.db"
ARG ETH_NET_URL
ARG NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET
ARG NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI

# Set the working directory inside the container
ADD . /wallet-demo
WORKDIR /wallet-demo

#remove db
RUN rm -f prisma/dev.db

# Replace the .env with the build args
RUN rm -f .env

ENV DATABASE_URL=${DATABASE_URL} \
    NPM_TOKEN=${NPM_TOKEN} \
    SERVER_API_KEY=${SERVER_API_KEY} \
    VERTEX_URL=${VERTEX_URL} \
    JWT_SECRET_KEY=${JWT_SECRET_KEY} \
    RP_ID=${RP_ID} \
    RP_NAME=${RP_NAME} \
    ORIGIN=${ORIGIN} \
    ETH_NET_URL=${ETH_NET_URL} \
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID} \
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET=${NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET} \
    NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI=${NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI}


RUN rm -rf node_modules
RUN rm -rf .next




RUN npm i

RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application, uses npm run start and generate db
CMD ["npm", "run", "docker::start"]

