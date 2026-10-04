// 📦 external dependencies
import { filterObject } from '@robert.tools/utils';

// 📦 internal dependencies
import {
    _locationItem,
    getBaseHeader,
    getCustom,
    getHeaderRaw,
    getHttpStatusRow,
    getMockedURLs,
    getNextUrl,
    getResponse,
    getStatusMessage,
    mockRequest,
    setProtocolStatus,
} from './utils';
import { _http, _raw } from '../index';

// 🧩 types
import type {
    PROTOCOL_STATUS,
    URL_ITEMS,
    MOCK_CONFIG,
    HTTP,
} from '../typings.d';

// ⚙️ config
import { PROTOCOL, DOMAIN_404, SVG_GITHUB, NO_HOST } from '../config';

// ⚓ CONSTANTS
const DOMAIN = 'example.yy';
const INTERNAL_ERROR = 'Internal Server Error';
const MOVED = 'Moved Permanently';
const UNKNOWN = 'unknown.xx';

describe('✅ mockRequest', () => {
    const FN = mockRequest;
    const results: URL_ITEMS = {
        forwards: {
            url1: 'HTTP/2 mocked result 1',
            url2: 'HTTP/2 mocked result 2',
            url3: 'HTTP/2 mocked result 3',
        },
        orders: {
            url1: ['url2', 'url3'],
        },
        fallback: 'HTTP/2 mocked fallback',
    };
    it('should return the mocked result for a known URL ID', () => {
        const request = 'url1';
        const result = FN(request, results);
        expect(result).toBe('HTTP/2 mocked result 1');
    });
    it('should return the fallback result for an unknown URL ID', () => {
        const request = 'unknown_url';
        const result = FN(request, results);
        expect(result).toBe('<invalid>');
    });
    it('should return the forwarded result based on the order', () => {
        const request = `url1 -d '{ "forwarding": true }'`;
        const result = FN(request, results);
        expect(result).toBe('HTTP/2 mocked result 3');
    });
    it('should return the fallback result if forwarding is true but no valid order exists', () => {
        const request = `url1 -d '{ "forwarding": true }'`;
        const modifiedResults = {} as URL_ITEMS;
        const result = FN(request, modifiedResults);
        expect(result).toBe('<invalid>');
    });
});
describe('✅ getResponse', () => {
    const FN = getResponse;
    // Add tests for the getResponse function here
    it('[404] should return simple response', () => {
        const status = 404;
        expect(FN(`https://www.${DOMAIN_404}/`)).toEqual(_raw({ status }));
        expect(FN(`https://www.${DOMAIN_404}/`, {})).toEqual(_raw({ status }));
    });
});
describe('✅ setProtocolStatus()', () => {
    const FN = setProtocolStatus;
    const EXPECTED = {
        '200': { status: '200', statusMessage: 'OK', ...PROTOCOL },
        '404': { status: '404', statusMessage: 'Not Found', ...PROTOCOL },
        '500': { status: '500', statusMessage: INTERNAL_ERROR, ...PROTOCOL },
        '301': { status: '301', statusMessage: MOVED, ...PROTOCOL },
        '0': { status: '0', statusMessage: 'unknown', ...PROTOCOL },
        '333': { status: '333', statusMessage: 'unknown', ...PROTOCOL }, // TODO: correct?
    };
    it('should set the protocol status correctly', () => {
        expect(FN(200)).toEqual(EXPECTED['200']);
        expect(FN(404)).toEqual(EXPECTED['404']);
        expect(FN(500)).toEqual(EXPECTED['500']);
        expect(FN(301)).toEqual(EXPECTED['301']);
        expect(FN(0)).toEqual(EXPECTED['0']);
        expect(FN(333)).toEqual(EXPECTED['333']);
    });
});
describe('✅ getNextUrl()', () => {
    const FN = getNextUrl;
    const FORWARDS: MOCK_CONFIG = {
        [DOMAIN]: {
            status: 200,
            order: [
                `${DOMAIN}`,
                `www.${DOMAIN}`,
                `http://${DOMAIN}`,
                `https://${DOMAIN}`,
                `https://www.${DOMAIN}`,
                `https://www.${DOMAIN}/`,
            ],
        },
    };
    it('should get the next URL correctly', () => {
        const lastLocation = `${DOMAIN}`;
        // Add your test cases here
        expect(FN(`${DOMAIN}`, FORWARDS)).toEqual({
            url: `www.${DOMAIN}`,
            statusCode: 301,
            isLast: false,
            lastLocation,
        });
        expect(FN(`www.${DOMAIN}`, FORWARDS)).toEqual({
            url: `http://${DOMAIN}`,
            statusCode: 301,
            isLast: false,
            lastLocation: `www.${DOMAIN}`,
        });
        expect(FN(`http://${DOMAIN}`, FORWARDS)).toEqual({
            url: `https://${DOMAIN}`,
            statusCode: 301,
            isLast: false,
            lastLocation: `http://${DOMAIN}`,
        });
        expect(FN(`https://${DOMAIN}`, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}`,
            statusCode: 301,
            isLast: false,
            lastLocation: `https://${DOMAIN}`,
        });
        expect(FN(`https://www.${DOMAIN}/`, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
            lastLocation: `https://www.${DOMAIN}/`,
        });
    });
    it('should get the next URL correctly when at the last item and no order', () => {
        const FORWARDS: MOCK_CONFIG = {
            [DOMAIN]: {
                status: 200,
                order: [],
            },
        };
        const lastLocation = `https://www.${DOMAIN}`;
        expect(FN(lastLocation, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}`,
            statusCode: 200,
            isLast: true,
            lastLocation,
        });
    });
    it('should get the next URL correctly when at the last item', () => {
        const lastLocation = `https://www.${DOMAIN}/`;
        expect(FN(lastLocation, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
            lastLocation,
        });
    });
    it('should get the next URL correctly when forwarding is enabled', () => {
        const lastLocation = `${DOMAIN}`;
        expect(FN(`${DOMAIN}`, FORWARDS, { forwarding: true })).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
            lastLocation,
        });
    });
    it('should handle unknown URLs gracefully', () => {
        const lastLocation = `unknown.${UNKNOWN}`;
        expect(FN(lastLocation, FORWARDS)).toEqual({
            url: lastLocation,
            statusCode: 0,
            isLast: true,
            lastLocation,
        });
    });
});
describe('✅ _locationItem()', () => {
    const url = `https://www.${DOMAIN}/`;
    const lastLocation = `https://${DOMAIN}`;
    describe('forwarding=true', () => {
        const opts = { forwarding: true };
        it('[301] should return the correct location item for a given URL item', () => {
            const urlItem = {
                statusCode: 301,
                url,
                isLast: false,
                lastLocation,
            };
            const result = _locationItem(urlItem, opts);
            expect(result).toEqual({ location: url, lastLocation });
        });
        it('[301] should return the correct location item for a given URL item', () => {
            const urlItem = {
                statusCode: 301,
                url,
                isLast: true,
                lastLocation,
            };
            const result = _locationItem(urlItem, opts);
            expect(result).toEqual({ lastLocation });
        });
    });
    describe('forwarding=false', () => {
        const opts = { forwarding: false };
        const lastLocation = `https://www.${DOMAIN}`;
        it('[200] should return the correct location item for a given URL item without forwarding', () => {
            const urlItem = {
                statusCode: 200,
                url,
                isLast: false,
                lastLocation,
            };
            const result = _locationItem(urlItem, opts);
            expect(result).toEqual({ lastLocation });
        });
        it('[301] should return the correct location item for a given URL item without forwarding', () => {
            const urlItem = {
                statusCode: 301,
                url,
                isLast: true,
                lastLocation,
            };
            const result = _locationItem(urlItem, opts);
            expect(result).toEqual({ lastLocation });
        });
    });
});

