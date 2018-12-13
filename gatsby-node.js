const DocumentManager = require("./DocumentManager");

exports.sourceNodes = async ({
        actions,
        createNodeId,
        createContentDigest
    },
    configOptions
) => {
    const {
        createNode
    } = actions;
    delete configOptions.plugins;

    const documentManager = new DocumentManager(configOptions.access_token);

    console.log("\nPulling data from Dropbox Paper...\n")

    for (let id of await documentManager.getAll()) {

        let meta = await documentManager.getMeta(id);
        let content = await documentManager.getContent(id);

        const nodeData = Object.assign({
            content,
            ...meta
        }, {
            id: createNodeId(id),
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
    }

    console.log("\nThanks for using the gatsby-source-dropbox-paper plugin. Help make it better by contributing here: https://github.com/alexmacarthur/gatsby-source-dropbox-paper\n");
}