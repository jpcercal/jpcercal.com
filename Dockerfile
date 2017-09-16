FROM library/node

# Install Grunt
RUN npm install -g grunt-cli http-server

# Install pygments (for syntax highlighting) 
RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python-pygments git ca-certificates asciidoc \
	&& rm -rf /var/lib/apt/lists/*

# Download and install hugo
ENV HUGO_VERSION 0.27.1
ENV HUGO_BINARY hugo_${HUGO_VERSION}_Linux-64bit.deb

ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY} /tmp/hugo.deb
RUN dpkg -i /tmp/hugo.deb && rm /tmp/hugo.deb

# Create and define working directory
RUN mkdir -p /usr/share/blog/public

WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Define default command.
CMD ["bash"]
