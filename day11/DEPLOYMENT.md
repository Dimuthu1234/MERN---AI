# TaskFlow MCP — Deployment Guide

This guide covers deploying TaskFlow to your VPS at `taskflow.academydsj.com`.

## Architecture

- **HTTP Server**: `server/server-http.js` — Express server on port 3000
- **Process Manager**: PM2 (ecosystem.config.js)
- **Web Server**: Nginx reverse proxy with SSL (nginx-taskflow.conf)
- **Data**: Persistent JSON file at `data/tasks.json`

## Pre-Deployment

Ensure you have:
1. A VPS with Node.js 18+ installed
2. Nginx installed and running
3. PM2 installed globally (`npm install -g pm2`)
4. Certbot installed for SSL (`apt-get install certbot python3-certbot-nginx`)
5. Domain `taskflow.academydsj.com` DNS pointing to your VPS

## Deployment Steps

### 1. Clone the project to your VPS

```bash
cd /var/www
git clone <your-repo> taskflow-mcp
cd taskflow-mcp
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Set up directories

```bash
mkdir -p /var/www/taskflow-mcp/data
mkdir -p /var/www/taskflow-mcp/logs
chmod 755 /var/www/taskflow-mcp/data
```

### 4. Start the HTTP server with PM2

```bash
cd /var/www/taskflow-mcp
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Verify it's running:
```bash
pm2 logs taskflow
curl http://localhost:3000/health
```

### 5. Configure Nginx

```bash
# Copy the config
sudo cp /var/www/taskflow-mcp/nginx-taskflow.conf /etc/nginx/sites-available/taskflow.academydsj.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/taskflow.academydsj.com /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. Set up SSL with Certbot

```bash
sudo certbot certonly --nginx -d taskflow.academydsj.com
```

This will automatically update the Nginx config with the SSL certificate paths.

### 7. Verify the deployment

```bash
# Test the API
curl https://taskflow.academydsj.com/health

# Add a task
curl -X POST https://taskflow.academydsj.com/api/tools/add_task \
  -H "Content-Type: application/json" \
  -d '{"title":"Test from deployment","priority":"high"}'

# List tools
curl https://taskflow.academydsj.com/api/tools/list
```

## Using TaskFlow with Claude

### Claude Desktop
Add to `~/.config/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "curl",
      "args": ["https://taskflow.academydsj.com/api/tools/add_task"],
      "type": "http",
      "url": "https://taskflow.academydsj.com"
    }
  }
}
```

Or configure as an HTTP MCP server if your Claude version supports it.

### ChatGPT
ChatGPT can call the HTTP endpoints directly via OpenAPI schema or custom integration.

### Claude Web / Apps
Use the HTTP endpoints directly in your applications.

## API Endpoints

### Tools
- `POST /api/tools/add_task` — Add a task
- `POST /api/tools/list_tasks` — List tasks
- `POST /api/tools/complete_task` — Complete a task
- `POST /api/tools/update_task` — Update a task
- `POST /api/tools/delete_task` — Delete a task
- `POST /api/tools/search_tasks` — Search tasks

### Resources
- `GET /api/resources/tasks-all` — Get all tasks as JSON

### Prompts
- `GET /api/prompts/daily_standup` — Get the daily standup template

### Health
- `GET /health` — Health check

## Monitoring

```bash
# View logs
pm2 logs taskflow

# Monitor process
pm2 monit

# Restart if needed
pm2 restart taskflow
```

## Troubleshooting

**Port already in use**: Change PORT in ecosystem.config.js

**SSL certificate issues**: Verify with `sudo certbot certificates` and renew if needed

**Permission denied on data/**: Ensure the directory is writable by the user running PM2

**Tasks not persisting**: Check that `data/tasks.json` has write permissions

## Updates

To update after pushing new code:
```bash
cd /var/www/taskflow-mcp
git pull
npm install (if package.json changed)
pm2 restart taskflow
```
