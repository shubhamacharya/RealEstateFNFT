# Bring the base image
FROM node:20-alpine

RUN mkdir -p /etc/app
WORKDIR /etc/app

# RUN ["apt-get update"]
COPY package.json /etc/app/

# RUN cd ./backend
RUN npm install --legacy-peer-deps
RUN npm install mongoose abi-decoder --legacy-peer-deps 

COPY . /etc/app

# RUN ["cd ./backend/"] 

EXPOSE 3000
CMD ["node", "server.js"]