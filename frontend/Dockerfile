# Bring the base image
FROM node:20-alpine

# RUN mkdir -p /etc/app
WORKDIR /etc/app

# RUN ["apt-get update"]
# COPY package.json /etc/app/

# RUN npm config set registry http://registry.npmjs.org/

# RUN cd ./backend
COPY . /etc/app

RUN npm config set registry http://registry.npmjs.org/
RUN npm install
# RUN npm install mongoose abi-decoder --legacy-peer-deps 


# RUN ["cd ./backend/"]

EXPOSE 5000
CMD ["npm", "start"]