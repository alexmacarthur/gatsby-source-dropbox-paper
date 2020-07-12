const DocumentManager = require('./DocumentManager')

exports.sourceNodes = async (
  { actions, cache, createContentDigest, reporter },
  configOptions
) => {
  const { createNode, touchNode } = actions
  delete configOptions.plugins
  const format = configOptions.format ? configOptions.format : 'markdown'
  const {
    maxRetryCount = 4,
    retryDelayMs = 0,
    shouldRetry = false,
  } = configOptions
  const documentManager = new DocumentManager(
    configOptions.access_token,
    format,
    { maxRetryCount, retryDelayMs, shouldRetry }
  )

  reporter.info('Pulling data from Dropbox Paper...')

  for (let id of await documentManager.getAll()) {
    let meta = await documentManager.getMeta(id)

    const postCacheKey = `dropbox-post-for-${id}`
    const cachedPaperNode = await cache.get(postCacheKey)
    //if the prior node(s) created by this plugin haven't had an update in Dropbox Paper
    //touchNode prevents the gatsby cache from garbage collecting the nodes; we don't need to
    //fetch the content because nothing is stale.
    if (
      cachedPaperNode &&
      cachedPaperNode.last_updated_date === meta.last_updated_date
    ) {
      touchNode({ nodeId: cachedPaperNode.nodeId })
    } else {
      let content = await documentManager.getContent(id)

      const nodeData = Object.assign(
        {
          content,
          ...meta,
        },
        {
          id: id,
          parent: null,
          children: [],
          internal: {
            type: `DropboxPaperDocument`,
            mediaType: 'text/markdown',
            content: content,
            contentDigest: createContentDigest(content),
          },
        }
      )

      createNode(nodeData)

      //use the id from dropbox to set a deterministically referenceable position in the cache
      await cache.set(postCacheKey, {
        nodeId: id,
        last_updated_date: meta.last_updated_date,
        contentUpdated: true, //provide flag for any other cached consumers of this data
      })
    }
  }

  reporter.info(
    'Thanks for using the gatsby-source-dropbox-paper plugin. Help make it better by contributing here: \nhttps://github.com/alexmacarthur/gatsby-source-dropbox-paper'
  )
}
