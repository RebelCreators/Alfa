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

To create docs run this in the Modules/Alfa directory.
`jsdoc ./models -r ./lib -r ./routes/index.js ./node_modules/afimport/index.js ./server.js -d ./docs`

Or run the `docs.sh` script in the Modules/Alfa directory.
