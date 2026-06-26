FROM node:26-alpine3.23

COPY glob-docker glob/
WORKDIR /glob

RUN npm i
# ENV PATH="/venv/bin:$PATH"
RUN npm run build
CMD ["npm", "start"]
