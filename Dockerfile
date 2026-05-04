FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libgl1 \
    libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY ai-service/requirements.txt ./ai-service/

RUN cd client && npm install
RUN cd server && npm install
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
RUN pip install --no-cache-dir -r ai-service/requirements.txt

COPY . .

RUN cd client && npm run build
RUN mkdir -p /app/server/uploads

EXPOSE 10000

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
