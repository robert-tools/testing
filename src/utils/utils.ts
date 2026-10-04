// 📦 external dependencies
import { LOG } from '@robert.tools/log';
import { ITEMS, ITEMS_LIST, NUM } from '@robert.tools/typings';
import { convert2HeaderCase } from '@robert.tools/convert';
import { getHostname, getUrlID } from '@robert.tools/uri';
import { getCurlData, hasTimeout } from '@robert.tools/curl';
import { getProp, sortASC, toType } from '@robert.tools/utils';

// 📦 internal dependencies
import { _httpItem, _raw } from './../mock/mock';
import { formatResponse, getResponseFromItem } from '../format/format';

// 🧩 types
import type {
    EOL,
    FORWARD_MOCKS,
    HTTP_BASE,
    HTTP,
    HTTP_OPTS,
    PROTOCOL_STATUS,
    RAW,
    URL_ITEMS,
    MOCK_CONFIG,
    LOCATION,
    URI_ITEM,
} from '../typings.d';

// ⚙️ config
import { _BASE, _EXT, PROTOCOL, PROTOCOL_OPTIONS } from '../config';
import { custom, CRLF, LF, STATUS_MESSAGE } from '../config';

/**
 * 🎯 Mocks a request based on the provided mocked results.
 * @param {string} request ➡️ The request string, typically a curl command.
 * @param {URL_ITEMS} results ➡️ object containing mocked results.
 * @returns {RAW} 📤 mocked result for the given request.
 */
export const mockRequest = (request: string, results: URL_ITEMS): RAW => {
    const forwards = results?.forwards || {};
    const urlID = getUrlID(request);
    const domainID = getHostname(urlID);
    const orders = results?.orders || {};
    const order = orders?.[domainID] || [];
    const data = getCurlData(request);
    let ID = urlID;
    if (data.data?.forwarding) {
        const lastOrder = order[order.length - 1];
        if (lastOrder && forwards[lastOrder]) {
            ID = lastOrder;
        }
    }
    const result: RAW = forwards?.[ID];
    if (!result) {
        LOG.FAIL(`No mock result for URL ID: ${ID}`);
        return forwards?.['fallback'] || '<invalid>';
    }
    return <RAW>toType(result);
};
/**
 * 🎯 get  a sample header of an response string.
 * @param {string} domain ➡️ The domain to get the header for.
 * @param {ITEMS} opts ➡️ The options object. (optional)
 * @returns {RAW} 📤 The http header.
 */
export const getResponse = (domain: string, opts: ITEMS = {}): RAW => {
    const eol = getProp(opts, 'eol', 'CRLF');
    const alt = { ...opts };
    if (hasTimeout(opts?.request)) {
        alt.status = 0;
    }
    const item = _httpItem(domain, alt, opts);
    return <RAW>toType(getResponseFromItem(item, eol));
};
/**
 * 🎯 set the protocol status object
 * @param {number} code ➡️ The status code to set.
 * @returns {PROTOCOL_STATUS} 📤 The protocol status object.
 */
export const setProtocolStatus = (code: number): PROTOCOL_STATUS => {
    const statusMessage: string = getStatusMessage(code);
    const status: NUM = `${code}` as NUM;
    let result: PROTOCOL_STATUS = {
        ...PROTOCOL,
        status,
        statusMessage,
    };
    return result;
};

/**
 * 🎯 get next url in the forwarding order
 * @param {string} url ➡️ The current url.
 * @param {FORWARDS} forwards ➡️ The forwarding items configuration.
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @return {URI_ITEM} 📤 next url item
 */
export const getNextUrl = (
    url: string,
    forwards: MOCK_CONFIG,
    opts: HTTP_OPTS = {}
): URI_ITEM => {
    const isForwarded = getProp(opts, 'forwarding', false);
    const urlID = getHostname(url);
    const item = forwards[urlID];
    let statusCode: number = item ? getProp(item, 'status', 0) : 0;
    const order = item && item.order ? item.order : [];
    const max = order.length - 1;
    const index = isForwarded ? max : order.indexOf(url);
    const indexMax = order.length - 1;
    // no order: always last
    const isLast = order.length > 0 ? index >= 0 && index === indexMax : true;
    const lastLocation = url;
    if (index > -1) {
        if (index === indexMax) {
            const nextUrl = order[index];
            // last item
            return { url: nextUrl, statusCode, isLast, lastLocation };
        } else {
            const nextIndex = index + 1;
            const nextUrl = order[nextIndex];
            if (nextUrl) {
                return { url: nextUrl, statusCode: 301, isLast, lastLocation };
            }
        }
    }
    return { url, statusCode, isLast, lastLocation };
};
/**
 * 🎯 enhancing locationItem with necessary forwarding properties
 * @param {URI_ITEM} urlItem ➡️ The URL item containing status and location information.
 * @param {HTTP_OPTS} opts ➡️ The options object.
 * @returns {LOCATION} 📤 The enhanced location item with forwarding properties.
 */
export const _locationItem = (urlItem: URI_ITEM, opts: HTTP_OPTS): LOCATION => {
    const status = urlItem.statusCode;
    const locationitem: LOCATION = {};
    const location = urlItem.url;
    const isLast = urlItem.isLast;
    const url = urlItem.lastLocation;
    let isForwarded = false;
    if (status === 301) {
        if (isLast === true) {
            isForwarded = true;
        } else if (location !== url) {
            locationitem['location'] = location;
        }
    }
    if (opts.forwarding || location !== url) {
        isForwarded = true;
    }
    if (isForwarded) {
        locationitem['lastLocation'] = url;
    }
    return locationitem;
};

