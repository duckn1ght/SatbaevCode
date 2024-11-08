let imageUrl = localStorage.getItem("imageBase64");
let userInfo = localStorage.getItem("info");
let userInfojson = JSON.parse(userInfo);
document.getElementById("resultImg").src = "src/1612298572_91-p-anime-peizazh-fon-fioletovii-138.png";
console.log(userInfojson);

document.getElementById("emotion").textContent = getEmotionInRussian(userInfojson.emotion);
document.getElementById("age").textContent = getGenderInRussian(userInfojson.gender);
document.getElementById("species").textContent = `Возраст - ${userInfojson.age}`;



function getEmotionInRussian(emotion) {
    switch (emotion) {
        case 'angry':
            return "Эмоция - Злость";
        case 'disgust':
            return "Эмоция - Отвращение";
        case 'fear':
            return "Эмоция - Страх";
        case 'happy':
            return "Эмоция - Счастье";
        case 'sad':
            return "Эмоция - Печаль";
        case 'surprise':
            return "Эмоция - Удивление";
        case 'neutral':
            return "Эмоция - Нейтральность";
        default:
            return "Неизвестная эмоция";
    }
}

function getGenderInRussian(gender) {
    switch (gender) {
        case 'Man':
            return "Пол - Мужчина";
        case 'Woman':
            return "Пол - Женщина";
    }
}