// 📦 external dependencies
import * as cmd from '@robert.tools/cmd';

// 📦 internal dependencies
import { getMockedURLs, mockRequest } from '../utils/utils';

// 🧩 types
import { MOCK_CONFIG, URL_ITEMS } from '../typings';

/**
 * 🎯 Creates a spy on the `cmd.command` function and mocks its implementation to return the specified result.
 * @param {string} result ➡️ The mock value to return. (optional)
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnCommand = (result: string = '') => {
    return jest.spyOn(cmd, 'command').mockImplementation((): string => {
        return result;
    });
};

/**
 * 🎯 Creates a spy to mock the `cmd.command` function for specific URL requests.
 * @param {MOCK_CONFIG} input ➡️ The set of forward items to mock.
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnURLs = (input: MOCK_CONFIG) => {
    const results: URL_ITEMS = getMockedURLs(input);
    return jest
        .spyOn(cmd, 'command')
        .mockImplementation((request: string): string => {
            return mockRequest(request, results);
        });
};
