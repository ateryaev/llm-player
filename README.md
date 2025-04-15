# LLM-Player

LLM-Player allows you to connect to any LM Studio or Ollama server and chat with your local LLMs — all without sending any data to the LLM-Player server.

## 🌐 Access Your Local LLM from Anywhere

Use your home LLM server from:
- A mobile phone
- Another PC on the same network

Just make sure your device is connected to the same local network where the LLM server is running.

## 🔐 Security Notes for HTTP Access

Since most local LLM servers use HTTP, and LLM-Player is served via HTTPS, some security settings need to be adjusted:

### On Android Chrome:
1. Open `chrome://flags`
2. Find "Insecure origins treated as secure"
3. Add your local LLM server address (e.g., `http://192.168.1.100:11434`)

### On PC Chrome:
1. Open `chrome://settings/security`
2. Temporarily disable "Safe Browsing"

> ⚠️ These changes are only necessary when accessing HTTP LLM servers from HTTPS contexts.
