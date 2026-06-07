# Usamos la versión 17 que es la que tienes en pgAdmin
FROM postgres:17-alpine

# Definimos las credenciales básicas
# Nota: "Proyecto-Tesis" tiene un guion, asegúrate de rodearlo con comillas 
# en tus cadenas de conexión de Node.js más adelante.
ENV POSTGRES_DB=Proyecto-Tesis
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=huachimingo

# Si tienes un archivo .sql con la estructura de tu base de datos,
# descomenta la línea de abajo para que se cree automáticamente al iniciar.
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432