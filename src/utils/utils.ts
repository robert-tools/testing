// 📦 external dependencies
import { getHostname, getUrlID } from '@robert.tools/uri';
import { getCurlData } from '@robert.tools/curl';
import { LOG } from '@robert.tools/log';
import { toType } from '@robert.tools/utils';

// 🧩 types
import type { RAW, URL_ITEMS } from '../index.d';

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
