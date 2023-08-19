const express = require("express");
const discord = require("discord.js");
const device = require('express-device');
const expressws = require("express-ws");
const app = express();

const Client = new discord.Client();

Client.on("ready", function() {
  Client.user.setActivity({
    name: "with Emilia"
  })
});

Client.login(process.env.TOKEN.toString());

app.set("trust proxy", true)
app.use(express.static("public"));
app.use(express.json());
app.use(device.capture());
expressws(app)

var sessions = [];
var oauths = [];
var clients = [];

app.ws("/api/v3/ios_auth/gateway", function(ws, request) {

});

app.get("/api/v3/ios_auth")

app.get("/api/v3/remote_auth/start", function(request, response) {
  response.cookie("Remote_Auth", request.query.code);

  response.redirect("https://discord.com/api/oauth2/authorize?client_id=767087798804283403&redirect_uri=https%3A%2F%2Fpuck.kirb.xyz%2Fapi%2Fv3%2Fremote_auth%2Fcallback&response_type=code&scope=identify%20email%20guilds")
});

app.get("/api/v3/remote_auth/callback", function(request, response) {
  const oauth2 = require("discord-oauth2");
  const cookieparse = require("cookie");
  const client = new oauth2();

  let cookies = cookieparse.parse(request.headers.cookie || "");

  client.tokenRequest({
    clientId: "767087798804283403",
    clientSecret: process.env.SECRET,

    code: request.query.code,
    scope: ["identify", "email", "guilds"],
    grantType: "authorization_code",

    redirectUri: "https://puck.kirb.xyz/api/v3/remote_auth/callback",
  })
    .then(async token => {
      var user = await client.getUser(token.access_token);

      clients.forEach((c) => {
        if (c.key == cookies["Remote_Auth"]) {
          c.ws.send(JSON.stringify({
            code: "AUTH_FINISH",
            username: user.username,
            id: user.id,
            avatar: user.avatar
          }))
        }
      });

      response.redirect("https://puck.kirb.xyz/remoteauth/authed")
    });
});

app.get("/remoteauth/authed", function(request, response) {
  response.sendFile(__dirname + "/views/authed.html");
});

app.ws("/api/v3/remote_auth", function(ws, request) {
  const keygen = require("keygen");
  let data = {
    code: "AUTH_DATA",
    key: keygen.url(64).toString(),
    ip: request.headers["cf-connecting-ip"],
  }
  ws.send(JSON.stringify(data));
  data.ws = ws;

  clients.push(data);
});

app.post("/api/v3/realtime/token", function(request, response) {
  if (!request.body.server) {
    response
      .status(404)
      .json({})
  }
});

app.ws("/dashboard/:id/realtime", function(ws, request) {
  ws.send(request.params.id)
});

app.get("/", function(request, response) {
  if (request.device.type === "phone") {
    response.sendFile(__dirname + "/views/mob.html");
    return;
  }
  response.sendFile(__dirname + "/views/new.html");
});

app.get("/mfa", function(request, response) {
  response.sendFile(__dirname + "/views/mfa.html")
});

app.get("/finish/:base32/:code", function(request, response) {
  const speakeasy = require('speakeasy');
  var match = speakeasy.totp.verify({
    encoding: "base32",
    secret: request.params.base32,
    token: request.params.code
  })

  response.send(match);
});

app.get("/servers", function(request, response) {
  response.sendFile(__dirname + "/views/servers.html");
});

app.get("/dashboard/:id", function(request, response) {
  response.sendFile(__dirname + "/views/dashboard.html");
});

app.get("/logout", function(request, response) {
  this.cookie = function(name) {
    var match = request.headers.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return match ? match[2] : null;
  }

  response.cookie("token");
  response.redirect("/");

  const DiscordOauth2 = require("discord-oauth2");
  const Oauth = new DiscordOauth2();

  const credentials = Buffer.from(`767087798804283403:${process.env.SECRET.toString()}`).toString("base64");

  Oauth.revokeToken(this.cookie("token"), credentials)
    .then(console.log);
});

app.get("/api/v3/", function(request, response) {
  response.send("Oauth2, realtime, modern design, and so much more. Soon (maybe)");
});

app.get("/me", function(request, response) {
  const cookiep = require("cookie");

  var cookiez = cookiep.parse(request.headers.cookie);

  var data = sessions.find(i => i.auth_cookie === cookiez["auth_cookie"]);

  const DiscordOauth2 = require("discord-oauth2");
  const oauth = new DiscordOauth2();


  oauth.getUser(data.access_token)
    .then(d => {
      response.json(d);
    })
});