describe('✅ getBaseHeader', () => {
    const FN = getBaseHeader;
    it('[200] should return the correct base header for a given status', () => {
        expect(FN(200)).toEqual(_http(200).header);
    });
    it('[500] should return the correct base header for a given status', () => {
        expect(FN(500)).toEqual(_http(500).header);
    });
});
describe('✅ getHttpStatusRow', () => {
    const FN = getHttpStatusRow;
    const eol = 'CRLF';
    it('[200] should return the correct HTTP status row for a given protocol status item', () => {
        const item = { ...PROTOCOL, status: 200, statusMessage: 'OK' };
        const expected = 'HTTP/1.1 200 OK\r\n';
        expect(FN(item, eol)).toEqual(expected);
    });
    it('[404] should return the correct HTTP status row for a given protocol status item', () => {
        const item = { ...PROTOCOL, status: 404, statusMessage: 'Not Found' };
        const expected = 'HTTP/1.1 404 Not Found\n';
        expect(FN(item, 'LF')).toEqual(expected);
    });
    it('should return empty string if somethings is missing', () => {
        expect(FN({ status: 200 } as PROTOCOL_STATUS, eol)).toEqual('');
        expect(FN(null as unknown as PROTOCOL_STATUS, eol)).toEqual('');
    });
});
describe('✅ getCustom', () => {
    const FN = getCustom;
    const FILTERED = ['status', 'statusMessage', 'protocol', 'protocolVersion'];
    it('[200] should return the correct custom value for a given key', () => {
        const EXPECTED = filterObject(_http(200).header, FILTERED, 'exclude');
        expect(FN(200, {})).toEqual(EXPECTED);
    });
    it('[444] should return the correct custom value for an unknown key', () => {
        const EXPECTED = filterObject(_http(444).header, FILTERED, 'exclude');
        expect(FN(444, {})).toEqual(EXPECTED);
    });
    it('[301] should return the correct custom value for a given key', () => {
        const location = 'https://www.new_location.com';
        const EXPECTED = filterObject(_http(301).header, FILTERED, 'exclude');
        EXPECTED['location'] = location;
        expect(FN(301, { location })).toEqual(EXPECTED);
    });
});
describe('✅ getStatusMessage', () => {
    const FN = getStatusMessage;
    it('[200] should return the correct status message for a known status code', () => {
        expect(FN(200)).toEqual('OK');
        expect(FN(404)).toEqual('Not Found');
    });
    it('[999] should return "unknown" for an unknown status code', () => {
        expect(FN(0)).toEqual('unknown');
        expect(FN(999)).toEqual('unknown');
    });
});
describe('getMockedURLs()', () => {
    const FN = getMockedURLs;
    it('should return the correct forwards for a given domain', () => {
        const domain_200 = 'example_200.com';
        const domain_301 = 'example_301.com';
        const url_200 = `https://www.${domain_200}`;
        const url_200_1 = `https://www.${domain_200}/`;
        const url_301 = `https://www.${domain_301}`;
        const url_301_2 = `https://www.${domain_301}/`;
        const content = 'some content';
        const forwards = {
            [domain_200]: { status: 200, order: [url_200, url_200_1] },
            [domain_301]: { status: 301, order: [url_301, url_301_2] },
            [SVG_GITHUB]: { status: 200, content: '<svg>' },
            [NO_HOST]: { content: 'no_connect' },
            fallback: { status: 404 },
            fallback2: { status: 0 },
        };
        const CONTENT_301 =
            '<html><body><h1>301 Moved Permanently</h1></body></html>';
        // const CONTENT_200 = 'some content';
        const _ = (status: number, content: string, location: string) => {
            return { status, content, location };
        };
        const EXPECTED = {
            forwards: {
                [url_200]: _raw(_(301, CONTENT_301, url_200_1)),
                [url_200_1]: _raw({ status: 200, content }),
                // [url_200_1]: _raw(_(200, content, url_200_1)),
                [url_301]: _raw(_(301, CONTENT_301, url_301_2)),
                [url_301_2]: _raw(_(301, CONTENT_301, url_301_2)),
                fallback: _raw({ status: 404 }),
                fallback2: _raw({ status: 0 }),
                [SVG_GITHUB]: _raw({ status: 200, content: '<svg>' }),
                [NO_HOST]: 'no_connect\n',
            },
            orders: {
                [domain_200]: [url_200, url_200_1],
                [domain_301]: [url_301, url_301_2],
            },
        };
        expect(FN(forwards, content)).toEqual(EXPECTED);
    });
});
describe('✅ getHeaderRaw()', () => {
    const FN = getHeaderRaw;
    it('should return the correct header row for a given header object', () => {
        const header = {
            status: '301',
            statusMessage: 'OK',
            lastLocation: 'foobar',
            contentType: 'application/json',
        };
        const EXPECTED = 'Content-Type: application/json\n';
        expect(FN(header as HTTP, 'LF')).toEqual(EXPECTED);
    });
});
