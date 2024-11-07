const nextButton = document.getElementById("next");
const warningText = document.getElementById("warning");

async function setup() {
    const model = await blazeface.load();
    const video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.onplaying = () => {
        const canvas = document.getElementById("overlay");
        canvas.width = video.width;
        canvas.height = video.height;
        const context = canvas.getContext("2d");

        async function detectFace() {
            const predictions = await model.estimateFaces(video);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (predictions.length > 0) {
                handleFaceDetected(predictions);
            } else {
                nextButton.style.display = "none";
            }

            predictions.forEach((prediction) => {
                const start = prediction.topLeft;
                const end = prediction.bottomRight;

                // Зеркалим только координаты по оси X
                const mirroredStartX = canvas.width - end[0]; // Зеркалим правую точку
                const mirroredEndX = canvas.width - start[0]; // Зеркалим левую точку

                // Вычисляем центр квадрата (по оси X зеркалим координаты)
                const centerX = (mirroredStartX + mirroredEndX) / 2; // Центр по оси X
                const centerY = (start[1] + end[1]) / 2; // Центр по оси Y

                // Размер стороны квадрата — минимальный размер между шириной и высотой
                const size = Math.min(
                    mirroredEndX - mirroredStartX,
                    end[1] - start[1]
                );

                // Рисуем квадрат
                context.beginPath();
                context.rect(centerX - size, centerY - size / 2, size, size);
                context.lineWidth = 2;
                context.strokeStyle = "red";
                context.stroke();
            });

            requestAnimationFrame(detectFace);
        }

        detectFace();
    };
}

function handleFaceDetected(predictions) {
    const numberOfFaces = predictions.length;
    if (numberOfFaces > 1) {
        warningText.style.display = "block";
    } else {
        warningText.style.display = "none";

        nextButton.style.display = "block";
    }
    const message = `Найдено ${numberOfFaces} лицо(а)`;
    console.log(message);
}

function nextButtonAction () {
    
}

setup();
