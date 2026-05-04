# AI-Powered Cybercrime Digital Forensics Platform

Production-grade digital forensics platform with:

- React + Vite frontend
- Express + MongoDB backend
- Flask AI microservice
- Socket.IO real-time alerts
- Blockchain evidence verification
- Audit trails, chain of custody, timeline intelligence, and dark web alerts

## Monorepo

```text
root/
├── client/
├── server/
├── ai-service/
├── render.yaml
└── README.md
```

## Deployment Support

### Supported now

- Full-stack on Render:
  - `client` as a Static Site
  - `server` as a Node Web Service
  - `ai-service` as a Python Private Service
  - MongoDB via MongoDB Atlas
  - Blockchain via Ganache locally or a hosted EVM RPC in production

### Recommended production blockchain mode

- Local development: Ganache
- Hosted deployment: Sepolia, Amoy, or another EVM RPC endpoint

The backend now supports:

- `GANACHE_URL` for local development
- `BLOCKCHAIN_RPC_URL` for hosted deployments
- `BLOCKCHAIN_PRIVATE_KEY` for signing transactions in production

### Vercel support

- `client` can be deployed to Vercel
- `server` and `ai-service` should stay on Render

This architecture is intentional because:

- Vercel Functions are not a good fit for your current long-running Express + Socket.IO API
- The separate Flask microservice is cleaner on Render as a private service
- Evidence uploads need persistent disk support on the backend

## Local Setup

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ../ai-service && pip install -r requirements.txt
```

### 2. Configure environment files

Create `server/.env` from [`server/.env.example`](./server/.env.example)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/forensics-platform
JWT_SECRET=replace-with-secure-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:5001
AI_SERVICE_HOSTPORT=
GANACHE_URL=http://127.0.0.1:7545
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_NETWORK=Ganache
ETH_ACCOUNT=
BLOCKCHAIN_PRIVATE_KEY=
EVIDENCE_CONTRACT_ADDRESS=
EVIDENCE_UPLOAD_DIR=
```

Create `client/.env` from [`client/.env.example`](./client/.env.example)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Optional AI env file from [`ai-service/.env.example`](./ai-service/.env.example)

```env
PORT=5001
FLASK_DEBUG=false
```

### 3. Start local infrastructure

- Start MongoDB or use MongoDB Atlas
- Start Ganache if you want local blockchain verification

### 4. Deploy the evidence contract locally

```bash
cd server
node blockchain/deploy.js
```

Copy the printed contract address into:

```env
EVIDENCE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT
```

If using Ganache, also copy one Ganache account into:

```env
ETH_ACCOUNT=0xYOUR_GANACHE_ACCOUNT
```

### 5. Run services

#### Run everything from root

```bash
npm run dev
```

#### Or run individually

```bash
cd ai-service && python app.py
cd server && npm run dev
cd client && npm run dev
```

### 6. Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- AI service: `http://127.0.0.1:5001`
- Backend health: `http://localhost:5000/api/health`
- AI health: `http://127.0.0.1:5001/health`

## Render Deployment

This repo includes [`render.yaml`](./render.yaml) for a three-service deployment.

### Accounts you need

1. GitHub account
2. Render account
3. MongoDB Atlas account
4. Optional hosted blockchain RPC account:
   - Alchemy
   - Infura
   - QuickNode
   - another EVM RPC provider

### Render architecture

- `forensics-client`: Render Static Site
- `forensics-api`: Render Node Web Service
- `forensics-ai`: Render Python Private Service
- MongoDB: Atlas
- Blockchain: external EVM RPC for production

### Step-by-step Render deployment

#### 1. Push this repo to GitHub

Create a GitHub repository and push the whole monorepo.

#### 2. Create MongoDB Atlas

1. Sign in to MongoDB Atlas
2. Create a project
3. Create a cluster
4. Create a database user
5. Add your IP or allow access from anywhere for initial setup
6. Copy the connection string
7. Replace `<password>` and database name with `forensics-platform`

