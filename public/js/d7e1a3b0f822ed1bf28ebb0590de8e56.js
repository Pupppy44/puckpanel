$(document).ready(function () {
  jQuery('[data-toggle="tooltip"]').tooltip();
});

fetch("/api/v2/user")
.then(res => res.json())
.then(response => {
  if (response.code == 404) return;

  document.getElementById("settings").innerHTML = '<button id="login" class="w3-button"><img class="user-icon" src="https://cdn.discordapp.com/avatars/' + response.id + '/' + response.avatar + '.png" width="20px">' + " " + response.username + '</button><div class="w3-dropdown-content w3-bar-block w3-card-4"><a onclick="confirmLogout()" class="w3-button">Logout</a></div>';
});

function Cookie(name) {
    var match = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return match ? match[2] : null;
}

function confirmLogout() {
  Notiflix.Confirm.Init({
    titleColor: "#262323",
    cancelButtonBackground: "#f75454"
  });
  Notiflix.Confirm.Show(
    'Logout', 
    'Are you sure you want to logout?', 
    'Yes', 
    'No', 
    function() {
      window.location.href = "https://puckpanelrewrite.pupppy44.repl.co/logout"
    });
}