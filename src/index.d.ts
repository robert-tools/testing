// mock responses
type HTTPResponse = `HTTP${string}`;

export type RAW = HTTPResponse | `\n${HTTPResponse}` | `\r\n${HTTPResponse}`;

export type FORWARD_MOCKS = {
    [key: string]: RAW;
};

export type URL_ITEMS = {
    forwards: FORWARD_MOCKS;
    orders: {
        [key: string]: string[];
    };
    fallback?: string;
};
