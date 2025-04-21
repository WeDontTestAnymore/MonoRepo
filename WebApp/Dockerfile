# FROM node:18-alpine as build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# ENV VITE_BACKEND_BASE_URL=http://localhost:3000
# RUN npm run build

# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html

# # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port 80
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

############################ configure React Router with Nginx before trying to use it  ############################

FROM oven/bun

WORKDIR /app

COPY package.json .

RUN bun install

COPY . .
EXPOSE 5173 

CMD ["bun","run","dev","--host"]
