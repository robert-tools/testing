// 📦 external dependencies
import { LOG } from '@robert.tools/log';
import { ITEMS } from '@robert.tools/typings';
import { getProp, sortASC, toType } from '@robert.tools/utils';

// 📦 internal dependencies
import { getHeaderRaw, getHttpStatusRow } from '../utils/utils';

// 🧩 types
import type { CurlItem, EOL, HTTP, RAW } from '../typings.d';

// ⚙️ config
import { CRLF, LF } from './../config';

/**
 * 🎯 formats a json to a http string
 * @param {ITEMS} source ➡️ The json object to format.
 * @param {ITEMS} alt ➡️ object with alternative values (optional)
 * @param {ITEMS} config ➡️ object with configuration options (optional)
 * @returns {RAW} 📤 The formatted http string.
 */
export const formatResponse = (
    source: ITEMS,
    alt: ITEMS = {},
    config: ITEMS = {}
): RAW => {
    const content =
        getProp(source, 'content', undefined) ||
        getProp(alt, 'content', undefined); // why alt or item content?
    const eolType = getProp(config, 'eol', 'CRLF');
    const eol = eolType === 'CRLF' ? '\r\n' : '\n';
    let result: RAW = `\nHTTP/${eol}`;
    const format = config?.format || 'default';
    let end = '';
    const TAB = '';
    let seperator: string = '';
    switch (format) {
        case 'other':
            seperator = `${TAB}\n\n${TAB}${TAB}${TAB}`;
            break;
        default:
            seperator = `${TAB}${eol}${eol}`;
    }
    const sortedKeys = sortASC(Object.keys(source));
    let validHTTPKey = null;
    for (const KEY of sortedKeys) {
        const hasValidStatusLine = KEY.trim().match(/HTTP\/\d\.\d/);
        if (hasValidStatusLine) {
            validHTTPKey = KEY;
        }
    }
    if (validHTTPKey !== null) {
        // rreplace default
        result = result.replace('HTTP/', validHTTPKey) as RAW;
    }
    result += getHeaderRaw(source as any, eolType);
    if (content) {
        result += `${seperator}${content}${end}\n`;
    } else {
        result += `${TAB}\n`;
    }
    return <RAW>toType(result);
};

/**
 * 🎯 create a http response from a curl object
 * @param {CurlItem} item ➡️ The curl response object.
 * @param {EOL} eol ➡️ The end-of-line character type. (default: 'CRLF')
 * @returns {RAW} 📤 The full http response.
 */
export const getResponseFromItem = (item: CurlItem, eol: EOL = 'CRLF'): RAW => {
    const header: HTTP = getProp(item, 'header', {});
    const content = item.content ? `${item.content}` : '';
    let result: string = `\n`;
    if (!item || Object.keys(item).length === 0) {
        LOG.FAIL(JSON.stringify(item));
        return <RAW>toType(result);
    }
    const eolContent = eol === 'CRLF' ? `${CRLF}${CRLF}` : `${LF}${LF}`;
    result += getHttpStatusRow(header, eol);
    result += getHeaderRaw(header, eol);

    const final = `${result}${content ? `${eolContent}${content}` : ''}\n`;
    return <RAW>toType(final);
};
