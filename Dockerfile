FROM node:26-alpine3.23 AS build

COPY glob-docker /glob
WORKDIR /glob

RUN npm i
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /glob/dist /usr/share/nginx/html
EXPOSE 80
