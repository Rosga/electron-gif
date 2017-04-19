// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const RecordRTC = require('recordrtc');




var startRecordButton = document.querySelector(".ss-btn-start-record");

startRecordButton.addEventListener("click", function () {

    desktopCapturer.getSources({ types: ['window', 'screen'] }, getSourcesCallback);

});

var isStop = false;
var globalStream;

var index = 0;

var videosContainer = document.querySelector(".video-container");

function handleStream(stream) {

    globalStream = stream;

    var options = {
        type: 'video',
        videoBitsPerSecond: 100,
        frameInterval: 5,
        video: {
            width: parseInt(1366 * 0.8),
            height: parseInt(768 * 0.8)
        },
        canvas: {
            width: parseInt(1366 * 0.8),
            height: parseInt(768 * 0.8)
        }
    };
    var recordRTC = RecordRTC(stream, options);
    recordRTC.startRecording();

    setTimeout(function() {
        recordRTC.stopRecording(function (gifURL) {
            
            console.log("gifUrl => ", gifURL);
            
            var blob = recordRTC.getBlob();
            blobToBuffer(blob).then(function(buf) {
                console.log("buf => ", buf);

                var filePath = path.join(__dirname, "test3.webm");
                console.log("filePath => ", filePath);

                try {
                    fs.writeFileSync(filePath, buf);    
                } catch(error) {
                    console.error("cannot write file => ", error);
                }
                

            }).catch(function() {

            });

        });


    }, 10000)

    

};

function handleError() {
    console.log("handleError");
}



function getSourcesCallback(err, sources) {

    if (err) {
        console.error(err);
        return;
    }

    console.log("sources => ", sources);

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[0].id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, handleStream, handleError);

}

// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
// below function via: http://goo.gl/6QNDcI
function getTimeLength(milliseconds) {
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
}

function blobToBuffer(blob) {

    return new Promise((resolve, reject) => {

        try {

            var fileReader = new FileReader();

            var onLoadEnd = function () {
                fileReader.removeEventListener("loadend", onLoadEnd);

                var buffer = new Buffer(this.result, "binary");
                resolve(buffer);
            };

            fileReader.addEventListener("loadend", onLoadEnd, false);
            fileReader.readAsArrayBuffer(blob);

        } catch (error) {
            reject(error);
        }

    });

}
