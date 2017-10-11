import dotenv from 'dotenv';
dotenv.config();

require('app-title')();

export const APP_NAME = process.title;

const env = process.env;


export const DEV = env.NODE_ENV == 'development';
export const PROD = env.NODE_ENV == 'production';

export const SERVER_PORT = env.SERVER_PORT || 4000;

export const HTTPS = env.HTTPS || false;
export const DOMAIN = env.DOMAIN || 'localhost';
export const HREF_PORT = env.HREF_PORT || SERVER_PORT;
export const HREF_PORT_DEFAULT = HTTPS&&HREF_PORT==443||!HTTPS&&HREF_PORT==80;
export const PROTOCOL = HTTPS?'https://':'http://';
export const BASE_HREF = PROTOCOL+DOMAIN+(HREF_PORT_DEFAULT?'':':'+HREF_PORT);
