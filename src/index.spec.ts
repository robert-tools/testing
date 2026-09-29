import { sample } from './index';

describe('@robert.tools/testing', () => {
    it('should return a testing string', () => {
        expect(sample('hello')).toBe('sample: hello');
    });

    it('should return a testing string with empty input', () => {
        expect(sample('')).toBe('sample: ');
    });
});
