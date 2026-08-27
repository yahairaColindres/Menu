FROM node:20-bookworm-slim

# Install MySQL/MariaDB server
RUN apt-get update && apt-get install -y \
    default-mysql-server \
        && rm -rf /var/lib/apt/lists/*

        WORKDIR /app

        # Copy package definitions
        COPY package*.json ./
        COPY frontend/package*.json ./frontend/
        COPY backend/package*.json ./backend/

        # Install dependencies
        RUN npm install
        RUN cd frontend && npm install
        RUN cd backend && npm install

        # Copy application files
        COPY . .

        # Build frontend
        RUN cd frontend && npm run build

        # Configure permissions
        RUN mkdir -p /var/run/mysqld && chown -R mysql:mysql /var/run/mysqld /var/lib/mysql /var/log/mysql

        EXPOSE 7001

        CMD ["bash", "start.sh"]
