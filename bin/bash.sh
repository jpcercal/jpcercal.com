#!/usr/bin/env bash

# Get latest image from docker repository
docker pull jpcercal/cercal.io:latest

# Run the bash in interactive mode

# This command will run the compilation process for the first time
# using as default the development mode.
# 
# After this, you will be enable to run the command that you want 
# inside of this container.
# 
# Basically what you need after that will be:
# 
# grunt
# or...
# grunt production (for production builds)
docker run -it -v $PWD:/usr/share/blog jpcercal/cercal.io:latest /bin/bash -l -c "npm install && npm run napa && export BASE_URL=https://cercal.local/ && grunt && /bin/bash -l"
