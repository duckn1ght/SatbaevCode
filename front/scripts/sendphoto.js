const urlAdress = "http://127.0.0.1:8000/upload";

let model;
document.getElementById("file-upload").style.display = "none";
const nextBtn = document.getElementById("nextButton");
// Загружаем модель один раз при загрузке страницы
async function loadModel() {
    model = await blazeface.load();
    console.log("BlazeFace model loaded");
    document.getElementById("file-upload").style.display = "block";
}
loadModel();

document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
            // Скрываем кнопку загрузки
            document.getElementById("file-upload").style.display = "none";
        }
    });

// Обработка загруженного изображения
async function processImage(file) {
    const previewImage = document.getElementById("previewImage");
    const reader = new FileReader();

    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";

        // Обработка изображения после полной загрузки
        previewImage.onload = () => {
            if (previewImage.width > 0 && previewImage.height > 0) {
                runBlazeFace(previewImage);
                previewImage.style.display = "none"; // Скрываем изображение после обработки
                document.getElementById("canvas").style.display = "block"; // Показываем холст
            } else {
                console.error("Размер изображения недействителен.");
            }
        };
    };

    reader.readAsDataURL(file);
}

// Основная функция для запуска BlazeFace
async function runBlazeFace(imageElement) {
    if (!model) {
        console.error("BlazeFace model is not loaded yet.");
        return;
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const predictions = await model.estimateFaces(canvas, false);
    console.log(predictions);

    if (predictions.length !== 0) {
        console.log("nice");
        nextBtn.style.visibility = "visible";
    } else {
        console.log("daaaamn");
        nextBtn.style.visibility = "hidden";
    }

    // Отрисовка рамок вокруг обнаруженных лиц
    predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.topLeft.concat(
            prediction.bottomRight
        );
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "red";
        ctx.rect(x, y, width - x, height - y);
        ctx.stroke();
    });
}

// Обработчик клика по изображению после его обработки
document.getElementById("canvas").addEventListener("click", function () {
    // Скрываем холст и показываем кнопку загрузки изображения
    this.style.display = "none";
    document.getElementById("file-upload").style.display = "inline-block";

    document.getElementById("fileInput").value = "";
    nextBtn.style.visibility = "hidden";
});
nextBtn.onclick = async (event) => {
    event.preventDefault();
    console.log("поехали");

    // Получаем изображение из элемента <img> (предположим, что картинка уже загружена в previewImage)
    const imageElement = document.getElementById("previewImage");

    if (!imageElement) {
        console.error("Изображение не найдено.");
        return;
    }

    // Преобразуем изображение в base64
    const dataURL = await convertImageToBase64(imageElement);

    // Отправляем данные на сервер
    try {
        const response = await fetch(urlAdress, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image_data: dataURL,
            }),
        });

        const data = await response.json();

        // Преобразуем строку в валидный формат JSON
        const formattedStr = data
            .replace(/(\w+):/g, '"$1":') // Добавляем кавычки к ключам
            .replace(/:\s*(\w+)/g, ':"$1"'); // Добавляем кавычки только к строковым значениям

        try {
            let jsonObject = JSON.parse(formattedStr);
            console.log(jsonObject);

            // Сохраняем данные в localStorage
            localStorage.setItem("imageBase64", dataURL);
            localStorage.setItem("info", JSON.stringify(jsonObject));

            // Переходим на другую страницу
            window.location.href = "result.html";
        } catch (error) {
            console.error("Ошибка при парсинге JSON:", error);
        }
    } catch (error) {
        console.error("Ошибка при отправке изображения на сервер:", error);
    }
};

// Функция для преобразования изображения в base64
async function convertImageToBase64(imageElement) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = imageElement.width;
        canvas.height = imageElement.height;

        // Рисуем изображение на холсте
        ctx.drawImage(imageElement, 0, 0);

        // Получаем данные изображения в формате base64
        const dataURL = canvas.toDataURL("image/jpeg");

        resolve(dataURL);
    });
}
