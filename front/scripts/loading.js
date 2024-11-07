(function loadinfAnimation(){
    let textBox = document.getElementById("loadingText");
    setInterval(()=>{
        textBox.textContent = "Оценка эмоций...";
        setInterval(()=>{
            textBox.textContent = "Завершаем...";
            setInterval(()=>{
                window.location.href = "result.html"
                console.log(1)
            },2000)
        },1400)
    },2300);
}());
