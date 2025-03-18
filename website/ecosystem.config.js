// filepath: /home/Mika/website/xiv-midi/ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'xiv-midi',
        script: 'npm run start',
        exec_mode: 'cluster', 
        instances: 4,
        autorestart: false,
        watch: false,
        env_production: {
          NODE_ENV: 'production',
          PORT: 3000,
        },
      },
    ],
  };