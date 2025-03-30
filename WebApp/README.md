# React + Vite Setup Guide

This guide will help you set up a React project using Vite.

## Installation

First, install Vite and create a new React project:

```sh
npm create vite@latest my-react-app --template react-ts
cd my-react-app
```

Then, install dependencies:

```sh
npm install
```

## Running the Development Server

Start the development server with:

```sh
npm run dev
```

By default, the server runs on [http://localhost:5173](http://localhost:5173).

## Building for Production

To build your project for production, run:

```sh
npm run build
```

The output will be in the `dist` folder.

## Additional Configuration

You can configure ESLint and Prettier for better code quality.

To install ESLint:

```sh
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
```

To install Prettier:

```sh
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

Happy coding! 🚀
