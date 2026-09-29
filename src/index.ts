// 📦 external dependencies
import * as cmd from '@robert.tools/cmd';

// 📦 internal dependencies
import { mockRequest } from './utils/utils';

// 🧩 types
import type { URL_ITEMS } from './index.d';

/**
 * 🎯 Creates a spy on the `cmd.command` function and mocks its implementation to return the specified result.
 * @param result ➡️ The mock value to return. (optional)
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnCommand = (result: string = '') => {
    return jest.spyOn(cmd, 'command').mockImplementation((): string => {
        return result;
    });
};

/**
 * 🎯 Creates a spy to mock the `cmd.command` function for specific URL requests.
 * @param {URL_ITEMS} results ➡️ The URL items to mock.
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnURLs = (results: URL_ITEMS) => {
    return jest
        .spyOn(cmd, 'command')
        .mockImplementation((request: string): string => {
            return mockRequest(request, results);
        });
};
