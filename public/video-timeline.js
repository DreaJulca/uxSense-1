var video = document.getElementById("ux-video");
var vidDuration = 0;
var vidTimelineInterval = 30;
var vidTimelineFrameCount = 4;


function videoCanvasGenerator(i){
    if(window.isFirefox){
        setTimeout('generateThumbnail(' + i + ')', 400);
    } else {
        if(video.readyState > 1){
            generateThumbnail(i);
        } else {
            setTimeout('videoCanvasGenerator(' + i + ')', 100);
        }
    }

}

function vidTimelineRecur(i){

    if(i < vidDuration){
        video.currentTime = i;
        video.play()
        video.addEventListener('loadeddata', videoCanvasGenerator(i), once=true);
    } else {
        video.currentTime = 0;
        video.play();
    }
}

video.addEventListener('loadeddata', function () {
        video.pause();
        vidDuration = video.duration;
        vidTimelineInterval = Math.round(vidDuration/vidTimelineFrameCount);
        vidTimelineRecur(0)
    }, once=true);

    function generateThumbnail(i) {
        video.pause();
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        context.drawImage(video, (i/vidTimelineInterval) * 100, 0, 100, 50);
        var dataURL = canvas.toDataURL();
        var img = document.createElement('img');
        img.setAttribute('src', dataURL);                                                    
        document.getElementById('thumbnails').appendChild(img);
        vidTimelineRecur(i+vidTimelineInterval);
    }

