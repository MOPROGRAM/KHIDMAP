# Deployment Guide (Vercel Only)

This guide provides step-by-step instructions for deploying the entire application (frontend, backend API routes, and external database) to Vercel.

## Prerequisites

1.  **GitHub Account**: Your project code should be in a GitHub repository.
2.  **Vercel Account**: For deploying the Next.js application.
3.  **External PostgreSQL Database**: Vercel does not provide managed databases. You will need a PostgreSQL database hosted on a service like [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Render PostgreSQL](https://render.com/docs/databases).
4.  **Cloudinary Account**: For image and video storage, as Vercel's serverless functions are stateless.
5.  **Domain Name (Optional)**: If you want to use a custom domain.

---

## Part 1: Setting up External Services

### 1. PostgreSQL Database
   *   Create a new PostgreSQL database on your chosen provider (e.g., Neon, Supabase, Render).
   *   Obtain the **Connection String (URL)** for your database. This will be used as `DATABASE_URL`.

### 2. Cloudinary for File Storage
   *   Sign up for a [Cloudinary account](https://cloudinary.com/).
   *   From your Cloudinary Dashboard, note down your:
       *   `Cloud Name`
       *   `API Key`
       *   `API Secret`

### 3. Nodemailer Email Configuration (for password reset and email verification)
   *   You will need a Gmail account and an "App Password" if 2FA is enabled.
   *   `EMAIL_USER`: Your Gmail address.
   *   `EMAIL_PASS`: Your Gmail "App Password".

---

## Part 2: Deploying on Vercel

1.  **Create a New Project**:
    *   Log in to your Vercel account.
    *   Click **Add New...** > **Project**.
    *   Connect your GitHub account and select your project repository.

2.  **Configure the Project**:
    *   Vercel will automatically detect that it's a Next.js project.
    *   **Root Directory**: Ensure this is set to the root of your project (where `next.config.ts` is located).

3.  **Add Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add the following variables, using the values obtained in Part 1:
        *   `DATABASE_URL`: Your PostgreSQL database connection string.
        *   `JWT_SECRET`: **Generate a new, strong, random secret key.** (e.g., using `openssl rand -base64 32` or an online generator).
        *   `EMAIL_USER`: Your Gmail address for Nodemailer.
        *   `EMAIL_PASS`: Your Gmail "App Password" for Nodemailer.
        *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
        *   `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
        *   `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.
        *   `FRONTEND_URL`: This will be the URL of your deployed Vercel project (e.g., `https://your-project.vercel.app`). You can leave this blank initially, and Vercel will set it automatically for production deployments, or you can manually update it after the first deployment. For local development, it should be `http://localhost:3000`.

4.  **Deploy**:
    *   Click **Deploy**. Vercel will build and deploy your application, including the Next.js API routes.

---

## Part 3: Post-Deployment Steps

1.  **Run Database Migrations**:
    *   After the first successful deployment on Vercel, you need to run Prisma migrations against your external PostgreSQL database.
    *   Go to your Vercel project dashboard.
    *   Navigate to the "Settings" tab, then "General".
    *   Under "Build & Development Settings", find the "Build Command" and "Install Command".
    *   You can temporarily add a "Build Command" like `npx prisma migrate deploy` or use Vercel's "Serverless Functions" logs to run it.
    *   **Recommended**: Use Vercel's "Deploy Hooks" or a CI/CD pipeline to run migrations automatically after deployment, or connect to your database directly using a local Prisma setup and run `npx prisma migrate deploy --url "YOUR_DATABASE_URL"`.
    *   **Alternatively (for initial setup)**: You can run `npx prisma db push` locally after setting `DATABASE_URL` in your local `.env` to your external database, then deploy. This is simpler for initial setup but `migrate deploy` is preferred for production.

2.  **Verify Frontend URL (if not auto-set)**:
    *   If you left `FRONTEND_URL` blank in step 3 of Part 2, Vercel usually sets it automatically. If not, copy your deployed Vercel project URL and add it as the `FRONTEND_URL` environment variable in Vercel settings. This will trigger a new deployment.

Your application is now live on Vercel!
    *   Log in to your Vercel account.
    *   Click **Add New...** > **Project**.
    *   Connect your GitHub account and select your project repository.

2.  **Configure the Project**:
    *   Vercel will automatically detect that it's a Next.js project and configure the build settings correctly. You usually don't need to change anything here.

3.  **Add Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add the following variable:
        *   **Name**: `NEXT_PUBLIC_API_URL`
        *   **Value**: The URL of your deployed backend on Render (e.g., `https://khidmap-api.onrender.com/api`). You can find this URL on your Render service's dashboard.

4.  **Deploy**:
    *   Click **Deploy**. Vercel will build and deploy your frontend.

---

## Part 4: Final Configuration

1.  **Update Backend with Frontend URL**:
    *   Once your Vercel deployment is live, copy its URL (e.g., `https://your-project.vercel.app`).
    *   Go back to your backend service on Render.
    *   In the "Environment" tab, set the `FRONTEND_URL` variable to your Vercel URL.
    *   This will trigger a new deployment of your backend with the updated environment variable. This is crucial for email verification and password reset links to work correctly.

Your application is now live!