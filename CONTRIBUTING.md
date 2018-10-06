# Contributing

## Important
Don't edit files in the `dist` directory, otherwise those changes will be overwritten. Use grunt to generate the `dist` files.

### Code style
Please adhere to the code style (e.g. indentation, whitespace) you already see in the source code.

## Making changes
Please make sure you have the latest versions of [node.js](http://nodejs.org/), [npm](http://npmjs.org/) and [grunt](http://gruntjs.com/getting-started) installed.

1. Fork and clone the GuideJS repository.
1. Run `npm install` to install the dependencies.
1. Run `grunt` to start the watch task.

**Important**: Please don't work on the `master` branch. Rather create your own feature branches and submit pull requests, when you are done.

If you didn't get any errors, you are ready to start. Grunt is now watching the `source` directory for changes to `*.js` and `.scss` files and automatically creates the necessary files in the `dist` directory.