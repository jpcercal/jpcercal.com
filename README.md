# Cercal.IO

You must have docker installed in your machine in order to run this application locally.

## Setup

Add to your `/etc/hosts` file:

```shell
127.0.0.1 cercal.local
```

## Running the webserver

```shell
./bin/http-server.sh
```

## Bash

```shell
# This command will do the compilation for the first time.
# After that, you will gain access to the container.
./bin/bash.sh

# then, to do a build in development mode you can run this command:
grunt

# Or, if you want to do a build in production mode:
grunt production
```

Now, just open your browser to see everything running [https://cercal.local](https://cercal.local).
