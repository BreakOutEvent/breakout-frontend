var config;


if (process.env.NODE_ENVIRONMENT && process.env.NODE_ENVIRONMENT == "dev") {
  config = requireLocal('config-dev.json');
}

if (process.env.NODE_ENVIRONMENT && process.env.NODE_ENVIRONMENT == "prod") {
  config = requireLocal('config-prod.json');
}


if (!config) {
  throw Error("no NODE_ENVIRONMENT configured, available: dev, prod");
}

module.exports = config;

