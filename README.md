# Hydrus-react

Hydrus-react is a web app using [hydrus API](https://github.com/hydrusnetwork/hydrus). The goal is to give a viewing experience similiar to booru/pixiv where using tags and similiar/related files takes you on a journey through your library.
Inspired by somewhat clunky tag interactions in [hydrus-web by floogulinc](https://github.com/floogulinc/hydrus-web)

Project is a W.I.P. - not much thought put in styling of elements, app will look weird on mobiles, some edge cases might cause trouble. Though it shouldn't break your hydrus instance as currently there are only GET requests.


## What's currently in
 - Browsing your files in booru style
 - Simple comics support
 - Related files functionality
 
## Requirements
 - [Hydrus](https://github.com/hydrusnetwork/hydrus) instance with client API turned on [GUIDE](https://hydrusnetwork.github.io/hydrus/client_api.html)
 - [NodeJS](https://nodejs.dev)

## Running the app
1. Clone repository
2. run **npm install**
3. run **npm start**
4. connect to http://localhost:3000

## Configuration
In the settings page you have to point to your client API address (by default http://127.0.0.1:45869 ) add your access key (you can copy it from under *services/review services/client api*).
