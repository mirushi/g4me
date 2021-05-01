var app = {
  overlay: {
    emptyMargin: 0,
    setTopOfModal: function(olWrap) {
      olWrap.find('.ol').css('max-height', ($(window).height()-this.emptyMargin)+'px');

      var olWrapTop = ($(window).height() - olWrap.outerHeight()) / 2;
      olWrap.css('top', olWrapTop+'px');
    },
    show: function(olWrap, onClose, msg, opt) {
      var blockScreen = $('#block-screen');
      var olClose = olWrap.find('.ol-close');

      if (msg) {
        var $olMessage = olWrap.find('.ol-message');

        if (opt && opt.styleOlMessage) {
          if ($olMessage) {
            $olMessage.css(opt.styleOlMessage);
          }
        }

        if (opt && opt.styleOlWrap) {
          olWrap.css(opt.styleOlWrap);
        }

        if ($olMessage) {
          $olMessage.html(msg);
        }
      }

      if ($(window).height() < olWrap.outerHeight()) {
        if ($olMessage) {
          $olMessage.css('height', 0);
          var olMessageHeight = $(window).height() - olWrap.outerHeight() - 50;

          $olMessage.css('height', olMessageHeight + 'px');
        }
      }

      olWrap.css('max-height', $(window).height()+'px');

      var olWrapTop = ($(window).height() - olWrap.outerHeight()) / 2;
      olWrap.css('top', olWrapTop+'px');

      olWrap.addClass('show');
      olClose.off('click').on('click', function() { app.overlay.close(olWrap, onClose); });
      blockScreen.addClass('show').off('click').on('click', function() { app.overlay.close(olWrap, onClose); });
    }
    , close: function(olWrap, onClose) {
      var isNotClose = false;
      if (onClose) {
          isNotClose = onClose(olWrap);
      }

      if (isNotClose) { return false; }

      var blockScreen = $('#block-screen');
      olWrap.removeClass('show');
      blockScreen.removeClass('show');
    }
  }
};

app.movieOverlay = {
  show: function($olMovieWrap,ended) {
    window.previousOlMovieWrap = $olMovieWrap;
    window.isPreview = $('#content_preview').length ? true : false;

    var $player = $olMovieWrap.find('div.player');
    var playerId = $player.attr('id');
    var movieInfo = $.parseJSON($olMovieWrap.find('input.movie-info').val());
    var videoWidth = Math.min(screen.width, movieInfo.width);
    var videoHeight = movieInfo.height * videoWidth / movieInfo.width;

    var heightWindow = $(window).height();
    var elmVideo = $olMovieWrap.find('video');
    elmVideo.css('height', '');

    var videoTag = ""
      + "<video id=\"video_" + playerId + "\" class=\"video-js vjs-default-skin\" type=\"application/x-mpegURL\""
      + " poster='" + movieInfo.thumbnailUrl + "'"
      + " width='" + videoWidth + "' height='" + videoHeight + "'"
      + " data-setup='{\"techOrder\": [\"html5\", \"flash\"], \"sourceOrder\": true}' "
      + " controls data-viblast-key=\"40bcf2f0-33e0-49cf-a5aa-21014705b074\">"
      + "<source src=\"" + movieInfo.movieUrl + "\" type=\"application/x-mpegURL\">"
      + "</video>";

    $("#" + playerId).html(videoTag);

    videojs('#video_' + playerId, {
      autoplay: true,
      preload: 'none',
      techOrder: ["html5", "flash"],
      bandwidth: 4194304,
      hls: {
        bandwidth: 4194304,
      }
    }).ready(function(){
      var video = this;
      var hasShowedBlob = false;
      console.log("Script injected.");
      video.on('ended', function(e) {
          if( ended ){ ended(); }

          if ($('#video_' + playerId).length) {
            var obj_videojs = videojs('#video_' + playerId);
            obj_videojs.pause();
              obj_videojs.dispose();
          }
          app.overlay.close( $olMovieWrap );
      });
    });

    var btns = document.querySelectorAll(".plyr__play-large");
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.cursor = "pointer";
    }

    app.overlay.show($olMovieWrap, function(olWrap) {
      msg=$("#closeMsg").text();
      if( msg ){}else{ msg='Are you sure you want to stop this video ?'; }

      swal({
        title: msg
        , text: ''
        , type: null
        , showConfirmButton: true
        , confirmButtonText: "OK"//"Close"
        , showCancelButton: true
        , cancelButtonText: "Cancel"//キャンセル"//"Back to video"
        , closeOnConfirm: true
      }, function() {

        if ($('#video_' + playerId).length) {
          var obj_videojs = videojs('#video_' + playerId);
          obj_videojs.pause();
          obj_videojs.dispose();
        }

        var blockScreen = $('#block-screen');
        olWrap.removeClass('show');
        blockScreen.removeClass('show');
      });

      return true;
    });

  }
};