Use it as:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/forensics-platform?retryWrites=true&w=majority
```

#### 3. Create a blockchain RPC source

For production, do not use local Ganache.

Use one of:

- Sepolia
- Amoy
- another hosted EVM RPC

You need:

- RPC URL
- funded wallet private key
- wallet public address

Set:

```env
BLOCKCHAIN_RPC_URL=https://your-rpc-url
BLOCKCHAIN_NETWORK=Sepolia
BLOCKCHAIN_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETH_ACCOUNT=0xYOUR_PUBLIC_ADDRESS
```

#### 4. Deploy the smart contract to the production RPC

From local machine, temporarily set the production blockchain env values in `server/.env`, then run:

```bash
cd server
node blockchain/deploy.js
```

Copy the deployed address:

```env
EVIDENCE_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

#### 5. Create Render Blueprint

1. Sign in to Render
2. Click `New`
3. Click `Blueprint`
4. Connect your GitHub repo
5. Render detects [`render.yaml`](./render.yaml)
6. Continue with deployment

This creates:

- API service
- AI private service
- frontend static site

#### 6. Set Render environment variables

For `forensics-api`, set:

- `MONGODB_URI`
- `CLIENT_URL`
- `BLOCKCHAIN_RPC_URL`
- `BLOCKCHAIN_NETWORK`
- `BLOCKCHAIN_PRIVATE_KEY`
- `ETH_ACCOUNT`
- `EVIDENCE_CONTRACT_ADDRESS`
- `VITE_API_BASE_URL` on frontend after API URL is known

Notes:

- `AI_SERVICE_HOSTPORT` is wired from the private AI service automatically in `render.yaml`
- `JWT_SECRET` is auto-generated by the blueprint
- uploads are stored on a Render persistent disk via `EVIDENCE_UPLOAD_DIR`

#### 7. Update frontend API URL

Once `forensics-api` is live, set the frontend static site variable:

```env
VITE_API_BASE_URL=https://your-api-name.onrender.com/api
```

Then redeploy the static site.

#### 8. Set backend CORS origin

Set:

```env
CLIENT_URL=https://your-frontend-name.onrender.com
```

Then redeploy the backend.

### Render notes

- The AI service is private, not public
- The backend talks to it over Render private networking
- The backend has a persistent disk for uploaded evidence
- If you remove the disk, uploaded evidence will not survive deploys

## Vercel Frontend Deployment

Deploy only `client` to Vercel.

This repo includes [`client/vercel.json`](./client/vercel.json) so React Router refreshes work correctly.

### Steps

1. Sign in to Vercel
2. Import the GitHub repo
3. Set root directory to `client`
4. Framework preset: `Vite`
5. Set environment variable:

```env
VITE_API_BASE_URL=https://your-api-name.onrender.com/api
```

6. Deploy

Then update Render backend:

```env
CLIENT_URL=https://your-vercel-domain.vercel.app
```

## Recommended Production Topology

- Frontend: Vercel or Render Static Site
- Backend API + Socket.IO: Render Web Service
- AI Service: Render Private Service
- Database: MongoDB Atlas
- Blockchain: Sepolia or Amoy RPC provider
- File uploads: Render Persistent Disk on backend

## Common Problems

### `MongoDB connection failed`

- Verify `MONGODB_URI`
- Confirm Atlas user/password
- Confirm Atlas network access

### `AI service is unavailable`

- On Render, check the `forensics-ai` private service logs
- Confirm backend has `AI_SERVICE_HOSTPORT`

### Blockchain transaction errors

- Verify `BLOCKCHAIN_RPC_URL`
- Verify `BLOCKCHAIN_PRIVATE_KEY`
- Verify `ETH_ACCOUNT`
- Verify wallet has testnet funds
- Verify `EVIDENCE_CONTRACT_ADDRESS`

### Evidence disappears after deploy

- Confirm backend service has a persistent disk attached
- Confirm `EVIDENCE_UPLOAD_DIR` points to the mounted disk path

## Source Links

- Render monorepo support: [render.com/docs/monorepo-support](https://render.com/docs/monorepo-support)
- Render Flask deployment: [render.com/docs/deploy-flask](https://render.com/docs/deploy-flask)
- Render blueprints: [render.com/docs/infrastructure-as-code](https://render.com/docs/infrastructure-as-code)
- Render private network: [render.com/docs/private-network](https://render.com/docs/private-network)
- Render persistent disks: [render.com/docs/disks](https://render.com/docs/disks)
- Vercel WebSocket guidance: [vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections](https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections)
