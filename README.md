# now-deployments

Inspired by the work of [iam4x](https://github.com/iam4x/now-deploy-preview-comment)

## Requirements


## Example

```yaml
name: deploy-sample
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: mergermarket/now-deployments@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          zeit-token: ${{ secrets.ZEIT_TOKEN }}
          now-args: -env ENV_VAR=VAR1 --build-env BUILD_VAR=${{ secrets.SECRET_VAR }}
```

## Development

- Run `npm i` to install deps
- Update action code
- Run `npm run all` to lint and pack the code
