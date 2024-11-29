FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install build tools and languages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    default-jdk \
    nodejs \
    npm \
    gcc \
    g++ \
    ruby \
    golang \
    php \
    rustc \
    clang \
    swift \
    && rm -rf /var/lib/apt/lists/*

ENV DEBIAN_FRONTEND=dialog

# Install additional runtime environments if needed (e.g., pip for Python, npm for JavaScript)
RUN pip3 install --no-cache-dir flask

# Set working directory
WORKDIR /workspace

# Expose necessary ports or volumes if needed
VOLUME /workspace

# Keep the container running to handle exec requests
CMD ["tail", "-f", "/dev/null"]
