# Backend RESTful API
This project is an [express](http://expressjs.com) server template that is a good solution for production environments that need users' authentication.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/dwyl/goodparts "JavaScript The Good Parts")
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)


## Features
* **Registration/Login**. There are four types of authentication methods implemented:
    * With email: uses the [email-verification](https://www.npmjs.com/package/email-verification) library.
    * Facebook: [passport-facebook](https://github.com/jaredhanson/passport-facebook).
    * Google: [passport-google](https://github.com/jaredhanson/passport-google-oauth2).
    * Twitter: [passport-twitter](https://github.com/jaredhanson/passport-twitter).
> Note that Facebook, Google and Twitter registration/login processes uses [passport](https://www.npmjs.com/package/passport).
* **Authentication**: JSON Web Token.
* **Data Access Object**: this project includes its own DAO who's responsability is to offer database interaction functions.
* **Data validation**: all the database collections have their corresponding [mongoose](http://mongoosejs.com) schema in a *models* module.
* **Good code styling**: [eslint](https://eslint.org) and [eslint-plugin-node](https://www.npmjs.com/package/eslint-plugin-node) are included.
* **Changelog**: automatic features and bugfixes tracking in a [changelog](https://github.com/commitizen/cz-conventional-changelog) file.


## Project structure
This server has a great folders structure. Tree command output `tree -d`:
```
.
├── src
│   ├── config
│   ├── controllers
│   ├── dao
│   │   └── src
│   └── models
│       └── src
└── test
```
* **config**: contains 3 JSONs to differenciate the different environments: dev (development), stg (staging) and pro (production).
* **controllers**: have all the routes splitted in different controllers (users, authentication, socialNetworksAuth, ...).
* **dao**: exports a factory with different Data Access Objects for accessing database interaction functions.
* **models**: exports a factory containing all the models of the application.


## Getting started
* Clone repository
```
git clone https://github.com/NachoJusticia/express-restful-api-template
cd express-restful-api-template
```
* Install dependencies
```
npm install
```
* Set up the configuration requred
    * Social networks authentication: you will need to create a developer account in Facebook, Google and Twitter respectively.
    * Node-email-verification: it is required to add a valid email and password to use the SMTP service (Remember not to upload sensitive information to github).
> Note that you have to provide all the required environment variables: BASE_URL, DB_URL, JWT_TOKEN, NEV_EMAIL, NEV_PASSWORD, NODE_ENV, PORT.
    
* Server launching options:
1. In a production and staging environment.

```
npm run start
```

2. Development environment: restart server when modifying any file and save.

```
npm run start-dev
```
3. Development environment: debuggin. After using the following command attach to the proces in the port 9229 for being able to inspect the code.
```
npm run start--dev-debug
```

## Author
`Ignacio Justicia Ramos`: ignaciojusticia@gmail.com


## Contributing
Contributions are welcome, please fork this repository and send Pull Requests!
If you have any ideas on how to make this project better then please submit an issue.
