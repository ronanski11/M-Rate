# Use the official MongoDB image as a base
FROM mongo:latest

# Copy the dump folder and restore script into the container
COPY allzinator-db/dump /dump
COPY allzinator-db/restore-db.sh /docker-entrypoint-initdb.d/restore-db.sh

# Make the restore script executable
RUN chmod +x /docker-entrypoint-initdb.d/restore-db.sh

# No need to modify the entrypoint, as MongoDB's image
# executes scripts in docker-entrypoint-initdb.d on startup