import { Client, ClientOptions, addHeaders } from "@client";

export class JSONClient extends Client {
    constructor(options: ClientOptions) {
        super(addHeaders(options, { "Content-Type": "application/json" }));
    }
}
