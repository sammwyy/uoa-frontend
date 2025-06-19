# Unnamed Open Source AI Chat: Web Client

## 🐳 Build with Docker

```bash
# Clone repository
git clone https://github.com/unnamed-open-ai-chat/webclient.git
cd webclient

# Copy .env.example to .env
cp .env.example .env # You need to set the environment variables correctly.

# Build the Docker image
docker build -t uoa-webclient .

# Run the Docker container
docker run --name uoa-webclient -d -p 3000:80 uoa-webclient
```

## 📦 Build from source

```bash
# Clone repository
git clone https://github.com/unnamed-open-ai-chat/webclient.git
cd webclient

# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env # You need to set the environment variables correctly.

# Start as development server
npm run dev

# Or build for production
npm run build
```
