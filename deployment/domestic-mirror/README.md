# Domestic documentation mirror

The public source remains GitHub Pages. Every successful `main` build also sends
the same static export to `https://service.pikso.art/AIIGovernance-docs/`.

The `aiigdocs` SSH key is restricted by `authorized_keys` to
`/usr/local/sbin/aiig-docs-deploy`. It cannot request an interactive shell,
forward ports, or run a caller-selected command. Releases are extracted below
`/data/aiigovernance-docs/releases` and activated with an atomic symlink move.

Required repository secret:

- `AIIG_DOCS_DEPLOY_KEY`: private half of the dedicated Ed25519 key.

Server files:

- `/usr/local/sbin/aiig-docs-deploy`
- `/etc/nginx/snippets/aiigovernance-docs.conf`
- `/data/aiigovernance-docs/current`
