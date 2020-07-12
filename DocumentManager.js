const axios = require('axios')

class HttpPoster {
  constructor(maxRetryCount, retryDelayMs, shouldRetry) {
    this.maxRetryCount = maxRetryCount
    this.retryDelayMs = retryDelayMs
    this.shouldRetry = shouldRetry
  }

  async post(requestUri, requestArgs, headers, fallbackResponse) {
    let res
    const axiosPromise = () => axios.post(requestUri, requestArgs, { headers })

    if (this.shouldRetry) {
      let retryCount = 0
      const promisedData = () =>
        new Promise(resolve => {
          setTimeout(async () => {
            try {
              const data = await axiosPromise()
              resolve(data)
            } catch (e) {
              if (retryCount < this.maxRetryCount) {
                retryCount++
                resolve(promisedData())
              } else {
                console.error(e)
                resolve(fallbackResponse)
              }
            }
          }, this.retryDelayMs)
        }).then(result => (res = result))
      await promisedData()
    } else {
      try {
        res = await axiosPromise()
      } catch (e) {
        console.error(e)
        res = fallbackResponse
      }
    }

    return res
  }
}

module.exports = class {
  constructor(
    accessToken,
    format,
    { maxRetryCount, retryDelayMs, shouldRetry }
  ) {
    this.format = format
    this.baseHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }
    this.httpPoster = new HttpPoster(maxRetryCount, retryDelayMs, shouldRetry)
  }

  async _getDocIds(response, docIds, headers) {
    Array.prototype.push.apply(docIds, response.data.doc_ids)
    if (response.data.has_more) {
      docIds = await this._recurseThroughPagination(
        response.data.cursor.value,
        docIds,
        headers
      )
    }
    return docIds
  }

  async _recurseThroughPagination(cursor, docIds, headers) {
    const response = await this.httpPoster.post(
      'https://api.dropboxapi.com/2/paper/docs/list/continue',
      { cursor: cursor },
      headers,
      { data: { doc_ids: docIds }, has_more: false }
    )

    docIds = await this._getDocIds(response, docIds, headers)
    return docIds
  }

  /**
   * Return all document IDs.
   */
  async getAll() {
    let response
    let docIds = []

    response = await this.httpPoster.post(
      'https://api.dropboxapi.com/2/paper/docs/list',
      {},
      this.baseHeaders,
      { data: { doc_ids: docIds }, has_more: false }
    )

    docIds = await this._getDocIds(response, docIds, this.baseHeaders)

    return docIds
  }

  /**
   * Get the content (in markdown or HTML) for a given document.
   */
  async getContent(docID) {
    let content

    content = await this.httpPoster.post(
      'https://api.dropboxapi.com/2/paper/docs/download',
      null,
      Object.assign({}, this.baseHeaders, {
        'Content-Type': 'text/plain',
        'Dropbox-API-Arg': `{ "doc_id": "${docID}", "export_format": { ".tag": "${
          this.format
        }" } }`,
      }),
      { data: '' }
    )

    return content.data
  }

  /**
   * Get the meta data for a given document.
   */
  async getMeta(docID) {
    let meta

    meta = await this.httpPoster.post(
      'https://api.dropboxapi.com/2/paper/docs/get_metadata',
      { doc_id: docID },
      this.baseHeaders,
      { data: '' }
    )

    return meta.data
  }
}
