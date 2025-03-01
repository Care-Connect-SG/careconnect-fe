# CareConnect Frontend

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Make sure you install the dependencies when you clone the project for the first time. Use whichever command below corresponding to your favourite package:

```shell
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Create a `.env` file in the root directory (same location as the `package.json` file) to include the environment variables needed for the server to work properly (see `.env.example`).

3. Run the development:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Workflow

See Jira for list of existing issues and to create branches for them.

## Formatting and Code Style

Whenever you are done coding, make sure to always fix linting errors before doing a pull request. You can either use an eslint extension for your IDE or run `npm run lint:fix` to fix linting errors. If you only wish to check whether your code has any linting errors, run `npm run lint` instead.

## Committing Changes

We will be loosely following [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) guideline for our commit messages. See the table below for the list of commit types.

| Type     | Description                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| feat     | Commits that add a new feature                                                        |
| fix      | Bug fixes                                                                             |
| test     | Addings or changing tests, basically any change within the `test` directory           |
| refactor | Changes to source code that neither add a feature nor fixes a bug                     |
| build    | Changes to CI or build configuration files (Docker, github actions)                   |
| chore    | Anything else that doesn't modify any `src` or `test` files (linters, tsconfig, etc.) |
| revert   | Reverts a previous commit                                                             |

## Contributing

We welcome contributions to the CareConnect Backend project. To contribute, please follow these steps:

1. Create a new branch (`git checkout -b feature-branch`).
2. Make your changes.
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
