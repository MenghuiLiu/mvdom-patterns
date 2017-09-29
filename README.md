mvdom-patterns is a set of mini applications put together to illustrate some simple but scalable DOM and Javascript/Typescript Centric patterns to build small to advanced Web applications. YES, simple scale better!


## Concept

- Simple scale better. 
- Patterns outlast frameworks.
- Embrace the DOM, don't fight it. 
- Mega frameworks hardcode patterns, micro frameworks enable them. 
- Frameworks comes and go, runtimes last.
- Typescript does make Javascript scale.

Used right, the DOM does not need much to become a strong foundation for scalable application model. Here are some of those patterns using the mvDom DOM Centric micro-framework (< 12kb).


## Live Demo

http://52.11.174.212:8686/


## Install & build and run

Requirement: node.js > 8.0.0


```
git clone git@github.com:mvdom/mvdom-patterns.git

cd mvdom-patterns
npm install
npm run build
npm start
```

For development, you can watch & build source files with

```
npm run watch
```

[gulp-free build](https://github.com/mvdom/mvdom-patterns/wiki/gulp-free)

## What's in

- UI Screens
  -  Home
  -  Todo MVC
  -  Dashboard (works on Linux and Mac right now, use os-top to get os data, will support Windows soon)
- Code structure (simple but scalable). 
  - `client/`
    - `web/` folder to be run by the server, with the files to be servered to browser, including the four following compiled files.
        - `client/web/js/app-bundle.js` (app code, rollup/typescript2 of `src/**/*.ts`)
        -  `client/web/js/lib-bundle.js` (rollup of `src/lib-bundle.js`)
        -  `client/web/js/templates.js` (all of the handlebars template pre-compiled.    
        -  `client/web/css/all-bundle.css` (all of the `src/**/*.pcss`
    - `src/` source file 
      - `lib-bundle.js` We split the 3rd party libs from the app bundle. (using rollup for both) 
      - `view/` for all of the view .ts, .pcss, and .tmpl (mvdom views)
      - `pcss/` common postcss
      - `elem/` small .pcss / .ts component elements.
      - `ts/` for all of the utils, service, common typescript functionalities.
      - `tsconfig.json` for client typescript compilation. 
  - `server/`
    - `src/` all of the code for the server
    - `mocha.opts` are the mocha command lines arguments for server testing
    - `tsconfig.json` for server typescript compilation (will be used by ts-node)
  - `scripts` This is where we have our build script, `build.js`
- build system
  - client: Rollup/Typescript2, postcss, and handlebars (gulp-free, webpack-free)
  - server: We use `ts-node` on the server, and therefore there are no really build step on the server. Could still run `tsc` from the `server/` folder to look at the outputted js, but their are not taken in account by `ts-node` (so, purely informative)
- App Patterns
  -  Simple but scalable (i.e. distributed) routing system & navigation.
  -  CSS Flexbox app layout.
  -  Simpler "scheduler.js" system to schedule task on a view level or manually. 

#### Folders / (files) naming conventions

Simple but useful naming convention. 

- Any folders/files starting with `~` are `.gitignore`. This is a simple but efficient way to create and identify personal, testing, or runtime related folders that should not be in git. For example.
  - `~test/...` used by the unit testing. Run `npm test` and this folder should get created.
  - `~data/` which is created by the server when the user save data
  - `client/~out` and `server/~out` that are created when optionally running `tsc` in those respective folders. 
  - `~notes/` A developer could create a notes folder for this project.

- Folders that start with `_` are folders that are not needed to run, but more for testing for example.
  - `server/src/_test` are where the server typescript test files are. 

Note: Usually, the `~folder/` should be in the root project, but some exception can be made, for example, for `client/~out` and `server/~out`, and they get convered by the `.gitignore` rule. 


## What's next

- Implement `remoteDSO` on the client, and `api/crud` on the server
