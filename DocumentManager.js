const axios = require("axios");

let getDocIds = async (response, docIds, headers) => {
    Array.prototype.push.apply(docIds, response.data.doc_ids);
    if (response.data.has_more) {
        docIds = await recurseThroughPagination(
            response.data.cursor.value,
            docIds,
            headers
        );
    }
    return docIds;
};

let post = async (requestUri, requestArgs, headers, fallbackResponse) => {
    let res;
    try {
        res = await axios.post(requestUri, requestArgs, {
            headers: headers
        });
    } catch (e) {
        console.error(e);
        return fallbackResponse;
    }
    return res;
};

let recurseThroughPagination = async (cursor, docIds, headers) => {
    let response;
    response = await post(
        "https://api.dropboxapi.com/2/paper/docs/list/continue",
        { cursor: cursor },
        headers,
        { data: { doc_ids: docIds }, has_more: false }
    );

    docIds = await getDocIds(response, docIds, headers);

    return docIds;
};

module.exports = class {
    constructor(accessToken) {
        this.baseHeaders = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        };
    }

    /**
     * Return all document IDs.
     */
    async getAll() {
        let response;
        let docIds = [];

        response = await post(
            "https://api.dropboxapi.com/2/paper/docs/list",
            {},
            this.baseHeaders,
            { data: { doc_ids: docIds }, has_more: false }
        );

        docIds = await getDocIds(response, docIds, this.baseHeaders);

        return docIds;
    }

    /**
     * Get the content (in markdown or HTML) for a given document.
     */
    async getContent(docID) {
        let content;

        content = await post(
            "https://api.dropboxapi.com/2/paper/docs/download",
            null,
            Object.assign({}, this.baseHeaders, {
                "Content-Type": "text/plain",
                "Dropbox-API-Arg": `{ "doc_id": "${docID}", "export_format": { ".tag": "${this.format}" } }`
            }),
            { data: "" }
        );

        return content.data;
    }

    /**
     * Get the meta data for a given document.
     */
    async getMeta(docID) {
        let meta;

        meta = await post(
            "https://api.dropboxapi.com/2/paper/docs/get_metadata",
            { doc_id: docID },
            this.baseHeaders,
            { data: "" }
        );

        return meta.data;
    }
};
