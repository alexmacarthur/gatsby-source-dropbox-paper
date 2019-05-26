const DocumentManager = require("./DocumentManager");

exports.sourceNodes = async ({
        actions,
        cache,
        createNodeId,
        createContentDigest
    },
    configOptions
) => {
    const {
        createNode, touchNode
    } = actions;
    delete configOptions.plugins;

    const documentManager = new DocumentManager(configOptions.access_token);

    console.log("\nPulling data from Dropbox Paper...\n")

    for (let id of await documentManager.getAll()) {

        let meta = await documentManager.getMeta(id);

        const postCacheKey = `dropbox-post-for-${id}`;
        const cachedPaperNode = await cache.get(postCacheKey);
        //if the prior node(s) created by this plugin haven't had an update in Dropbox Paper
        //touchNode prevents the gatsby cache from garbage collecting the nodes; we don't need to
        //fetch the content because nothing is stale.
        if (cachedPaperNode && cachedPaperNode.last_updated_date === meta.last_updated_date) {
            
            touchNode({ nodeId: cachedPaperNode.nodeId });

        } else {
            let content = await documentManager.getContent(id);

            const nodeData = Object.assign({
                content,
                ...meta
            }, {
                id: id,
                parent: null,
                children: [],
                internal: {
                    type: `DropboxPaperDocument`,
                    mediaType: 'text/markdown',
                    content: content,
                    contentDigest: createContentDigest(content),
                }
            });

            createNode(nodeData);

            //use the id from dropbox to set a deterministically referenceable position in the cache
            await cache.set(postCacheKey, {
                nodeId: id,
                last_updated_date: meta.last_updated_date
              });
        }
    }

    console.log("\nThanks for using the gatsby-source-dropbox-paper plugin. Help make it better by contributing here: https://github.com/alexmacarthur/gatsby-source-dropbox-paper\n");
}