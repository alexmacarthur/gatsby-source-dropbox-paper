const axios = require("axios");

module.exports = class {

    constructor(accessToken) {
        this.baseHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };
    }

    /**
   * Recursively appends docIds via pagination
   */
    async recurseThroughPagination(cursor, docIds) {
        let response;
        try {
            response = await axios.post(
                "https://api.dropboxapi.com/2/paper/docs/list/continue",
                {
                    cursor: cursor
                },
                {
                    headers: this.baseHeaders
                }
            );
        } catch (e) {
            console.error(e);
            return docIds;
        } finally {
            Array.prototype.push.apply(docIds, response.data.doc_ids);
            if (response.data.has_more) {
                await this.recurseThroughPagination(response.data.cursor.value, docIds);
            }
        }
    }

    /**
     * Return all document IDs.
     */
    async getAll() {
        let response;
        let docIds = [];

        try {
            response = await axios.post("https://api.dropboxapi.com/2/paper/docs/list", {}, {
                headers: this.baseHeaders
            });
        } catch (e) {
            console.error(e);
            return docIds;
        } finally {
            Array.prototype.push.apply(docIds, response.data.doc_ids);
            if (response.data.has_more) {
                await this.recurseThroughPagination(response.data.cursor.value, docIds);
            }
            return docIds;
        }
    }

    /**
     * Get the content (in markdown or HTML) for a given document.
     */
    async getContent(docID, format = 'markdown') {
        let data;

        try {
            data = await axios.post("https://api.dropboxapi.com/2/paper/docs/download", null, {
                headers: Object.assign({}, this.baseHeaders, {
                    "Content-Type": "text/plain",
                    "Dropbox-API-Arg": `{ "doc_id": "${docID}", "export_format": { ".tag": "${format}" } }`
                })
            });
        } catch (e) {
            console.error(e);
            return '';
        } finally {
            return data.data;
        }
    }

    /**
     * Get the meta data for a given document.
     */
    async getMeta(docID) {
        let meta;

        try {
            meta = await axios.post("https://api.dropboxapi.com/2/paper/docs/get_metadata", {
                doc_id: docID
            }, {
                headers: this.baseHeaders
            });
        } catch (e) {
            console.error(e);
            return {};
        } finally {
            return meta.data;
        }
    }
}
