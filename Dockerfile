ARG BASE_IMAGE=jhuopensource/semesterly-base-py3
FROM $BASE_IMAGE
# sgerli/horariotec-base:
RUN mkdir /code
WORKDIR /code

# Just adding basics
# ADD ./requirements.txt /code/
# ADD ./package.json /code/

# Add everything
ADD . /code/


# Nginx moved out
# COPY ./build/semesterly-nginx.conf /etc/nginx/sites-available/
# RUN rm /etc/nginx/sites-enabled/*
# RUN ln -s /etc/nginx/sites-available/semesterly-nginx.conf /etc/nginx/sites-enabled
# RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Use environment based config
COPY ./build/local_settings.py /code/semesterly/local_settings.py

# Add parser script
COPY ./build/run_parser.sh /code/run_parser.sh

RUN pip3 install -r /code/requirements.txt

# Install package.json dependencies (Solution A: npmjs registry + timeouts + retry)
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retries 5 \
 && ( ([ -f package-lock.json ] && npm ci --no-audit --no-fund || npm install --no-audit --no-fund) \
      || (sleep 5 && ([ -f package-lock.json ] && npm ci --no-audit --no-fund || npm install --no-audit --no-fund)) )

RUN npm run build

# To enable unbuffered logging
ENV PYTHONUNBUFFERED=1
