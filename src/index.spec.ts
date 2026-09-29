// 📦 external dependencies
import { command } from '@robert.tools/cmd';
import { LOG } from '@robert.tools/log';

// 📦 internal dependencies
import { spyOnCommand, spyOnURLs } from './index';

// 🧩 types
import type { RAW, URL_ITEMS } from './index.d';

describe('✅ spyOnCommand', () => {
    const FN = spyOnCommand;
    it('should create a spy on cmd.command and return the specified result', () => {
        const result = 'mocked result';
        const spy = FN(result);
        const commandResult = command('test');
        expect(commandResult).toBe(result);
        expect(spy).toHaveBeenCalledWith('test');
        spy.mockRestore();
    });
    it('should restore the original implementation after mockRestore is called', () => {
        const result = 'mocked result';
        const spy = FN(result);
        spy.mockRestore();
        const commandResult = command('test');
        expect(commandResult).not.toBe(result);
    });
});
describe('✅ spyOnURLs', () => {
    const FN = spyOnURLs;
    const results: URL_ITEMS = {
        forwards: {
            url1: 'HTTP/2 mocked result 1',
            url2: 'HTTP/2 mocked result 2',
            url3: 'HTTP/2 mocked result 3',
            fallback: '<fallback-result>' as RAW,
        },
        orders: {
            url1: ['url1', 'url3'],
        },
    };
    it('should create a spy on cmd.command and return the specified result for each URL ID', () => {
        const spy = FN(results);
        expect(command('url1')).toBe('HTTP/2 mocked result 1');
        expect(spy).toHaveBeenCalledWith('url1');
        spy.mockRestore();
    });
    it('should create a spy on cmd.command and return a fallback for unknown URL IDs', () => {
        const spyCMD = FN(results);
        const spyLOG = jest.spyOn(LOG, 'FAIL');
        expect(command('url5')).toBe('<fallback-result>');
        expect(spyCMD).toHaveBeenCalledWith('url5');
        expect(spyLOG).toHaveBeenCalledWith('No mock result for URL ID: url5');
        spyCMD.mockRestore();
        spyLOG.mockRestore();
    });
    it('should create a spy on cmd.command and return <invalid> for unknown URL IDs when no fallback', () => {
        const results: URL_ITEMS = {
            forwards: {
                url1: 'HTTP/2 mocked result 1',
                url2: 'HTTP/2 mocked result 2',
                url3: 'HTTP/2 mocked result 3',
            },
            orders: {
                url1: ['url1', 'url3'],
            },
        };

        const spyCMD = FN(results);
        const spyLOG = jest.spyOn(LOG, 'FAIL');
        expect(command('url4')).toBe('<invalid>');
        expect(spyCMD).toHaveBeenCalledWith('url4');
        expect(spyLOG).toHaveBeenCalledWith('No mock result for URL ID: url4');
        spyCMD.mockRestore();
        spyLOG.mockRestore();
    });
});
