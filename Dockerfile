FROM node:20-bookworm

# Create code dir
RUN mkdir /code
WORKDIR /code

# Install Python dependencies
RUN apt-get update && apt-get install -y python3-pip python3-venv && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Add everything
ADD . /code/

# Create and activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install dependencies in the virtual environment
RUN pip install --no-cache-dir -r /code/requirements.txt

# Use environment based config
COPY ./build/local_settings.py /code/semesterly/local_settings.py

# Add parser script
COPY ./build/run_parser.sh /code/run_parser.sh

# Install package.json dependencies (Solution A: npmjs registry + timeout + retry)
RUN yarn config set registry https://registry.npmjs.org/ \
 && yarn config set network-timeout 600000 -g \
 && (yarn install --non-interactive || (sleep 5 && yarn install --non-interactive))

# If you intentionally add sass during build (kept as-is)
RUN yarn add sass --force

# Build frontend assets
RUN yarn build

# To enable unbuffered logging
ENV PYTHONUNBUFFERED=1
