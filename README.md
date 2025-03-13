# FlareSense - Smart Contract Security Analysis Platform

FlareSense is an AI-powered smart contract security analysis platform built for the Flare Network. It combines advanced AI capabilities with blockchain analytics to provide comprehensive security assessments of smart contracts.

External IP: 34.169.170.179
GCP instance name: flare-sense

## Features

- 🔍 Real-time smart contract security analysis
- 🤖 AI-powered vulnerability detection using Google's Gemini
- 📊 Risk scoring and assessment
- ⚡ Gas optimization suggestions
- 🔐 Contract monitoring and activity tracking
- 🌐 Integration with Flare Network's FTSO

## Tech Stack

- **Backend**:

  - FastAPI (Python)
  - Google Gemini AI
  - Web3.py
  - Pydantic
  - UV (for running Python)

- **Frontend**:
  - React
  - Material-UI (MUI)
  - Framer Motion
  - React Markdown

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 16.20.0+
- npm 8.19.4+
- UV package manager (`pip install uv`)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required variables
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
WEB3_PROVIDER_URL=https://coston2-api.flare.network/ext/C/rpc
WEB3_EXPLORER_URL=https://coston2-explorer.flare.network/
SIMULATE_ATTESTATION=true
CORS_ORIGINS=["*"]
API_VERSION=v1
CHAIN_ID=114

# Optional variables
TEE_IMAGE_REFERENCE=ghcr.io/jayshreeanand/flare-sense:main
INSTANCE_NAME=flare-sense
```

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/flare-sense.git
cd flare-sense
```

2. Install dependencies:

```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
uv pip install -e .
```

3. Start the backend server:

```bash
uv run start-backend
```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd chat-ui
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Deployment

### Railway Deployment

The project is configured for deployment on Railway.app.

1. Install Railway CLI:

```bash
npm install -g @railway/cli
```

2. Login to Railway:

```bash
railway login
```

3. Link your project:

```bash
railway link
```

4. Deploy:

```bash
railway up
```

### Environment Variables on Railway

Configure the following environment variables in your Railway project settings:

- `GEMINI_API_KEY`
- `WEB3_PROVIDER_URL`
- `WEB3_EXPLORER_URL`
- `CORS_ORIGINS`
- `API_VERSION`
- `CHAIN_ID`

Railway will automatically set the `PORT` variable.

### Docker Support

The project includes Docker support. To build and run using Docker:

```bash
# Build the image
docker build -t flare-sense .

# Run the container
docker run -p 8080:8080 --env-file .env flare-sense
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
