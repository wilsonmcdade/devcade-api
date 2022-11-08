FROM node:18-bullseye

# Default node app location
WORKDIR /usr/src/app

# Install python dependencies
RUN apt -y update
RUN apt -y install python python3-pip

# Copy the python requirements
COPY pythonScripts/requirements.txt ./
RUN pip install -r requirements.txt

# Copy and install node dependencies
COPY package*.json ./
RUN npm install

# Change cache settings
RUN mkdir ./my_cache; npm config set cache ./my_cache --global; npm --global cache verify

# Create downloads directory
RUN mkdir ./downloads

# Copy the rest of the app
COPY . .

# Permissions
RUN chmod -R 775 .
RUN chown -R node: .

# FIXME: Possibly redundant instructions
#RUN bash setup.sh

# Entrypoint
USER node
EXPOSE 8080
CMD ["npm", "start"]
