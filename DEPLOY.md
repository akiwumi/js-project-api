# Render Deployment Instructions

This project is configured to deploy the **backend** directory to Render.

## Option 1: Using render.yaml (Blueprint)

1.  Connect your repository to Render.
2.  Select **Blueprints** when creating a new service.
3.  Render will automatically detect `render.yaml` and configure the service as follows:
    -   **Root Directory**: `backend`
    -   **Build Command**: `yarn install`
    -   **Start Command**: `yarn start`
    -   **Environment Variables**:
        -   `PORT`: `3001`
        -   `NODE_ENV`: `production`
        -   `MONGODB_URI`: (You must provide this value in the Render dashboard)
        -   `JWT_SECRET`: (You must provide this value in the Render dashboard)

## Option 2: Manual Configuration

If you prefer to configure the service manually (Web Service):

1.  **Create a New Web Service** on Render.
2.  Connect your repository.
3.  Start with the following settings:
    -   **Name**: `mern-chat-backend` (or your preferred name)
    -   **Region**: (Select your closest region)
    -   **Branch**: `main` (or your default branch)
    -   **Root Directory**: `backend` (CRITICAL STEP)
    -   **Runtime**: `Node`
    -   **Build Command**: `yarn install`
    -   **Start Command**: `yarn start`
4.  **Environment Variables**:
    Add the following variables in the "Environment" tab:
    -   `PORT`: `3001`
    -   `MONGODB_URI`: `your-mongodb-uri`
    -   `JWT_SECRET`: `your-secret`
    -   `NODE_ENV`: `production`
