// 📦 external dependencies
import { getProp, filterAllowedItems } from '@robert.tools/utils';
import { URI, ITEMS } from '@robert.tools/typings';

// 📦 internal dependencies
import {
    _locationItem,
    getBaseHeader,
    getCustom,
    getNextUrl,
    getResponse,
    getStatusMessage,
} from './../utils/utils';

// 🧩 types
import type {
    CurlItem,
    HTTP_BASE,
    HTTP,
    HTTP_OPTS,
    RAW,
    STATUS,
} from './../typings.d';

import { getHttpStatusRow } from './../utils/utils';
import { formatResponse } from './../format/format';

// ⚙️ config
import { BASE_FILTERED, KEYS_BASE, KEYS_HEADER } from './../config';
import { FORWARDS } from './../config';
import { MOCK_TIME, PROTOCOL } from './../config';

/**
 * 🎯 get  a sample header of an response string.
 * @param {URI} domain ➡️ The domain to get the header for.
 * @param {ITEMS} opts ➡️ The options object. (optional)
 * @returns {RAW} 📤 The http header.
 */
export const _header = (domain: URI, opts: ITEMS = {}): RAW => {
    const result = getResponse(domain, opts);
    return result;
};

/**
 * 🎯 get full response string
 * @param {HTTP_BASE} base ➡️ The base header information.
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {RAW} 📤 The full http response.
 */
export const _response = (base: HTTP_BASE, opts: HTTP_OPTS = {}): RAW => {
    const domain: URI = base.location as URI; // TODO
    const result = getResponse(domain, { ...opts, ...base });
    return result;
};

/**
 * 🎯 shortcut to get the header part of a CurlItem
 * @param {string} url ➡️ The url to get the item for.
 * @param {HTTP_BASE} alt ➡️ overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {HTTP} 📤 The header part of the curl item.
 */
export const _headerItem = (
    url: URI,
    alt: HTTP_BASE = {},
    opts: HTTP_OPTS = {}
): HTTP => {
    const item: CurlItem = _httpItem(url, alt, opts);
    return item.header;
};

/**
 * 🎯 Get CurlItem from status and alternative options.
 * @param {STATUS} status ➡️ The HTTP status code.
 * @param {any} alt ➡️ The alternative options to override default (optional).
 * @returns {CurlItem} 📤 The mocked CurlItem based on the status and options.
 */
export const _http = (status: STATUS, alt: any = {}): CurlItem => {
    // httpOpts
    const httpOpts: ITEMS = filterAllowedItems(alt, KEYS_HEADER, BASE_FILTERED);
    const baseOpts: ITEMS = filterAllowedItems(alt, KEYS_BASE);
    const success = status > 0 && status < 400;
    const result = {
        header: {
            ...getBaseHeader(status),
            ...httpOpts,
        },
        content: '',
        ...baseOpts,
        success,
        time: expect.any(Number),
        status: `${status}`,
    };
    return result;
};

/**
 * 🎯 Get the header part of a mocked CurlItem based on the status and alternative options.
 * @param {STATUS} status ➡️ The HTTP status code.
 * @param {any} alt ➡️ The alternative options to override default (optional).
 * @returns {HTTP} 📤 The header part of the mocked CurlItem.
 */
export const _head = (status: STATUS, alt: any = {}): HTTP => {
    const http = _http(status, alt);
    return http.header;
};
// TODO: content, statuscode as {alt }, EXTERNAL
/**
 * 🎯 get the httpItem
 * @param {URI} url ➡️ The url to get the item for.
 * @param {HTTP_BASE} alt ➡️ overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {CurlItem} 📤 The http item or full response. // TODO: fix
 */
export const _httpItem = (
    url: URI,
    alt: HTTP_BASE = {},
    opts: HTTP_OPTS = {}
): CurlItem => {
    const urlItem = getNextUrl(url, FORWARDS, opts);
    let statusCode: number = getProp(alt, 'status', urlItem.statusCode);
    const content = getProp(alt, 'content', '');
    const locationPart = _locationItem(urlItem, opts);
    if (statusCode === 301 && urlItem.isLast) {
        statusCode = 200;
    }

    const header: HTTP = {
        ...getBaseHeader(statusCode),
        ...locationPart,
    };
    let item: any = {
        success: statusCode > 0 && statusCode < 400,
        content, // force trim
        time: MOCK_TIME, // mock time
        status: header.status,
    };
    if (opts.noLastLocation && header.hasOwnProperty('lastLocation')) {
        delete header['lastLocation'];
    }
    if (statusCode !== 301 && header.hasOwnProperty('location')) {
        delete header['location'];
    }
    let result = { header, ...item };
    return result;
};

/**
 * 🎯 Get the raw HTTP response string for a given status and alternative options.
 * @param {HTTP_BASE} base ➡️ Overwrite header information. (optional)
 * @param {any} config ➡️ The configuration object. (optional)
 * @returns {RAW} 📤 The raw HTTP response string.
 */
export const _raw = (base: HTTP_BASE = {}, config: ITEMS = {}): RAW => {
    const status = getProp(base, 'status', 0);
    const PROTOCOL_BASE = {
        status,
        statusMessage: getStatusMessage(status),
        ...PROTOCOL,
    };
    const finalItems = { ...getCustom(status, base) };
    // TODO: externalize
    if (!Object.keys(finalItems).some((key) => key.indexOf('HTTP/') !== -1)) {
        const headerKey = getHttpStatusRow(PROTOCOL_BASE);
        if (headerKey) {
            finalItems[headerKey] = undefined;
        }
    }
    return formatResponse(finalItems, base, config);
};
