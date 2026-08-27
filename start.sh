#!/bin/bash

# Configure MySQL runtime directory
mkdir -p /var/run/mysqld /var/lib/mysql /var/log/mysql
chown -R mysql:mysql /var/run/mysqld /var/lib/mysql /var/log/mysql

# Start MySQL daemon
echo "Starting MySQL..."
mysqld_safe --skip-grant-tables --user=mysql &

# Wait for MySQL to start
until mysqladmin ping >/dev/null 2>&1; do
    echo "Waiting for MySQL to start..."
        sleep 1
        done

        echo "MySQL is up. Initializing database..."
        # Initialize the database structure and initial data
        mysql -u root < /app/backend/database_dump.sql

        echo "Database initialized. Running seeds..."
        cd /app/backend
        node seed_ingredients.js || true
        node seed_recipes.js || true
        node seed_baby_menu.js || true

        echo "Starting Node.js backend..."
        npm start
