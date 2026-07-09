FROM postgres:17-alpine

ENV POSTGRES_DB=Docker-Tesis
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=huachimingo

# Copia el init.sql para que se ejecute al crear la BD por primera vezz
COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432