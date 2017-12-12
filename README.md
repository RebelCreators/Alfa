# Alfa
Nodejs server for Bravo client

## Docs

https://rebelcreators.github.io/AflaDocs.github.io/

## Setup:

Install [mongo DB](https://docs.mongodb.com/manual/installation/)

Install [nodeJS](install node js windows)

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