/**
 * 🎯 Get the base HTTP header for a given status code.
 * @param {number} statusCode ➡️ The HTTP status code.
 * @returns {HTTP} 📤 The base HTTP header.
 */
export const getBaseHeader = (statusCode: number) => {
    const defaultItem = { contentLength: '0' };
    const customPart: any = custom[statusCode] || defaultItem;
    const statusItem = setProtocolStatus(statusCode);
    const success = statusCode > 0 && statusCode < 400;
    const header: HTTP = {
        ..._BASE,
        ...customPart,
        ...statusItem,
        ...(success ? _EXT : {}),
        // ...locationPart,
    };
    return header;
};

/**
 * 🎯 Get the HTTP status row for a given protocol status item.
 * @param {PROTOCOL_STATUS} item ➡️ The protocol status item.
 * @param {EOL} eol ➡️ The end-of-line character sequence. (optional)
 * @returns {string} 📤 The formatted HTTP status row.
 */
export const getHttpStatusRow = (item: PROTOCOL_STATUS, eol?: EOL): string => {
    if (!item) {
        LOG.WARN('getHttpStatusRow: item is undefined or null');
        return '';
    }
    if (!item.protocol) {
        LOG.WARN('getHttpStatusRow: protocol is missing in the item');
        return '';
    }

    const eolStr = eol ? (eol === 'CRLF' ? CRLF : LF) : '';
    const status = item.status;
    const statusMessage = getStatusMessage(status);
    const protocol = item.protocol.toUpperCase();
    const protocolVersion = item.protocolVersion;
    return `${protocol}/${protocolVersion} ${status} ${statusMessage}${eolStr}`;
};
/**
 * 🎯 Get the custom HTTP header for a given status code, with optional overrides.
 * @param {number} statusCode ➡️ The HTTP status code.
 * @param {HTTP_BASE} alt ➡️ Optional overrides for the custom header.
 * @returns {HTTP} 📤 The resulting custom HTTP header.
 */
export const getCustom = (statusCode: number, alt: HTTP_BASE) => {
    const result = {
        ..._BASE,
        ...(custom[statusCode] || { contentLength: '0' }),
    };
    if (alt.location && alt.location !== result.location) {
        result.location = alt.location;
    }
    return result;
};

/**
 * 🎯 Get the status message for a given HTTP status code.
 * @param {number} status ➡️ The HTTP status code.
 * @returns {string} 📤 The corresponding status message, or 'unknown' if not found.
 */
export const getStatusMessage = (status: number): string => {
    return STATUS_MESSAGE[status] || 'unknown';
};

/**
 * 🎯 Get mocked URLs for a given set of forward items.
 * @param {MOCK_CONFIG} ITEMS ➡️ The set of forward items.
 * @param {string} _content ➡️ The default content to use for the mocked URLs.
 * @returns {URL_ITEMS} 📤 The resulting mocked URLs and their orders.
 */
export const getMockedURLs = (ITEMS: MOCK_CONFIG, _content = ''): URL_ITEMS => {
    const orders: ITEMS_LIST = {};
    const forwards: FORWARD_MOCKS = {};
    const domains = Object.keys(ITEMS);
    for (const domain of domains) {
        const item = ITEMS[domain];
        if (item.content) {
            if (item.status) {
                forwards[domain] = _raw(item);
            } else {
                forwards[domain] = `${item.content}\n` as RAW;
            }
            continue;
        } else if (item.order) {
            const order = item.order || [];
            orders[domain] = order;
            const statusCode = getProp(item, 'status', 0);
            for (const forward of order) {
                const current = forward;
                const index = order.indexOf(forward);
                const nextIndex = index + 1;
                const next = order[nextIndex] || order[order.length - 1];
                const isFinal = current === next;
                const status: number = isFinal ? statusCode : 301;
                const statusMessage = getStatusMessage(status);
                let content = _content;
                switch (status) {
                    case 200:
                        content = item.content || _content;
                        break;
                    default:
                        if (item.status && statusMessage) {
                            content = `<html><body><h1>${status} ${statusMessage}</h1></body></html>`;
                        }
                        break;
                }
                const config = { noLastLocation: true, FORWARDS: ITEMS };
                const location = next;
                const alt = { status, content, location };
                const _item = _httpItem(current, alt, config);
                const statusRow = getHttpStatusRow(_item.header);
                const header = { [statusRow]: undefined, ..._item.header };
                forwards[current] = formatResponse(header, { content });
            }
        } else if (item.hasOwnProperty('status')) {
            const status: number = item.status || 0;
            forwards[domain] = _raw({ status });
        }
    }
    const result = { forwards, orders };
    return result;
};

/**
 * Returns the raw HTTP header string for a given header object and end-of-line format.
 * @param {HTTP} header ➡️ The HTTP header object.
 * @param {EOL} eol ➡️ The end-of-line format ('CRLF' or 'LF').
 * @returns {RAW} 📤 The raw HTTP header string.
 */
export const getHeaderRaw = (header: HTTP, eol: EOL): string => {
    let result = '';
    const eolStr = eol === 'CRLF' ? '\r\n' : '\n';
    const FILTERED = ['lastLocation'];
    const headerKeys = sortASC(Object.keys(header)).filter(
        (key) => FILTERED.indexOf(key) === -1
    );
    for (const key of headerKeys) {
        if (PROTOCOL_OPTIONS.indexOf(key) !== -1) {
            continue;
        }
        const headerItem = header[key];
        if (header[key]) {
            result += `${convert2HeaderCase(key)}: ${headerItem}${eolStr}`;
        }
    }
    return result;
};
