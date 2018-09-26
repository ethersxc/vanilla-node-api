const environtemnts = {}

environtemnts.staging = {
  httpPort: 5000,
  httpsPort: 5500,
  envName: 'staging',
  hashSecret: 'c7sdfy8',
  maxCheks: 5,
};

environtemnts.production = {
  httpPort: 5000,
  httpsPort: 5500,
  envName: 'production',
  hashSecret: 'c4h3fy8',
  maxCheks: 5,
};

const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.nev.NODE_ENV.toLowerCase() : '';

module.exports = typeof(environtemnts[currentEnv]) === 'object' ? environtemnts[currentEnv] : environtemnts['staging']