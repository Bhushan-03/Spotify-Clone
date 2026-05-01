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

// Function which returns array of albums
async function getAlbums() {
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    // console.log(data.Album.map(a => a.name));
    return data.Album.map(a => a.name);
}

// Function which returns array of sub-folders present in given folder
async function getSubFolders(albumname) {
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    let subFolders = [];
    for (let album of data.Album) {
        if (albumname === album.name) {
            for (let subf of album.subFolder) {
                subFolders.push(subf.sbName);
            }
        }
    }
    return subFolders;
}

// Function which returns array of songs present in given folder
async function getSongs(subfolname) {
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    let songs = [];
    for (let album of data.Album) {
        for (let subfol of album.subFolder) {
            if (subfol.sbName === subfolname) {
                if (!subfol.songs) {
                    console.error("Songs Not found in:", subfol);
                    return [];
                }
                for (let song of subfol.songs) {
                    songs.push(song.songName);
                }
                return songs;
            }
        }
    }
    return [];
}



// Function which returns the url or path of given song
async function fetchURL(songname) {
    let URl;
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    let albums = await getAlbums();
    for (const album of albums) {
        URl = `${album}`;
        let subfoldersList = await getSubFolders(album);
        for (const subfolderName of subfoldersList) {
            URl = URl + `/${subfolderName}`;
            let songsList = await getSongs(subfolderName);
            for (const songName of songsList) {
                if (songName === songname) {
                    URl = URl + `/${songName}.mp3`;
                    return URl;
                }
            }
            URl = URl.replace(`/${subfolderName}`, "");
        }
    }
}

// Function which set songs in front-end
async function setInSongsFrontEnd(subfolderName) {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    let response = await fetch("songs/songs.json");
    let data = await response.json();
    let albums = await getAlbums();
    songs = await getSongs(subfolderName);
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="Assets/music.svg" alt="music">
                        <div class="info">
                            <div>${song}</div>
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

const playMusic = async (songname) => {
    let songURL = await fetchURL(songname);
    currentSong.src = `songs/` + songURL;
    currentSong.play();
    play.src = "Assets/pause.svg";
    document.querySelector(".songInfo").innerHTML = songname;
    document.querySelector(".songTime").innerHTML = "00:00";
    showPB();
}

// Function which set subfolder name in front-end
async function setsubFolderInFrontEnd(albumname) {
    let subfoldersList = await getSubFolders(albumname);
    // console.log(subfoldersList);
    let trendingSongs = document.createElement("div");
    trendingSongs.className = "trendingSongs";
    document.querySelector(".mainScreen").appendChild(trendingSongs);
    // console.log("Trending Song div Inserted successfully");
    for (const subfolder of subfoldersList) {
        let a = await fetch(`/songs/${albumname}/${subfolder}/info.json`);
        let response = await a.json();
        trendingSongs.innerHTML = trendingSongs.innerHTML + `<div data-folder="${albumname}/${subfolder}" class="card">
                                    <img src="/songs/${albumname}/${subfolder}/cover.jpg" alt="cover image">
                                    <button class="playBtn"><img src="Assets/play.svg" alt="Play-icon"></button>
                                    <h3><a href="#">${response.title}</a></h3>
                                    <p><a href="#">${response.description}</a></p>
                                </div>`
    }
}

// Function which adjust library
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

// Function which set album names in front-end
async function setAlbumInFrentEnd() {
    let mainScreen = document.querySelector(".mainScreen");
    let albumsList = await getAlbums();
    for (const album of albumsList) {
        let heading = document.createElement("h2");
        heading.innerHTML = `<h2>${album}</h2>`;
        document.querySelector(".mainScreen").appendChild(heading);
        await setsubFolderInFrontEnd(album)
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("card clicked")
            let folderName = item.currentTarget.dataset.folder;
            // console.log(item.currentTarget);
            subfolderName = folderName.split("/")[1];
            songs = await getSongs(`${subfolderName}`);
            console.log(songs)
            playMusic(songs[0]);
            let replacedFN = folderName.replaceAll("/", " > ");
            document.querySelector(".heading").innerHTML = `<h2>${replacedFN}</h2>`;
            await setInSongsFrontEnd(subfolderName);
            showLibrarySection();
        });
    });
}


async function main() {
    
    // Function which Find and Display All Albums
    setAlbumInFrentEnd();

    //Get the list of all songs to show as default
    setInSongsFrontEnd("Purely Romantic");

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
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""));
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if (((currentSong.currentTime / currentSong.duration) * 100) === 100) {
            // console.log("Next Song Playing")
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
        // console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""))
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
        // console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ").replace(".mp3", ""))
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