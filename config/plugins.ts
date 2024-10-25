module.exports = {
    'strapi-neon-tech-db-branches': {
      enabled: true,
      config: {
        neonApiKey: "mf9qk5din207k3u8rpwjvqg4w2tz8zimhpkshysst8rlx6s0nz7r6kcoro8v8090", // get it from here: https://console.neon.tech/app/settings/api-keys
        neonProjectName: "ecomerse", // the neon project under wich your DB runs
        neonRole: "db-migration_owner", // create it manually under roles for your project first
        gitBranch: "main",
        //(gitBranch: "main") // branch can be pinned via this config option. Will not use branch from git then. Usefull for preview/production deployment
      }
    },
  }