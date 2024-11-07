const urlAdress = "/api/upload"



const warningText = document.getElementById("warning");
const nextButton = document.getElementById("next");

async function setup() {
    const model = await blazeface.load();
    const video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.onplaying = () => {
        const canvas = document.getElementById("overlay");
        const context = canvas.getContext("2d");

        // Устанавливаем размеры канваса в зависимости от видео
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        async function detectFace() {
            const predictions = await model.estimateFaces(video);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (predictions.length > 1) {
                warningText.style.display = "block";
                nextButton.style.visibility = "hidden";
            } else if (predictions.length === 1) {
                warningText.style.display = "none";
                nextButton.style.visibility = "visible";
            } else {
                warningText.style.display = "none";
                nextButton.style.visibility = "hidden";
            }

            predictions.forEach((prediction) => {
                const start = prediction.topLeft;
                const end = prediction.bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                // Рисуем квадрат
                const centerX = (start[0] + end[0]) / 2;
                const centerY = (start[1] + end[1]) / 2;

                const rectSize = Math.min(size[0], size[1]); // Размер квадрата

                context.beginPath();
                context.rect(
                    centerX - rectSize / 2,
                    centerY - rectSize / 2,
                    rectSize,
                    rectSize
                );
                context.lineWidth = 2;
                context.strokeStyle = "red";
                context.stroke();
            });

            requestAnimationFrame(detectFace);
        }

        detectFace();
    };
}

nextButton.onclick = () => {
    const canvas = document.getElementById("overlay");

    const context = canvas.getContext("2d");
    context.drawImage(document.getElementById("video"), 0, 0, canvas.width, canvas.height);


    const dataURL = canvas.toDataURL("image/png");
    console.log(dataURL);
    
    fetch(urlAdress, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: dataURL,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Изображение отправлено на сервер:", data);
        })
        .catch((error) => {
            console.error("Ошибка отправки изображения:", error);
        });
};

setup();
