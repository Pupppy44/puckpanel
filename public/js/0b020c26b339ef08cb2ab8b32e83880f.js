Notiflix.Notify.Init({
  position: 'right-bottom',
  fontFamily: "Manrope",
  fontSize: '13px',
  plainText: false
});

Notiflix.Loading.Init({ svgColor: "#cbdadc" });
Notiflix.Loading.Circle();

var Token = Cookie("token");

fetch("/api/v2/servers", {
  headers: {
    "Content-type": "application/json",
    "token": Token
  }
})
  .then(res => res.json())
  .then(response => {
    Notiflix.Loading.Remove();

    for (var x in response.guilds) {
      var Guild = response.guilds[x];
      if (Guild.allowed) {
        var IconDiv = document.createElement("div");
        IconDiv.title = Guild.name;
        IconDiv.id = Math.random().toString(32).slice(2);
        var Icon = document.createElement("img");
        Icon.id = Guild.id;
        if (!Guild.icon) {
          Icon.src = "https://cdn.discordapp.com/embed/avatars/0.png";
        } else {
          Icon.src = `https://cdn.discordapp.com/icons/${Guild.id}/${Guild.icon}.png`;
        }
        if (Guild.manageable) {
          Icon.onclick = function() {
            window.location.replace("/dashboard/" + this.id);
          }
          Icon.style = "cursor: pointer; border-radius: 17.5px; width: 80px; margin: 10px; border: 1px solid #32c682;";
        } else {
          Icon.onclick = function() {
            window.location.replace(`https://discord.com/oauth2/authorize?&client_id=767087798804283403&permissions=8&guild_id=${this.id}&redirect_uri=https%3A%2F%2Fpuckpanel.glitch.me%2Fservers&scope=bot`);
          }
          Icon.style = "cursor: pointer; filter: grayscale(100%); border-radius: 17.5px; width: 80px; margin: 10px; border: 1px solid #f75454;";
        }
        Icon.title = Guild.name;
        document.getElementById("servers").append(IconDiv);
        document.getElementById(IconDiv.id).append(Icon);

        jQuery(`#${Icon.id}`).tooltip({ placement: 'top' });
        jQuery('[data-toggle="tooltip"]').tooltip();
      }
    }
  });

function Cookie(name) {
  var match = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return match ? match[2] : null;
}