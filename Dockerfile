FROM docker.io/node:18-bullseye

# Default node app location
WORKDIR /usr/src/app

# Copy and install node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Permissions
RUN chmod -R 775 . && \
  chgrp -R node .

# Entrypoint
USER root:node
EXPOSE 8080
CMD ["node", "index.js"]

