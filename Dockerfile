# Use Node
FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Setup app working directory
WORKDIR /home/node/app

# Install app dependencies
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY --chown=node:node . .

USER node


# Start api server
CMD ["npm", "start:prod"]