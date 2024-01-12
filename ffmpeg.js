var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
const { exec } = require('child_process');


const PIPE_PATH = '/tmp/mediapipe';

if (fs.existsSync(PIPE_PATH)) {
    fs.unlinkSync(PIPE_PATH)
    console.log(`remove ${PIPE_PATH}`)
}
// 创建命名管道
exec(`mkfifo ${PIPE_PATH}`, (error) => {
    if (error) {
        console.error(`Error creating named pipe: ${error}`);
        return;
    }

    console.log('Named pipe created.', Date.now());

    // 打开命名管道以便写入
    const writeStream = fs.createWriteStream(PIPE_PATH);

    // 读取文件并写入命名管道
    const filePath = 'linyuner.flv';
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(writeStream);

    readStream.on('end', () => {
        console.log('File has been written to named pipe.', Date.now());
        fs.unlinkSync(PIPE_PATH)
    });
});

ffmpeg(PIPE_PATH).videoCodec('libx264')
    .audioCodec('libfdk_aac')
    .size('320x240')
    .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
    })
    .on('end', function () {
        console.log('Processing finished !', Date.now());
    })
    .save('./output.mp4');