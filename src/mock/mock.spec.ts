// 📦 external dependencies

// 📦 internal dependencies
import { _head, _header, _headerItem } from './mock';
import { _http, _httpItem, _raw, _response } from './mock';

// ⚙️ config
import { DOMAIN_200, DOMAIN_301, DOMAIN_404, PROTOCOL } from './../config';
import { _BASE_X, contentLength, etag, lastModified } from './../config';

// ⚓ CONSTANTS
const DOMAIN = 'example.yy';

describe('✅ _header()', () => {
    const FN = _header;
    it('[404] should return simple response', () => {
        const location = `https://www.${DOMAIN_404}/`;
        const result = FN(location);
        const input = { location, status: 404 };
        const result2 = _response(input);
        expect(result).toEqual(result2);
        expect(result).toEqual(_raw({ status: 404 }));
    });
    it('[200] should return extended response', () => {
        const location = `https://www.${DOMAIN_200}/`;
        const result = FN(location);
        const result2 = _response({ location, status: 200 });
        expect(result).toEqual(result2);
        expect(result).toEqual(_raw({ status: 200 }, { eol: 'CRLF' }));
    });
    it('[301] should return extended response', () => {
        const location = `https://www.${DOMAIN_301}`;
        const result = FN(`https://www.${DOMAIN_301}`);
        const result2 = _response({ location, status: 301 });
        expect(result).toEqual(result2);
        expect(result).toEqual(_raw({ status: 301 }));
    });
    it('[0] should return response when timeout', () => {
        const location = `https://www.${DOMAIN_200}/`;
        const opts = { request: `curl -m 1 ${location}` };
        // const opts = { request: `curl --max-time 1 ${url}` };
        const result = FN(location, opts);
        const result2 = _response({ location, status: 0 });
        expect(result).toEqual(result2);
        expect(result).toEqual(_raw({ status: 0 }));
    });
});
describe('✅ _response()', () => {
    const FN = _response;
    const content = 'response content';
    const config = { eol: 'CRLF' };
    it('[404] should return simple response', () => {
        const status = 404;
        const location = `https://www.${DOMAIN_404}/`;
        const result = FN({ location, status, content });
        expect(result).toEqual(_raw({ content, status }, config));
    });
    it('[200] should return extended response', () => {
        const status = 200;
        const location = `https://www.${DOMAIN_200}/`;
        const result = FN({ location, status, content });
        expect(result).toEqual(_raw({ content, status }, config));
    });
    it('[301] should return extended response', () => {
        const status = 301;
        const result = FN({ location: DOMAIN_200, status, content });
        const location = `www.${DOMAIN_200}`; // new location
        expect(result).toEqual(_raw({ content, location, status }, config));
    });
});
describe('✅ _headerItem()', () => {
    const FN = _headerItem;
    it('[404] should return header part of response', () => {
        const result = FN(`https://www.${DOMAIN_404}/`);
        const EXPECTED = _head(404, { contentLength: '1500' });
        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return header part of response', () => {
        const lastLocation = `https://www.${DOMAIN_301}`;
        const location = `https://www.${DOMAIN_301}/`;
        const contentLength = '185';
        const result = FN(lastLocation);
        const EXPECTED = _head(301, { contentLength, location, lastLocation });
        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return header part of response without lastLocation', () => {
        const URL = `https://${DOMAIN_301}`;
        const location = `https://www.${DOMAIN_301}`;
        const result = FN(URL, {}, { noLastLocation: true });
        const EXPECTED = _head(301, { contentLength: '185', location });
        expect(result).toEqual(EXPECTED);
    });
    it('[200] should return header part of response without lastLocation', () => {
        const URL = `https://www.${DOMAIN_200}`;
        const location = `https://www.${DOMAIN_200}/`;
        const result = FN(URL, {}, { noLastLocation: true });
        const EXPECTED = _head(301, { contentLength: '185', location });
        expect(result).toEqual(EXPECTED);
    });
});
describe('✅ _http()', () => {
    const FN = _http;
    const content = 'foo';
    const location = `https://www.${DOMAIN_200}/`;
    const opts = { contentLength, location, content };
    it('[200] should return HTTP result for 200', () => {
        const EXPECTED = {
            content,
            status: '200',
            success: true,
            time: expect.any(Number),
            header: {
                ..._BASE_X,
                status: '200',
                statusMessage: 'OK',
                ...PROTOCOL,
                etag,
                lastModified,
                contentLength,
                location,
            },
        };
        expect(FN(200, opts)).toEqual(EXPECTED);
    });
    it('[200] should return HTTP result for 200 without alt options', () => {
        const EXPECTED = {
            content: '',
            status: '200',
            success: true,
            time: expect.any(Number),
            header: {
                ..._BASE_X,
                contentLength,
                etag,
                lastModified,
                status: '200',
                statusMessage: 'OK',
                ...PROTOCOL,
            },
        };
        expect(FN(200)).toEqual(EXPECTED);
    });
});
describe('✅ _head()', () => {
    const FN = _head;
    it('[200] should return header part of response', () => {
        expect(FN(200)).toEqual(_head(200));
    });
    it('[301] should return header part of response', () => {
        const lastLocation = `https://www.${DOMAIN_301}`;
        const location = `https://www.${DOMAIN_301}/`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        expect(FN(301, opts)).toEqual(_head(301, opts));
    });
});
describe('✅ _httpItem()', () => {
    const FN = _httpItem;
    const content = 'Hello, world!';
    it('[200] should return the correct HTTP item', () => {
        const status = 200;
        const opts = { content, etag, lastModified, contentLength };
        const EXPECTED = _http(status, opts);
        const result = FN(DOMAIN, { content, status });

        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_200}`;
        const location = `${lastLocation}/`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation)).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for the next step', () => {
        const lastLocation = `${DOMAIN_200}`;
        const location = `www.${lastLocation}`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation)).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_301}`;
        const location = `${lastLocation}/`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation)).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_301}/`;
        const EXPECTED = _http(200, {
            contentLength,
            lastLocation,
            etag,
            lastModified,
        });
        const result = FN(lastLocation);

        expect(result).toEqual(EXPECTED);
    });
    it('[111] should return the correct HTTP item when status code is unknown', () => {
        const content = 'xx';
        const status = 111;
        const EXPECTED = _http(status, { content });
        const result = FN(DOMAIN, { content, status });
        expect(result).toEqual(EXPECTED);
    });
    it('[200] should get the next URL correctly when forwarding is enabled', () => {
        const lastLocation = DOMAIN_200;
        const contentLength = '7698';
        const opts = { contentLength, lastLocation, etag, lastModified };
        const EXPECTED = _http(200, opts);
        expect(FN(lastLocation, {}, { forwarding: true })).toEqual(EXPECTED);
    });
    it('[200] should get correct item when status is overwritten to 0', () => {
        const lastLocation = DOMAIN_200;
        const opts = { lastLocation };
        const EXPECTED = _http(0, opts);
        expect(FN(lastLocation, { status: 0 }, {})).toEqual(EXPECTED);
    });
    it('[301 ]should get the next URL correctly when forwarding is NOT enabled', () => {
        const lastLocation = DOMAIN_200;
        const location = `www.${lastLocation}`;
        const opts = { contentLength: '185', location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation, {}, { forwarding: false })).toEqual(EXPECTED);
    });
});

describe('✅ _raw()', () => {
    const FN = _raw;
    it('should return the correct RAW response for a given status', () => {
        const status = 404;
        const config = { eol: 'LF' };
        const EXPECTED = `
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 1500
Content-Type: text/html; charset=UTF-8
Date: Mon, 18 Mar 1970 08:34:52 GMT
Server: nginx/1.14.1


foo
`;
        const result = FN({ status, content: 'foo' }, config);
        expect(result).toEqual(EXPECTED);
    });
});
