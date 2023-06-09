FROM nginx:stable-alpine

# create nginx folders
RUN mkdir -p /usr/share/nginx/html/assets
RUN mkdir -p /usr/share/nginx/html/scripts
RUN mkdir -p /usr/share/nginx/html/styles

# copy files to nginx folder
COPY ./index.html /usr/share/nginx/html
COPY ./assets /usr/share/nginx/html/assets
COPY ./scripts /usr/share/nginx/html/scripts
COPY ./styles /usr/share/nginx/html/styles
