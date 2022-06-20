# Hydrus-react

Hydrus-react is a web app written in React/TypeScript using [hydrus API](https://github.com/hydrusnetwork/hydrus). The goal is to give a viewing experience similiar to booru/pixiv where using tags and similiar/related files takes you on a journey through your library.
Inspired by somewhat clunky tag interactions in [hydrus-web by floogulinc](https://github.com/floogulinc/hydrus-web)


## Features
 - Browsing your files in booru style
 - Simple comics support (currently just a list of first pages of all your comics)
 - Support for OR searching
 - Image Grouping in searches
 - Related files functionality (quick look at other files inside same image group)
 - Configurable namespaces for comics and grouping
 - Desktop and mobile support
 
## Requirements
 - [Hydrus](https://github.com/hydrusnetwork/hydrus) instance with client API turned on [GUIDE](https://hydrusnetwork.github.io/hydrus/client_api.html)
 - [NodeJS](https://nodejs.dev)

## Running the app (development mode)
1. Clone repository
2. run **npm install**
3. run **npm start**
4. connect to http://localhost:3000

## Running the app (production mode)
1. Clone repository
2. run **npm install**
3. run **npm install -g serve** (might require admin rights depending on system)
4. run **npm run build** 
5. run **serve -s build**
6. connect to http://localhost:3000

While slightly harder to get running production mode might get better performance.


## Configuration
In the settings page you have to point to your client API address (by default http://127.0.0.1:45869 ) add your access key (you can copy it from under *services/review services/client api*).
