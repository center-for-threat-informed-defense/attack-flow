FROM node:20 AS builder

COPY src/attack_flow_builder /attack_flow_builder
WORKDIR /attack_flow_builder
RUN npm ci
# TODO temporarily disable type checking
RUN npm run build-only

FROM nginx:1.21-alpine
COPY --from=builder /attack_flow_builder/dist /usr/share/nginx/html
