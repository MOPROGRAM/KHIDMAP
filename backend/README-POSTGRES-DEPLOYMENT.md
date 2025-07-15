# PostgreSQL Deployment on Render

This document outlines the steps to configure and deploy the backend with PostgreSQL on Render.

## Environment Variables

Set the following environment variable in your Render service settings:

- `DATABASE_URL`: The connection string for your PostgreSQL database, e.g.:

  ```
  postgresql://username:password@hostname:port/databasename
  ```

## Prisma Setup

The Prisma schema (`backend/prisma/schema.prisma`) is already configured to use PostgreSQL with the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The Prisma client is initialized in `backend/prismaClient.js` as usual:

```js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

## Database Migration

Before starting the backend service, run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate deploy
```

This command applies all pending migrations to the PostgreSQL database.

## Running the Backend

After setting the environment variable and running migrations, start the backend service as usual.

## Notes

- Ensure your PostgreSQL instance is accessible from Render.
- You may use managed PostgreSQL services like Render PostgreSQL, AWS RDS, or others.
- Update your Render service build and start commands if necessary to include migration steps.

---

For more information, see the Prisma documentation on [Deploying to Production](https://www.prisma.io/docs/guides/deployment/deploying-to-production).
