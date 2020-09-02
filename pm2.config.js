module.exports = {
  apps: [{
      name: 'piggen-koa',
      script: 'app.js',
      // instances: 2,
      watch: true,
      ignore_watch: [
        'node_modules',
        'log',
        'dist',
        'mongoData',
        'temp',
        'Dockerfile*',
        'docker*',
        '*.md',
      ],
      // cron_restart: '0 2 * * *', // 每天凌晨两点重启
      // max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      log_file: 'log/pm2.log',
      error_file: 'log/pm2.log',
      // env: {
      //     NODE_ENV: 'development'
      // },
      // env_production: {
      //     NODE_ENV: 'production'
      // }
  }]
};
