// PM2 ecosystem config for TaskFlow MCP HTTP server
module.exports = {
  apps: [
    {
      name: "taskflow",
      script: "./server/server-http.js",
      cwd: "/var/www/taskflow-mcp",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      ignore_watch: ["node_modules", "data"],
      error_file: "logs/taskflow-error.log",
      out_file: "logs/taskflow-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
