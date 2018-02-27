#!/usr/bin/env bash

# Hostname
HOSTNAME="cercal.dev"

# Setup the host name in your /etc/hosts file
function addhost() {
    HOSTS_LINE="127.0.0.1\t$HOSTNAME"
    if [ ! -n "$(grep $HOSTNAME /etc/hosts)" ]
        then
            echo "Adding $HOSTNAME to your /etc/hosts";
            sudo -- sh -c -e "echo '$HOSTS_LINE' >> /etc/hosts";

            if [ -n "$(grep $HOSTNAME /etc/hosts)" ]
                then
                    echo "$HOSTNAME was added successfully \n $(grep $HOSTNAME /etc/hosts)";
                else
                    echo "Failed to Add $HOSTNAME, Try again!";
            fi
    fi
}

# Get the lastest image from docker repository
function dockerPull() {
    docker pull jpcercal/cercal.io:latest
}

# Generate a SSL certificate in order to enable https
function generateCertificate() {
    if [ ! -f key.pem ] || [ ! -f cert.pem ]
        then
            openssl req \
                -new \
                -newkey rsa:4096 \
                -days 3650 \
                -nodes \
                -x509 \
                -subj "/C=BR/ST=SC/L=Joinville/CN=$HOSTNAME" \
                -keyout key.pem \
                -out cert.pem
    fi
}

# Start the webserver on public directory with https enabled
function startHttpServer() {
    echo
    echo "> Starting HTTP Server: https://cercal.dev/"
    echo
    docker run -ti -p 443:1313 -v $PWD:/usr/share/blog jpcercal/cercal.io:latest http-server -p 1313 /usr/share/blog/public --ssl --cert cert.pem
}

# Execute commands according to this order
addhost
dockerPull
generateCertificate
startHttpServer
