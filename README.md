# developer-docs

developer-docs repository

### Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview the documentation changes locally. To install, use the following command

```
npm i -g mint
```

Run the following command at the root of your documentation (where docs.json is)

```
mint dev
```

#### Troubleshooting

- It the dev environment isn't running - Run `mint install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `docs.json`
