const axios = require("axios");

module.exports = class {

    constructor(accessToken) {
        this.baseHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };
    }

    /**
     * Return all document IDs.
     */
    async getAll() {
        let response;

        try {
            response = await axios.post("https://api.dropboxapi.com/2/paper/docs/list", {}, {
                headers: this.baseHeaders
            });
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            return response.data.doc_ids;
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
