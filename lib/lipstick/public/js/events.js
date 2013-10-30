var enableSiteDataRefresh = false

setInterval(function() {
  if (enableSiteDataRefresh) {
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/sites'
    }).done(function(d) {
      allSiteData = d
      console.log(d.length + ' problems reported')
    })
  }
}, 5000)
