function playSound(key){

const audio = document.getElementById(key);

if(audio){
audio.currentTime = 0;
audio.play();

const name = audio.parentElement.id;
document.getElementById("display").innerText = name;
}

}

document.querySelectorAll(".drum-pad").forEach(pad => {

pad.addEventListener("click", function(){
playSound(this.innerText);
});

});

document.addEventListener("keydown", function(event){

const key = event.key.toUpperCase();
playSound(key);

});