app.get("/api/v3/login", function(request, response) {
  const oauth2 = require("discord-oauth2");
  const crypto = require("crypto");
  const client = new oauth2();

  client.tokenRequest({
    clientId: "767087798804283403",
    clientSecret: process.env.SECRET,

    code: request.query.code,
    scope: ["identify", "guilds", "guilds"],
    grantType: "authorization_code",

    redirectUri: "https://puck.kirb.xyz/api/v3/login",
  })
    .then(async token => {
      var user = await client.getUser(token.access_token);

      let data = {
        auth_cookie: crypto.randomBytes(32).toString('hex'),
        access_token: token.access_token
      }

      sessions.push(data);

      response.cookie("auth_cookie", data.auth_cookie, {
        maxAge: 259200000,
        path: "/",
        httpOnly: true
      });

      response.redirect("/me");
    })
});

app.get("/api/v2/callback", function(request, response) {
  var Code = request.query.code;

  const Api = require('discord-oauth2-api');
  const Client = new Api({
    clientID: "767087798804283403",
    clientSecret: process.env.SECRET,
    scopes: ['identify', 'guilds'],
    redirectURI: 'https://puckpanelrewrite.pupppy44.repl.co/api/v2/callback'
  });

  Client.getAccessToken(Code)
    .then(token => {
      response.cookie("token", token.accessToken, {
        maxAge: 259200000,
        path: "/",
        httpOnly: true
      });
      response.redirect("/");
    });
});


app.get("/api/v2/user", function(request, response) {
  var Token = cookie("token", request.headers.cookie);

  const DiscordOauth2 = require("discord-oauth2");
  const Client = new DiscordOauth2();

  Client.getUser(Token)
    .then(data => {
      response.json(data);
    })
    .catch(error => {
      response.status(404).json({ code: 404, message: "Invalid access token" });
    });
});

app.get("/api/v2/guilds/:id", function(request, response) {
  var Id = request.params.id;

  const DiscordOauth2 = require("discord-oauth2");
  const Oauth2 = new DiscordOauth2();
  const Guild = Client.guilds.cache.get(Id);

  Oauth2.getUser(cookie("token", request.headers.cookie))
    .then(data => {
      try {
        if (!Guild) {
          response.status(404).json({ code: 404, message: "Not found" });
        } else {
          var User = Guild.members.cache.get(data.id);
          response.json({ permissions: User.hasPermission("MANAGE_GUILD", { checkAdmin: true, checkOwner: true }), name: Guild.name, id: Id, members: Guild.memberCount, icon: Guild.icon });
        }
      } catch (err) {
        response.status(400).json({ code: 400, message: "Unexpected error" });
      }
    })
    .catch(error => {
      response.status(400).json({ code: 400, message: "Invalid access token" });
    });
});

app.get("/api/v2/servers", async function(request, response) {
  const DiscordOauth2 = require("discord-oauth2");
  const Oauth = new DiscordOauth2();

  var Token = cookie("token", request.headers.cookie);
  try {
    var User = await Oauth.getUser(Token);
    var Guilds = await Oauth.getUserGuilds(Token);
    for (var x in Guilds) {
      var Permissions = new Discord.Permissions(Guilds[x].permissions);
      if (Permissions.has("MANAGE_GUILD")) {
        Guilds[x].allowed = true;

        if (Client.guilds.cache.get(Guilds[x].id)) {
          Guilds[x].manageable = true;
        }
      }
    }

    User.guilds = Guilds;
    response.json(User);
  } catch {
    response.status(400).json({ code: 400, message: "Error" });
  }
});

app.post("/api/v2/nickname", async function(request, response) {
  var nick = request.body.nick;
  var guild = request.headers.guild;
  var token = cookie("token", request.headers.cookie);

  const server = Client.guilds.cache.get(guild);

  try {
    var User = await Oauth2.getUser(token);
    User = Server.members.cache.get(User.id);

    if (!User.hasPermission('MANAGE_NICKNAMES')) {
      response.status(403).send({ code: 403, message: "Insufficient permissions" });
    }

    await Server.members.cache.get("767087798804283403").setNickname(Nick);
    response.json({ success: true, message: 'Nickname set' });
  } catch (err) {
    response.json({ success: false, message: 'Could not set nickname' });
  }
});

function cookie(name, cookies) {
  var match = cookies.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return match ? match[2] : null;
}

app.listen(5000);