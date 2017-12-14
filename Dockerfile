FROM node:9.2

# Install Grunt
RUN npm install -g grunt-cli http-server

# Run update
RUN apt-get update

# Install pygments (for syntax highlighting) 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    python-pygments \
    git \
    ca-certificates \
    asciidoc \
	&& rm -rf /var/lib/apt/lists/*

# Install ruby + scss
ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

RUN curl -sSL https://rvm.io/mpapis.asc | gpg --import -
RUN curl -L https://get.rvm.io | bash -s stable
RUN echo 'source /etc/profile.d/rvm.sh' >> /etc/profile
RUN /bin/bash -l -c "rvm install ruby --latest"
RUN /bin/bash -l -c "gem install sass"

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
CMD ["/bin/bash", "-l"]
