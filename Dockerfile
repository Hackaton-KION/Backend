FROM node:lts-alpine as build
WORKDIR /app
COPY ./package*.json /app/
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN npm i --ignore-scripts
COPY . /app/
RUN npm run build

FROM node:lts-alpine
WORKDIR  /server
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN apk add  --no-cache ffmpeg
COPY ./package*.json /server/
RUN npm install node-gyp -g
RUN npm install bcrypt -g
RUN npm install bcrypt -save
RUN npm install --ignore-scripts --omit=dev
COPY --from=build  /app/dist ./
RUN chown -Rh node:node /server
EXPOSE 5000
USER node
CMD ["npm", "run", "start"]
