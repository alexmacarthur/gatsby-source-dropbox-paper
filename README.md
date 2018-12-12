# Dropbox Paper Source Plugin for Gatsby

Use this plugin to pull data from a [Dropbox Paper](https://paper.dropbox.com/) account into a [Gatsby](https://www.gatsbyjs.org/) site or application. 

## Installation

1. Run `npm install gatsby-source-dropbox-paper`. 

2. Get an access token for your Dropbox account, which can be generated [here](https://dropbox.github.io/dropbox-api-v2-explorer). 

3. In your `gatsby-config.js` file, add the plugin and the access token to the `plugins` array: 

```js
plugins: [
    {
        resolve: "gatsby-source-dropbox-paper",
        options: {
            access_token: "your-access-token"
    }
]
```

You're all set!

## Usage

### Setting Output Format
By default, data will be pulled in Markdown format, but you may also specify "html" by including a `format` option: 

```js
plugins: [
    'gatsby-plugin-react-helmet',
    {
        resolve: "gatsby-source-dropbox-paper",
        options: {
            access_token: "your-access-token", 
            format: "html"
    },
},
```

### Querying for Data
You can use the following GraphQL parameters to pull specific data into your pages. This plugin purely deals with pulling the data -- not parsing any of it for display. For example, if your documents are written in Markdown, you'll need to convert it to HTML yourself after pulling.

```graphql
{
    allDropboxPaperDocument(limit: 10) {
        edges {
            node {
                content,
                doc_id,
                owner, 
                title, 
                created_date,
                status {
                    _tag
                }, 
                revision, 
                last_updated_date, 
                last_editor, 
                id, 
                internal {
                    type, 
                    content, 
                    contentDigest, 
                    owner
                }
            }
        }
    }
}
```

## The Future
Right now, this plugin pulls _all_ documents from an authenticated account, which is less than ideal. Improvements will come with changes to this plugin, as well as the evolution of the [Dropbox API](https://www.dropbox.com/developers), which has limited capabilities in terms of filtering documents to be pulled. Here's what I'd like to see in the future: 

* The ability pull documents by status. 
* The ability to pull documents by specific directory. 
* Other stuff. 

## Contributions
Please do!

## License
MIT © [Alex MacArthur](https://macarthur.me)