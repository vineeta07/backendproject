require('dotenv').config();
const express = require("express");
const app = express();
const port = 4000;
const githubDAta = {
  "login": "vineeta07",
  "id": 190806539,
  "node_id": "U_kgDOC196Cw",
  "avatar_url": "https://avatars.githubusercontent.com/u/190806539?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/vineeta07",
  "html_url": "https://github.com/vineeta07",
  "followers_url": "https://api.github.com/users/vineeta07/followers",
  "following_url": "https://api.github.com/users/vineeta07/following{/other_user}",
  "gists_url": "https://api.github.com/users/vineeta07/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/vineeta07/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/vineeta07/subscriptions",
  "organizations_url": "https://api.github.com/users/vineeta07/orgs",
  "repos_url": "https://api.github.com/users/vineeta07/repos",
  "events_url": "https://api.github.com/users/vineeta07/events{/privacy}",
  "received_events_url": "https://api.github.com/users/vineeta07/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": "VINEETA KUMARI MEENA",
  "company": "dtu",
  "blog": "",
  "location": "bawana ,delhi ",
  "email": null,
  "hireable": null,
  "bio": " interested in coding",
  "twitter_username": null,
  "public_repos": 11,
  "public_gists": 0,
  "followers": 2,
  "following": 5,
  "created_at": "2024-12-06T05:13:13Z",
  "updated_at": "2025-09-14T03:23:58Z"
}

app.get("/" , (req , res)=>{
    res.send( "hello there")
})

app.get("/twitter" , (req , res)=>{
    res.send("vineetameenadotcom")
})

app.get("/youtube", (req , res)=>{
    res.send(" hello world")
})
app.get("/login" , (req,res)=>{
    res.send("<h1> please login to access  your account <h1>")
})
app.get("/github" ,(req , res)=>{
    res.json(githubDAta)
})

app.listen( process.env.PORT , ()=>{
    console.log(`App is listening on port ${port}`)
})

