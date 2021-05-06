#!/usr/bin/env bash

trap shutdown INT
trap shutdown SIGINT SIGTERM

function shutdown() {
  update_unison_pid &>/dev/null
  update_http_server_container_id &>/dev/null

  if [ -n "${UNISON_PID}" ]; then
    echo "> Killing Unison: \"${UNISON_PID}\""
    kill -SIGTERM $UNISON_PID
  fi

  if [ -n "${HTTP_SERVER_CONTAINER_ID}" ]; then
    echo "> Killing HTTP Server: \"${HTTP_SERVER_CONTAINER_ID}\""
    docker kill --signal=SIGTERM $HTTP_SERVER_CONTAINER_ID &>/dev/null
  fi
}

function update_unison_pid() {
  UNISON_PID=$(ps aux | grep "[u]nison " | awk '{print $2}')

  if [ -n "${UNISON_PID}" ]; then
    echo "> UNISON_PID: \"${UNISON_PID}\""
  fi
}

function update_http_server_container_id() {
  HTTP_SERVER_CONTAINER_ID=$(docker ps --filter "expose=1313" --format "{{.ID}}" | egrep "\d+" | awk '{print $1}')

  if [ -n "${HTTP_SERVER_CONTAINER_ID}" ]; then
    echo "> HTTP_SERVER_CONTAINER_ID: \"${HTTP_SERVER_CONTAINER_ID}\""
  fi
}

function add_hostname() {
  HOSTS_LINE="127.0.0.1\t${HOSTNAME}"
  if [ ! -n "$(grep ${HOSTNAME} /etc/hosts)" ]; then
    echo "> Adding ${HOSTNAME} to your /etc/hosts"
    sudo -- sh -c -e "echo '${HOSTS_LINE}' >> /etc/hosts"

    if [ -n "$(grep ${HOSTNAME} /etc/hosts)" ]; then
      echo "> ${HOSTNAME} was added successfully \n $(grep ${HOSTNAME} /etc/hosts)"
    else
      echo "[!] Failed to Add ${HOSTNAME}, Try again!"
    fi
  fi
}

function generate_certificate() {
  if [ ! -f key.pem ] || [ ! -f cert.pem ]; then
    openssl req \
      -new \
      -newkey rsa:4096 \
      -days 3650 \
      -nodes \
      -x509 \
      -subj "/C=BR/ST=SC/L=Joinville/CN=${HOSTNAME}" \
      -keyout key.pem \
      -out cert.pem
  fi
}

function run_unison_cmd() {
  CMD="${UNISON_BIN} ${UNISON_OPTIONS} \"${USISON_POSTS_RELATIVE_PATH}\" \"${UNISON_POSTS_TARGET_ABS_PATH}\""

  if [ "${ENABLE_IAWRITER_ICLOUD_SYNC}" = "1" ] && [ -z "${UNISON_PID}" ]; then
    echo
    echo "> Starting Unison and setting bidirectional synchronization between \"${USISON_POSTS_RELATIVE_PATH}\" and \"${UNISON_POSTS_TARGET_ABS_PATH}\"."
    /bin/bash -l -c "${CMD}" &>/dev/null &

    update_unison_pid

    if [ -z "${UNISON_PID}" ]; then
      echo "> Unison is NOT running."
      exit 1
    fi
  elif [ -z "${UNISON_PID}" ]; then
    echo "[!] File ${PWD}/.env was not found."
  fi
}

function run_http_server_cmd() {
  CMD="http-server -p 1313 /usr/share/blog/public --ssl --cert cert.pem"

  if [ -z "${HTTP_SERVER_CONTAINER_ID}" ]; then
    add_hostname
    generate_certificate

    echo
    echo "> Starting HTTP Server on \"https://${HOSTNAME}/\"."
    docker run -d -p 443:1313 -v $PWD:/usr/share/blog jpcercal/jpcercal.com:latest /bin/bash -l -c "${CMD}" &>/dev/null

    update_http_server_container_id
    echo

    if [ -z "${HTTP_SERVER_CONTAINER_ID}" ]; then
      echo "> HTTP Server is NOT running."
      exit 1
    fi
  fi
}

function run_compilation_cmd() {
  CMD="npm install && npm run napa && BASE_URL=https://${HOSTNAME}/ grunt"

  docker run -a stdin -a stdout -it --volume $PWD:/usr/share/blog jpcercal/jpcercal.com:latest /bin/bash -l -c "${CMD}"
}

function run_compilation_watcher_cmd() {
  CMD="BASE_URL=https://${HOSTNAME}/ grunt watch"

  echo "> Starting file watcher"
  docker run -a stdin -a stdout -it --volume $PWD:/usr/share/blog jpcercal/jpcercal.com:latest /bin/bash -l -c "${CMD}"
}

function show_http_server_banner() {
  cat << EOF
[i] Great! The compilation was completed successfully.

> You can now access "https://${HOSTNAME}/".

EOF
}

PWD=$(pwd)

echo "> Loading the environment variable from ${PWD}/.env"
source "${PWD}/.env"

update_unison_pid
update_http_server_container_id
run_unison_cmd
run_http_server_cmd
run_compilation_cmd
show_http_server_banner
run_compilation_watcher_cmd

# Before terminating the execution it shutdown the script gracefully
shutdown
