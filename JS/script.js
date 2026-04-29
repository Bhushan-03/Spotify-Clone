let currentSong = new Audio();
let songs;
let currentFolder;

// Function which gives current length and total length of song in minutes
function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function which takes all song from given folder
async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`/songs/${currentFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`%5C${currentFolder}%5C`)[1]);
        }
    }

    // Function that Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="Assets/music.svg" alt="music">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Harry</div>
                        </div>
                        <div class="playNow">
                            <span>Play Now</span>
                            <img class="invert" src="Assets/playCircular.svg" alt="play">
                        </div></li>`;
    }

    //Attach a event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
    return songs;
}

const showPB = () => {
    let showPlaybar = document.querySelector(".playBar");
    showPlaybar.classList.add("showPlaybar");
}

const playMusic = (track) => {
    currentSong.src = `/songs/${currentFolder}/` + track;
    currentSong.play();
    play.src = "Assets/pause.svg";
    document.querySelector(".songInfo").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songTime").innerHTML = "00:00";
    showPB();
}

// Function which find main folder + sub folder name and convert sub folders in to the cards
async function getFoldersName() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    let mainScreen = document.querySelector(".mainScreen");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("\songs")) {
            let folderName = e.href.split("%5Csongs%5C").slice(-1)[0].replaceAll("%20", " ").replaceAll("/", "")
            let heading = document.createElement("h2");
            heading.innerHTML = `<h2>${folderName}</h2>`
            document.querySelector(".mainScreen").appendChild(heading)
            console.log("Heading Inserted Successfully");
            folderName = folderName.replaceAll(" ", "%20");


            let a = await fetch(`/songs/${folderName}/`);
            let response = await a.text();
            let div = document.createElement("div");
            let trendingSongs = document.createElement("div");
            trendingSongs.className = "trendingSongs";
            document.querySelector(".mainScreen").appendChild(trendingSongs);
            console.log("Trending Song div Inserted successfully")
            div.innerHTML = response;
            let anchors = div.getElementsByTagName("a")
            let array = Array.from(anchors);
            for (let index = 0; index < array.length; index++) {
                const e = array[index];
                if (e.href.includes(folderName)) {
                    let folder = e.href.split(`%5Csongs%5C`).slice(-1)[0].replaceAll("%20", " ").replaceAll("/", "")
                    let a = await fetch(`/songs/${folder}/info.json`);
                    let response = await a.json();
                    trendingSongs.innerHTML = trendingSongs.innerHTML + `<div data-folder="${folder}" class="card">
                                    <img src="/songs/${folder}/cover.jpg" alt="cover image">
                                    <button class="playBtn"><img src="Assets/play.svg" alt="Play-icon"></button>
                                    <h3><a href="#">${response.title}</a></h3>
                                    <p><a href="#">${response.description}</a></p>
                                </div>`
                }
            }
        }
    }

    // Adjust Library for the android / Tablet whenever card clicked
    function showLibrarySection() {
        if ((window.innerWidth < 768) || (window.innerWidth < 1281)) {
            if (document.querySelector(".library").style.left === "0px") {
                document.querySelector(".library").style.left = "-1000px";
                hamburger.src = "Assets/hamburger.svg"
            }
            else {
                document.querySelector(".library").style.left = "0px";
                hamburger.src = "Assets/cross.svg"
            }
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder.replaceAll(" ", "%20");
            songs = await getSongs(`${folderName}`);
            playMusic(songs[0]);
            let replacedFN = folderName.replaceAll("%5C", " > ").replaceAll("%20", " ")
            document.querySelector(".heading").innerHTML = `<h2>${replacedFN}</h2>`
            showLibrarySection();
        })
    })
}

async function main() {

    // Function which Find and Display All Albums
    getFoldersName()

    //Get the list of all songs to show as default
    await getSongs("/Mood Universe/Purely Romantic");
    // await getSongs("\Mood%20Universe%5CPurely%20Romantic");

    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Assets/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "Assets/play.svg";
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if (((currentSong.currentTime / currentSong.duration) * 100) === 100) {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            console.log("Next Song Playing")
            if (index !== songs.length - 1) {
                playMusic(songs[index + 1])
            }
            else {
                index = 0;
                playMusic(songs[index])
            }
        }
    })

    //Add an event listener to seekbar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Attach an event listener to hamburger 
    hamburger.addEventListener("click", () => {
        if (document.querySelector(".library").style.left === "0px") {
            document.querySelector(".library").style.left = "-1000px";
            hamburger.src = "Assets/hamburger.svg"
        }
        else {
            document.querySelector(".library").style.left = "0px";
            hamburger.src = "Assets/cross.svg"
        }
    });

    // Function which moves footer links div for android and tablet
    function moveDiv() {
        const footerLinks = document.querySelector(".footer-links");
        const library = document.querySelector(".library");
        const container = document.querySelector(".container");
        if ((window.innerWidth < 768) || (window.innerWidth < 1281)) {
            container.appendChild(footerLinks);
        } else {
            library.appendChild(footerLinks);
        }
    }
    moveDiv();
    window.addEventListener("resize", moveDiv);

    //Add an event listener to previous button
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index === 0) {
            index = songs.length
            playMusic(songs[index - 1])
        }
        else if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index === songs.length - 1) {
            index = 0
            playMusic(songs[index])
        }
        else if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });
}
main();