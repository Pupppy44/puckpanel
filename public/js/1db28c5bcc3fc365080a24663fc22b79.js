document.getElementById("login").onclick = function() {
  window.location.href = "https://discord.com/api/oauth2/authorize?client_id=767087798804283403&redirect_uri=https%3A%2F%2Fpuckpanelrewrite.pupppy44.repl.co%2Fapi%2Fv2%2Fcallback&response_type=code&scope=identify%20guilds";
};

Notiflix.Notify.Init({
  position:'right-bottom',
  fontFamily: "Manrope",
  fontSize: '13px',
  plainText: false
});

if (!document.cookie.split('; ').find(row => row.startsWith('seen'))) {
  Notiflix.Notify.Info("Click here to see what's new for the panel", function() {
  Notiflix.Report.Info(
    "Update",
    'The panel has gotten remade. Hope you enjoy it!',
    'Close',
    function() {
      document.cookie = "seen=true; expires=Fri, 31 Dec 9999 23:59:59 GMT"
    }
  );
  });
}