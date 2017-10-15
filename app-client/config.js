const env = process.env;

export const GRAPHQL_HTTPS = env.GRAPHQL_HTTPS || false;
export const GRAPHQL_DOMAIN = env.GRAPHQL_DOMAIN || 'localhost';
export const GRAPHQL_PORT = env.GRAPHQL_PORT || 8181;
export const GRAPHQL_PATH = env.GRAPHQL_PATH || '/graphql';

export const GRAPHQL_HTTP_PATH = (GRAPHQL_HTTPS?'https':'http')+'://'+GRAPHQL_DOMAIN+':'+GRAPHQL_PORT+GRAPHQL_PATH;
export const GRAPHQL_WS_PATH = (GRAPHQL_HTTPS?'https':'http')+'://'+GRAPHQL_DOMAIN+':'+GRAPHQL_PORT;
