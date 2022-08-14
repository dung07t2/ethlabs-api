# EthLabs api

## _Keywords_

-   Node, express, express router
-   Firebase, cloud function, firestore db
-   Firebase emulator, auto deploy, cloudinary

## Note

-   Use yarn instead of npm is better
-   Add .env and serviceAccountKey.json (firebase app service) into root folder

## Installation

The api requires [Node.js](https://nodejs.org/) v14+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd functions
yarn
yarn serve
```

For production deployment

```sh
yarn deploy
```

## Ideas

-   I'm trying to build an website like pinterest basically.
-   The logic should control basic CRUD, authentication, user role(admin, writer, normal)
-   Improve the loading data performance by range

## Solutions

-   Im using nodejs, express and firebase as well as firebase cloud function to deploy on gcloud.

#### Controllers

-   authController: control authentication
-   adminController: CRUD an admin account
-   countController: manage total number of a object (newsFeed, admin, user) - help to improve searching and fetching all large data
-   mediaController: upload image file to cloudinary

#### Middleware

-   authorizedUserChecker

## Deployment

-   [Deployed on Gcloud](https://us-central1-rayprojects.cloudfunctions.net/ethlabs)
-   [Deployed on Heroku - old code](https://ethlabs.herokuapp.com/)

## Restful apis:

```sh
{
name: "newsFeed",
id: "2e0b5264-3ae9-48fb-b260-43b65c1854ee",
request: {
method: "POST",
header: [
{
key: "Content-Type",
value: "application/json",
Authentication: {{token}
}
],
body: {
mode: "raw",
raw: "{
        "title": "Ray News 333",
        "content": "Lorem lorem",
        "postedBy": "zLpccnYeG9ZLjddShrgEWciNJib2",
        "postedAt": "",
        "link": "https://paper.li",
        "contentUrls": ["https://medium.com", "https://vnexpress.com"],
        "imgUrls": ["https://media.istockphoto.com/photos/young-man-arms-outstretched-by-the-sea-at-sunrise-enjoying-freedom-picture-id1285301614?k=20&m=1285301614&s=612x612&w=0&h=WbwgiM4M_JWWC9ew3Mhxq1XPyfZ-Sko_RgKf7toPe7A=", "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"]
    }"
},
url: "https://us-central1-rayprojects.cloudfunctions.net/ethlabs/api/newsFeed"
},
response: [ 200 ]
},
```
