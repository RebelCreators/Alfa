# Alfa
Nodejs server for Bravo client

## Docs

https://rebelcreators.github.io/AflaDocs.github.io/

## Setup:

Install [mongo DB](https://docs.mongodb.com/manual/installation/)

Install [nodeJS](install node js windows)

Install and set up a redis server.
https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298

Environment Variables are set in a alfo.json file
that should be copied into ~/.env/alfa.json (This file should not be checked in)

This file holds configuration data for the alfa server environment.
Example ~/.env/alfa.json:

```
{
"ALFA_PORT":3000,
"ALFA_REDIS_HOST":"Your-Redis-Host",
"ALFA_REDIS_PORT":6379,
"ALFA_SOCKET_PORT":5225,
"ALFA_CLIENT_SECRET":"A Random Sercret",
"ALFA_CLIENT_ID":"A Random Client ID",
"ALFA_DB":"mongodb://localhost:27017/AlfaV2",
"PUSH_APP_BUNDLE": "MyAppBundle",
"APNS_KEY_ID": "YOUR-APNS-KEY-ID",
"APNS_TEAM_ID": "YOUR-TEAM-ID"
}
```

ssh</p>
`scp ~/.env/alfa_local_copy.json user@host:~/.env/alfa.json`


Clone Alfa Repo.

**Use the terminal**<br>
In the Alfa repo directory run `npm install`

To start server go to the Server directory and enter this command `./server.sh start`

## Setting Up S3

 run these commands 
``` 
 mkdir ~/.aws
 touch ~/.aws/credentials

 ```

  edit the ~/.aws/credentials file to match credentials.

 Example.

``` 
[default]

aws_access_key_id = ############################

aws_secret_access_key = ##########################

region=us-west-1

```

  Create a directory named "tmp" in the server directory,  where the app.js file is located.
  

## Docs

To create docs open a terminal and run this in the Modules/Alfa directory.
`rm -Rf docs && jsdoc -c jsdoc.conf`

Or run the `docs.sh` script in the Modules/Alfa directory.
