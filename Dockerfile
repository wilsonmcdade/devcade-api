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

# Copy the rest of the app
COPY . .

# FIXME: Possibly redundant instructions
#RUN bash setup.sh

# Entrypoint
EXPOSE 8080
CMD ["npm", "start"]
