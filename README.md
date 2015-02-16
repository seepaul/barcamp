# Barcamp App #

This repository contains a web app that helps barcamps with the registration of event attendees. 

This app was developed during the organization of the Barcamp Graz 2015 in Austria.

# Prerequisites #

You need NodeJS installed on your workstation:

<http://nodejs.org/download/>

# Installing dependencies #

Navigate into the project directory an run

```bash
npm install
```

This will install all necessary dependencies.

# Setup database and configuration  #

Make sure that you have MySQL installed and running.

Create a __default.json__ in the __config__ directory and fill it with the info found in __config/default.json.example__. Make sure to adjust the database connection according to your local environment.

```bash
{ 
  "general": {
  "Websitename": "Barcamp",
  "mail_contact": "name@mailprovider.com"
  },
"database": {
  "host": "localhost",
  "port": "5984",
  "name": "your_db_name",
  "username": "your_username",
  "password": "your_password",
  "options": {
    "dialect": "mysql"
    }
  },
  "database-version": "latest",
  "fixtures-version": "latest",
  "logger" : {
    "clevel": "WARN",
    "mlevel": "ERROR",
    "appenders": [
        { "type": "console", "category": "console"},
        { "type": "file", "filename": "./barcamp.log", "category": "file" },
        { "type": "smtp", "recipients": "name@mailprovider.com", "sendinterval": "5", "sender": "noreply@mailprovider.com", "transport": "SMTP", 
            "SMTP": {
                "host": "smtp.mailprovider.com",
                "secureConnection": false,
                "port": "587",
                "auth": {
                    "user": "noreply@mailprovider.com",
                    "pass": "just2send"
                },
                "debug": false
            },
        "category": "mail"
    }
    ],
    "replaceConsole": true
  }
  "email": {
    "smtpHost": "localhost",
    "secureConnection": false,
    "port": 25,
    "sender": "noreply@barcamp-graz.at",
    "subjectWelcome": "[BarCamp Graz] Anmeldung"
  }
}
```

Also create a __development.json__ file inside the __config__ directory. Fill it with the info found in __config/__development.json.example__.

```bash
{
 "logger" : {
    "clevel": "DEBUG",
    "mlevel": "WARN",
    "appenders": [
        { "type": "console", "category": "console"},
        { "type": "file", "filename": "/home/user/Workspace/barcamp/barcamp.log", "category": "file" },
       { "type": "smtp", "recipients": "user@mailprovider.com", "sendinterval": "5", "sender": "noreply@mailprovider.com", "transport": "SMTP", 
            "SMTP": {
                "host": "smtp.mailprovider.com",
                "secureConnection": false,
                "port": "587",
                "auth": {
                    "user": "noreply@mailprovider.com",
                    "pass": "just2send"
                },
                "debug": true
            },
        "category": "mail"
    }
    ],
    "replaceConsole": true
  },
  "database-version": "latest"
}
```


# Starting the server  #

Set the NODE_ENV variable in your shell environments:

```
export NODE_ENV=development
```

Start the server with

```
node barcamp-server.js
```

# Authors #

|                      |                                              |
|:---------------------|:---------------------------------------------|
**Author**    | Paul Rudolf Seebacher (<mail@seepaul.org>) 
**Author**    | Jürgen Brüder (<hello@juergenbrueder.com>)