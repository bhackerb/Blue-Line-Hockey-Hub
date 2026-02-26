FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy custom nginx config to operate on Cloud Run's port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React/Vite assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
