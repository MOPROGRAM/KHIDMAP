# KHIDMAP

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Backend Database Setup for Production on Render

This project uses Prisma ORM for database management.

### Switching from Local SQLite to PostgreSQL on Render

1. **Set up a PostgreSQL database on Render:**
   - Create a new PostgreSQL instance on Render.
   - Obtain the database connection URL (e.g., `postgresql://user:password@host:port/dbname`).

2. **Configure environment variables:**
   - In your Render service settings, add an environment variable named `DATABASE_URL` with the PostgreSQL connection URL.

3. **Update Prisma schema:**
   - The Prisma schema is already configured to use `env("DATABASE_URL")` as the datasource URL.

4. **Run Prisma migrations on Render:**
   - After deployment, run the following command in your Render instance to apply migrations:
     ```
     npx prisma migrate deploy
     ```
   - This will create the necessary tables in your PostgreSQL database.

5. **Local development:**
   - For local development, you can set `DATABASE_URL` in a `.env` file or your environment to point to a local or remote PostgreSQL database.

6. **Remove local SQLite database:**
   - The local SQLite database file `dev.db` has been removed to avoid confusion.

---

For more information on Prisma and Render deployment, refer to their official documentation.
