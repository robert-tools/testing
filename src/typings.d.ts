// mock responses
type HTTPResponse = `HTTP${string}`;

export type RAW = HTTPResponse | `\n${HTTPResponse}` | `\r\n${HTTPResponse}`;

export type FORWARD_MOCKS = {
    [key: string]: RAW;
};

export type STATUS = number;

export type URL_ITEMS = {
    forwards: FORWARD_MOCKS;
    orders: {
        [key: string]: string[];
    };
    fallback?: string;
};

export type PROTOCOL_STATUS = {
    status: NUM;
    statusMessage: string;
    protocol: string;
    protocolVersion: string;
    lastLocation?: URI; // the last location in headers
};

export type HTTP = PROTOCOL_STATUS & {
    server: string;
    date: string;
    contentType: string;
    location?: URI; // next location
    // Define other common properties here
    [key: string]: string;
};
export type CurlItem = {
    header: HTTP;
    content: string;
    status: NUM;
    success: boolean;
    time?: number; // Optional, for performance measurement
};
export type HTTP_OPTS = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    timeout?: number; // in seconds as string
    ua?: string; // user agent string
    acceptHeader?: string; // additional curl type options
    type?: 'json' | 'html' | 'text' | 'xml';
    forwarding?: boolean; // whether to follow redirects
    token?: string; // auth token
    isDev?: boolean; // development mode
    showLog?: boolean; // whether to show logs or not
    noLastLocation?: boolean; // whether to ignore the last location in headers
    isMock?: boolean; // whether to use some mock data
    data?: any;
};
export type HTTP_BASE = {
    status?: STATUS; // ex ohne ?
    content?: string; // ex ohne ?
    location?: string;
};

export type MOCK_CONFIG = {
    [key: string]: {
        status?: number;
        order?: string[];
        content?: string;
    };
};

export type URI_ITEM = {
    url: URI;
    statusCode: number;
    isLast: boolean;
    lastLocation: URI;
};
export type LOCATION = {
    lastLocation?: URI;
    location?: URI;
};

export type EOL = 'CRLF' | 'LF';
