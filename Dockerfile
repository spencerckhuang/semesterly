# Default to Node 22 but still allow overriding via --build-arg in the pipeline
ARG BASE_IMAGE=node:22.18.0-bookworm
FROM $BASE_IMAGE

# Create code dir
RUN mkdir /code
WORKDIR /code

# Ensure Python tooling is present (your previous base image had this preinstalled)
RUN apt-get update && apt-get install -y python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Add everything
ADD . /code/

# Use environment-based config
COPY ./build/local_settings.py /code/semesterly/local_settings.py

# Add parser script
COPY ./build/run_parser.sh /code/run_parser.sh

# Python deps
RUN pip3 install --no-cache-dir -r /code/requirements.txt

# --- Node 22 + Yarn Classic (v1) setup ---
# Node 22 ships Corepack; use it to provision Yarn 1.x
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Install JS deps (npmjs registry + generous timeouts + simple retry; no frozen lockfile)
RUN yarn config set registry https://registry.npmjs.org/ \
 && yarn config set network-timeout 600000 -g \
 && (yarn install --non-interactive || (sleep 5 && yarn install --non-interactive))

# Build frontend assets
RUN yarn build

# To enable unbuffered logging
ENV PYTHONUNBUFFERED=1
