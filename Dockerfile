FROM node:12

# Run update
RUN apt-get update

# Install pygments (for syntax highlighting) 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    python-pygments \
    git \
    ca-certificates \
    asciidoc \
    openjdk-8-jdk

# Install Grunt
RUN npm install -g grunt-cli http-server npm

# Install ruby + scss
RUN gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
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
