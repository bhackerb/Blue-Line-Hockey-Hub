FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The .env file is ignored via .dockerignore, 
# so '___GEMINI_API_KEY___' placeholder will be baked into the assets
RUN npm run build

FROM nginx:alpine
# Copy custom nginx config to operate on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React/Vite assets
COPY --from=build /app/dist /usr/share/nginx/html

# Write a startup script to perform runtime environment variable injection
# This solves the issue of Google Cloud Run runtime env vars not affecting static React builds
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'if [ -n "$GEMINI_API_KEY" ]; then' >> /start.sh && \
    echo '  echo "Injecting GEMINI_API_KEY into static assets..."' >> /start.sh && \
    echo '  find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s/___GEMINI_API_KEY___/${GEMINI_API_KEY}/g" {} \;' >> /start.sh && \
    echo 'else' >> /start.sh && \
    echo '  echo "Warning: GEMINI_API_KEY is not set."' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
