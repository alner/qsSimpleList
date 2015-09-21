# Qlik Sense visualization template (ES2015 + BABEL + WebPack + GulpJS)

Supports ES2015 (BABEL), bundling multiple modules (WEBPACK), hot rebuilds and browser refresh in response to file modifications.

## Installation

Download and unzip template to appropriate folder.

Make sure you have NodeJS and NPM installed.

Hit

```sh

 npm install

 ```
 to install all required dependencies.

## Configuration

Modify *src/Template.qextmpl*.

Set appropriate Qlik Sense document **url** parameter in the *server.config.json*.
Set appropriate local development server port (**devServerPort** parameter) in the *server.config.json*. Default value is 8080.
Set **buildFolder** for production release in the *server.config.json* (default value is *build/*).

## Usage

Hit
```
npm run dev 
```
for development.

Open **http://localhost:8080** for development. Edit src/component.js.

Hit
```
npm run build
```
for production.

**build/** folder will contain all files, including zip file ready to deploy.

## Maintainers

[alner](https://github.com/alner)

## License

MIT