let currentsong = new Audio();
let songs
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const min = Math.floor(seconds / 60)
    const remsec = Math.floor(seconds % 60)
    const formmin = String(min).padStart(2, '0')
    const formsec = String(remsec).padStart(2, '0')

    return `${formmin}:${formsec}`
}

async function Getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `
                        <li>
                            <img class="invert" width="20px" src="img/music.svg" alt="">
                            <div class="info">
                                <div class="underline">${song.replaceAll("%20", " ")}</div>
                                <div>Prem</div>
                            </div>
                            <div class="playnow">
                                <span class="underline">Play now</span>
                                <img class="invert listplay" width="25px" src="img/play.svg" alt="">
                            </div>
                        </li>
        `
    }

    //Added event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    // .split(".mp3")[0]
}

async function Displayalbum() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get meta data of folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <img class="play-button" src="https://alfred.app/workflows/vdesabou/spotify-mini-player/icon.png" alt="play-button">
                        <img class="play-img" src="/songs/${folder}/cover.jpg" alt="playlist img">
                        <h3 class="underline">${response.Title}</h3>
                        <p>${response.Description}</p>
                    </div>`
        }
    }

    //load playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await Getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    });
}

async function main() {

    await Getsongs("songs/ncs")
    playmusic(songs[0], true)

    await Displayalbum()

    //attached event listner to bar bottuns
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //using spacebar
    document.addEventListener("keydown", function (event) {
        if (event.code === "Space") {
            event.preventDefault(); // Prevent page scrolling when space is pressed
            if (currentsong.paused) {
                currentsong.play();
                play.src = "img/pause.svg"
            } else {
                currentsong.pause();
                play.src = "img/play.svg"
            }
        }
    });

    //listenfor time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime span").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = ((currentsong.currentTime / currentsong.duration) * 100) + "%";
    })

    //add event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 100)
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (percent * currentsong.duration) / 100
    })

    //add event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = 0
    })

    //add eventlistner to close
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = -110 + "%";
    })

    //add eventlistner to previous 
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    //add eventlistner to next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < (songs.length)) {
            playmusic(songs[index + 1])
        }
    })

    //adding eventlistner to range 
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", e => {
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume>0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })

    //add event listner to mute volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        }
    })



}

main()

