FROM node:16 AS builder

COPY src/attack_flow_designer /attack_flow_designer
WORKDIR /attack_flow_designer
RUN npm ci
RUN npm run build

FROM nginx:1.21-alpine
COPY --from=builder /attack_flow_designer/dist /usr/share/nginx/html
