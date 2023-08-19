Notiflix.Loading.Init({svgColor:"#cbdadc"});
Notiflix.Loading.Circle();

fetch("/api/v2/guilds/" + Param(1))
.then(res => res.json())
.then(response => {
  if (response.code) {
    return;
  } else {
    if (!response.permissions) {
      return;
    }

    Notiflix.Loading.Remove();
  }
});

function Param(idx) {
   const routeTokens = location.pathname.replace(/^\/+/g,'').split('/')

   return routeTokens.length > idx ? routeTokens[idx] : undefined;
};

function Cookie(name) {
    var match = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return match ? match[2] : null;
}