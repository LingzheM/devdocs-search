import Typesense from 'typesense';

export const client = new Typesense.Client({
    nodes: [
        {
            host: "localhost",
            port: 8108,
            protocol: "http",
        }
    ],
    apiKey: "dev_api_key_123",
    connectionTimeoutSeconds: 2
})