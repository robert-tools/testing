// 📦 internal dependencies
import { _http, _raw } from '../index';
import { formatResponse, getResponseFromItem } from './format';

// ⚙️ config
import { etag, lastModified, CRLF, LF } from './../config';

describe('✅ formatResponse()', () => {
    const FN = formatResponse;
    const DOMAIN = 'example.com';
    const DOMAIN_2 = 'xyz.com';
    const content = 'response content';
    const SEPERATOR = `${LF}${LF}`;
    const INPUT = {
        'HTTP/1.1 301 Moved Permanently': '',
        'Accept-Ranges': 'bytes',
        Connection: 'keep-alive',
        contentLength: '185', // testing lower keys
        'Content-Type': 'text/html; charset=UTF-8',
        date: 'Fri, 29 Mar 2024 21:28:51 GMT', // testing lower keys
        Location: `https://www.${DOMAIN}/`,
        'Referrer-Policy': 'no-referrer-when-downgrade',
        Server: 'nginx/1.14.1',
        'Strict-Transport-Security': 'max-age=31536000;',
        'X-Frame-Options': 'SAMEORIGIN',
    };
    const EOL = CRLF;
    it('should return formatted response', () => {
        const EXPECTED =
            LF +
            // 'HTTP/\r\n' +
            `HTTP/1.1 301 Moved Permanently${EOL}` +
            `Accept-Ranges: bytes${EOL}` +
            `Connection: keep-alive${EOL}` +
            `Content-Length: 185${EOL}` +
            `Content-Type: text/html; charset=UTF-8${EOL}` +
            `Date: Fri, 29 Mar 2024 21:28:51 GMT${EOL}` +
            `Location: https://www.${DOMAIN}/${EOL}` +
            `Referrer-Policy: no-referrer-when-downgrade${EOL}` +
            `Server: nginx/1.14.1${EOL}` +
            `Strict-Transport-Security: max-age=31536000;${EOL}` +
            `X-Frame-Options: SAMEORIGIN${EOL}` +
            `${LF}`;
        const result = FN(INPUT);
        expect(result).toEqual(EXPECTED);
    });
    it('should return formatted response with different location', () => {
        const EXPECTED =
            LF +
            `HTTP/1.1 301 Moved Permanently${EOL}` +
            `Accept-Ranges: bytes${EOL}` +
            `Connection: keep-alive${EOL}` +
            `Content-Length: 185${EOL}` +
            `Content-Type: text/html; charset=UTF-8${EOL}` +
            `Date: Fri, 29 Mar 2024 21:28:51 GMT${EOL}` +
            `Location: https://www.${DOMAIN}/${EOL}` +
            `Referrer-Policy: no-referrer-when-downgrade${EOL}` +
            `Server: nginx/1.14.1${EOL}` +
            `Strict-Transport-Security: max-age=31536000;${EOL}` +
            `X-Frame-Options: SAMEORIGIN${EOL}` +
            `${LF}`;
        const result = FN(INPUT, { Location: `https://www.${DOMAIN_2}/` });
        expect(result).toEqual(EXPECTED);
    });
    it('should return formatted response with content', () => {
        const EXPECTED =
            LF +
            `HTTP/1.1 301 Moved Permanently${EOL}` +
            `Accept-Ranges: bytes${EOL}` +
            `Connection: keep-alive${EOL}` +
            `Content-Length: 185${EOL}` +
            `Content-Type: text/html; charset=UTF-8${EOL}` +
            `Date: Fri, 29 Mar 2024 21:28:51 GMT${EOL}` +
            `Location: https://www.${DOMAIN}/${EOL}` +
            `Referrer-Policy: no-referrer-when-downgrade${EOL}` +
            `Server: nginx/1.14.1${EOL}` +
            `Strict-Transport-Security: max-age=31536000;${EOL}` +
            `X-Frame-Options: SAMEORIGIN${EOL}` +
            '' +
            SEPERATOR +
            content +
            LF;

        const result = FN(INPUT, { content }, { format: 'other' });
        expect(result).toEqual(EXPECTED);
    });
});
describe('✅ getResponseFromObject()', () => {
    const FN = getResponseFromItem;
    const contentLength: string = '7698';
    it('[404] should return simple response', () => {
        const input = _http(404, { contentLength: '1500' });
        expect(FN(input)).toEqual(_raw({ status: 404 }));
    });
    it('[200] should return response', () => {
        const input = _http(200, { contentLength, etag, lastModified });
        expect(FN(input)).toEqual(_raw({ status: 200 }));
    });
    it('[200] should return response with content', () => {
        const content = `{"status":"data_found"}`;
        const inpt = _http(200, { contentLength, etag, lastModified, content });
        const alt = { content, status: 200 };
        const config = { format: 'default' };
        expect(FN(inpt)).toEqual(_raw(alt, config));
    });
    it('should return response with empty content', () => {
        expect(FN({} as any)).toEqual(LF);
    });
});
