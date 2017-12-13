# Cercal.IO

## Setup

Considering that you have already installed [Docker](https://www.docker.com/), firstly you will need to build the image:

```shell
docker build -t cercal.io .
```

Generating a certificate:

```shell
openssl req \
    -new \
    -newkey rsa:4096 \
    -days 3650 \
    -nodes \
    -x509 \
    -subj "/C=BR/ST=SC/L=Joinville/CN=cercal.io" \
    -keyout key.pem \
    -out cert.pem
```

Put in you `/etc/hosts` file:

```shell
...
127.0.0.1 cercal.dev
...
```

To be able to run this project on your browser you will must start the http server, to do that you can run this command:

```shell
docker run -ti -p 443:1313 -v $PWD:/usr/share/blog cercal.io http-server -p 1313 /usr/share/blog/public --ssl --cert cert.pem
```

The next step will be access the machine and run this commands to install the dependencies and build the project:

```shell
docker run -ti -v $PWD:/usr/share/blog cercal.io
npm install
npm run napa
grunt
```

Now, just open your browser to see everything running [https://cercal.dev](https://cercal.dev).
