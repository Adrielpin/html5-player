var url = "http://107.191.38.218";
var port = "9828";

var mediaplay = sessionStorage.getItem('mediaplay');

var obj = document.createElement("audio");
obj.src = url+":"+port+"/live";
obj.crossOrigin = "anonymous";
obj.volume = 0.5;
obj.autoPlay = true;
obj.preLoad = true;
obj.controls = true;

$('document').ready( function () {
    
    songTitle();
    setInterval(songTitle, 30000);
    
    if(mediaplay === 'true') {
        mediaPlay();
    }
    
    $('.button-play').click(function () {
        mediaPlay();
    });
    
    $('.button-pause').click(function() {
        mediaPause();
    });
    
    $('.button-volume-plus').click(function () {
        mediaVolumePlus();
    });
    
    $('.button-volume-minus').click(function() {
        mediaVolumeMinus();
    });
    
    $('.volume-range').change(function () {
        volumeRange();
    });
    
    $('.buttom-maximize').click(function () {
        maximizePlayer()
    });
    
    $('.button-minimize').click(function () {
        minimizePlayer();
    });    
});

document.addEventListener('fullscreenchange', exitHandler);
document.addEventListener('webkitfullscreenchange', exitHandler);
document.addEventListener('mozfullscreenchange', exitHandler);
document.addEventListener('MSFullscreenChange', exitHandler);

function exitHandler() {
    if (document.fullscreenElement) {
        minimizePlayer();
    }
}

function maximizePlayer() {
    var docelem = document.documentElement;
    
    if (docelem.requestFullscreen) {
        docelem.requestFullscreen();
    }
    else if (docelem.mozRequestFullScreen) {
        docelem.mozRequestFullScreen();
    }
    else if (docelem.webkitRequestFullScreen) {
        docelem.webkitRequestFullScreen();
    }
    else if (docelem.msRequestFullscreen) {
        docelem.msRequestFullscreen();
    }
    
    $('.screem').fadeIn(300);
    $('.bar').fadeOut(300);
}

function minimizePlayer() {
    
    var docelem = document;
    
    if(docelem.exitFullscreen) {
        docelem.exitFullscreen();
    } 
    else if(docelem.mozCancelFullScreen) {
        docelem.mozCancelFullScreen();
    } 
    else if(docelem.webkitExitFullscreen) {
        docelem.webkitExitFullscreen();
    }
    
    $('.bar').fadeIn(300);
    $('.screem').fadeOut(300);
}

function mediaPlay() {
    sessionStorage.setItem("mediaplay", 'true');
    $('.button-play').hide();
    $('.button-pause').show();
    obj.play();
    bars();
}

function mediaPause() {
    sessionStorage.setItem("mediaplay", 'false');
    $('.button-pause').hide();                
    $('.button-play').show();
    obj.pause();
}

function mediaVolumePlus() {
    if (obj.volume < 0.9){
        obj.volume += 0.1;
        $('.volume-range').val(obj.volume*100);
    }
}

function mediaVolumeMinus() {
    if (obj.volume > 0.1){
        obj.volume -= 0.1;
        $('.volume-range').val(obj.volume*100);
    }
}

function songTitle() {
    
    $.ajax({
        url: 'http://107.191.38.218:9828/stats',
        type: 'GET',
        crossDomain: true,
        dataType: 'jsonp',
        data : {'json' : 1},
        success: function (data) { getSongTitle(data)},
        error: function (err) { $('.live').html('Aguarde - Lagoa.live ...') }
    });
}

function getSongTitle(data) {
    
    if(data.songtitle)
    {
        $('.live').html(data.songtitle);
        
    }
    else {
        $('.live').html('Aguarde - Lagoa.live ...');
    }
}

function volumeRange() {
    obj.volume = $('.volume-range').val()/100;
}

function bars() {
    
    
    var context = new AudioContext();
    var src = context.createMediaElementSource(obj);
    var analyser = context.createAnalyser();
    
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");
    
    src.connect(analyser);
    analyser.connect(context.destination);
    
    analyser.fftSize = 256;
    
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    
    var dataArray = new Uint8Array(bufferLength);
    
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    
    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    
    function renderFrame() {
        requestAnimationFrame(renderFrame);
        
        x = 0;
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 2.5;
            ctx.fillStyle = "rgb(30,144,255)";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    renderFrame();
}