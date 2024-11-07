async function setup() {
    const model = await blazeface.load();
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.onplaying = () => {
        const canvas = document.getElementById('overlay');
        const context = canvas.getContext('2d');
        
        // Устанавливаем размеры канваса в зависимости от видео
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        async function detectFace() {
            const predictions = await model.estimateFaces(video);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (predictions.length > 1) {
                document.getElementById('warning').style.display = 'block';
                document.getElementById('next').style.visibility = 'hidden';
            } else if (predictions.length === 1) {
                document.getElementById('warning').style.display = 'none';
                document.getElementById('next').style.visibility = 'visible';
            } else {
                document.getElementById('warning').style.display = 'none';
                document.getElementById('next').style.visibility = 'hidden';
            }

            predictions.forEach(prediction => {
                const start = prediction.topLeft;
                const end = prediction.bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                // Рисуем квадрат
                const centerX = (start[0] + end[0]) / 2;
                const centerY = (start[1] + end[1]) / 2;

                const rectSize = Math.min(size[0], size[1]); // Размер квадрата

                context.beginPath();
                context.rect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);
                context.lineWidth = 2;
                context.strokeStyle = 'red';
                context.stroke();
            });

            requestAnimationFrame(detectFace);
        }

        detectFace();
    };
}

setup();
