// 📦 internal dependencies
import { mockRequest } from './utils';

// 🧩 types
import type { URL_ITEMS } from './../index.d';

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
