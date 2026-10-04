// 🧩 types
import { ITEMS, URI } from '@robert.tools/typings';
import type { MOCK_CONFIG, STATUS } from './typings.d';

// ⚓ CONSTANTS
// end-of-line characters
export const CRLF = '\r\n';
export const LF = '\n';

// mock domains
const DOMAIN_500 = 'domain-500.de';
export const DOMAIN_200 = 'domain-200.de';
export const DOMAIN_301 = 'domain-301.de';
export const DOMAIN_404 = 'domain-404.de';
export const DOMAIN_UNKNOWN = 'domain-unknown.de';
export const DOMAIN_STATUS_0 = 'domain-status-0.de';
export const SVG_GITHUB = 'https://api.github.com/icons/icon.svg';
export const NO_HOST = 'no-host-found';

// keys
export const KEYS_HEADER = [
    'contentLength',
    'status',
    'location',
    'lastLocation',
    'ext',
    'etag',
    'lastModified',
];
export const KEYS_BASE = ['content', 'status', 'success', 'time'];
export const BASE_FILTERED = ['ext', 'content'];
export const PROTOCOL_OPTIONS = [
    'protocol',
    'protocolVersion',
    'status',
    'statusMessage',
];

// status messages for HTTP codes
export const STATUS_MESSAGE: ITEMS = {
    200: 'OK',
    301: 'Moved Permanently',
    302: 'Found',
    404: 'Not Found',
    500: 'Internal Server Error',
};

const DEFAULT_DATE = 'Mon, 18 Mar 1970 08:34:52 GMT';
const connection = 'keep-alive';
const date = DEFAULT_DATE;
const xFrameOptions = 'SAMEORIGIN';
const acceptRanges = 'bytes';

const server = 'nginx/1.14.1';
const contentType = 'text/html; charset=UTF-8';
const protocol = 'http';
const protocolVersion = '1.1';

export const MOCK_TIME = 23;
export const etag = '"65f7fcac-12cb4"';
export const lastModified = 'Mon, 18 Mar 2024 08:34:52 GMT';
export const contentLength = '7698';
export const PROTOCOL = { protocol, protocolVersion };

export const _BASE = { contentType, connection, server, date };
export const _EXT = { acceptRanges, xFrameOptions }; // ex: strictTransportSecurity, referrerPolicy
export const _BASE_X = { ..._BASE, ..._EXT };

// mocks
const createOrder = (domain: string) => [
    `${domain}`,
    `www.${domain}`,
    `http://${domain}`,
    `https://${domain}`,
    `https://www.${domain}`,
    `https://www.${domain}/`,
];
export const createForwards = (domain: URI, status: STATUS) => {
    return { status, order: createOrder(domain) };
};

const location = `https://www.${DOMAIN_301}/`;
export const custom: { [key: number]: any } = {
    0: { contentLength: '0' },
    200: { contentLength, lastModified, etag, ..._EXT },
    301: { contentLength: '185', ..._EXT, location },
    404: { contentLength: '1500' },
    500: { contentLength: '0' },
};

export const FORWARDS: MOCK_CONFIG = {
    [DOMAIN_200]: createForwards(DOMAIN_200, 200),
    [DOMAIN_301]: createForwards(DOMAIN_301, 301),
    [DOMAIN_404]: createForwards(DOMAIN_404, 404),
    [DOMAIN_500]: createForwards(DOMAIN_500, 500),
    [DOMAIN_STATUS_0]: { status: 0, order: [`${DOMAIN_STATUS_0}`] },
    [DOMAIN_UNKNOWN]: { status: 0, order: [`${DOMAIN_UNKNOWN}`] },
};

export const HTTP_UNKNOWN_HOST = `curl: (6) Could not resolve host:`;
