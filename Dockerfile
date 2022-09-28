FROM node:16 AS builder

COPY src/attack_flow_builder /attack_flow_builder
WORKDIR /attack_flow_builder
RUN npm ci
RUN npm run build

FROM nginx:1.21-alpine
COPY --from=builder /attack_flow_builder/dist /usr/share/nginx/html
