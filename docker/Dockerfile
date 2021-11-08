FROM node

COPY backend /usr/local/backend/
WORKDIR /usr/local/backend
RUN npm install
CMD ["/bin/bash", "entrypoint.sh"]
