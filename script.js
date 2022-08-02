"use strict";

/* media ---------------------------------------------------------------------- */

const musicWrapper = document.querySelector(`.music__wrapper`),
	  playPause = document.querySelector(`.playpause-track`),
	  musicNext = document.querySelector(".next-track"),
	  musicPrev = document.querySelector(".prev-track"),
	  seekSlider = document.querySelector(".seek_slider"),
	  seekSliderEffect = document.querySelector(".seek_slider_effect"),
	  volumeSlider = document.querySelector(".volume_slider"),
	  currentTime = document.querySelector(".current-time"),
	  totalTime = document.querySelector(".total-duration");

let musicIndex = 0,
	isPlaying = false,
	updateTimer;

let currentSong = document.createElement(`audio`);

class Song {
	constructor(songName, songArtist, path, parentSelector,  ...classes) {
		this.songName = songName;
		this.songArtist = songArtist;
		this.path = path;
		this.parent = document.querySelector(parentSelector);
		this.classes = classes;
	}

	render() {
		const element = document.createElement(`div`);

		currentSong.src = this.path;
		currentSong.load();

		if (this.classes.length === 0) {
			this.element = 'song__descr';
			element.classList.add(this.element);
		} else {
			this.classes.forEach(className => element.classList.add(className));
		}
		element.innerHTML = `
			<div class="music__name">${this.songName}</div>
			<div class="music__artist">${this.songArtist}</div>
		`;
		if (musicWrapper.firstElementChild.className === `song__descr`) {
			console.log(`Deleted previous song`);
			musicWrapper.firstElementChild.replaceWith(element);
		} else {
			this.parent.prepend(element);
		}
	}
}

const getResources = async (url) => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Could not fetch ${url}, status: ${res.status}`);
	}
	return await res.json();
};

const arrayOfObjLength = getResources(`http://localhost:3000/album`)
.then(data => {
	localStorage.setItem('number', data.length);
});

// console.log(arrayOfObjLength);
// console.log(+localStorage.getItem('number'));

function resetValues() {
	currentSong.textContent = "00:00";
	totalTime.textContent = "00:00";
	seekSlider.value = 0;
}

async function loadMusic()  {
	resetValues();
	await getResources(`http://localhost:3000/album`).then(data => {
		const {name, artist, path} = data[musicIndex];
		new Song(name, artist, path, '.music__wrapper').render();
	});
	updateTimer = setInterval(seekUpdate, 1000);
	currentSong.addEventListener("ended", nextSong);
}
loadMusic();

function playTrack() {
	currentSong.play();
	isPlaying = true;
	playPause.innerHTML = `<i class="fa fa-pause-circle fa-3x"></i>`;
}

function pauseTrack() {
	currentSong.pause();
	isPlaying = false;
	playPause.innerHTML = `<i class="fa fa-play-circle fa-3x"></i>`;
}

async function nextSong() {
	if (musicIndex >= +localStorage.getItem('number') - 1) {
		musicIndex = 0;
	} else {
		musicIndex += 1;
	}
	console.log(musicIndex);
	await loadMusic();
	playTrack();
}

musicNext.addEventListener('click', nextSong);

musicPrev.addEventListener('click', async () => {
	if (musicIndex > 0) {
		musicIndex -= 1;
	} else {
		musicIndex = +localStorage.getItem('number') - 1;
	}
	console.log(musicIndex);
	await loadMusic();
	playTrack();
});

playPause.addEventListener(`click`, () => {
	if (!isPlaying) {
		playTrack();
	} else {
		pauseTrack();
	}
});

volumeSlider.addEventListener('change', () => {
	currentSong.volume = volumeSlider.value / 100;
});

seekSlider.addEventListener('change', () => {
	currentSong.currentTime = currentSong.duration * (seekSlider.value / seekSlider.clientWidth);
});

function seekUpdate() {
	let seekPosition = 0;

	if (!isNaN(currentSong.duration)) {
		seekPosition = currentSong.currentTime * (seekSlider.clientWidth / currentSong.duration);
		seekSlider.max = seekSlider.clientWidth;
    	seekSlider.value = seekPosition;
		seekSliderEffect.style.width = `${seekPosition}px`;
		// seekSlider.


		let currentMinutes = addZero(Math.floor(currentSong.currentTime / 60));
		let currentSeconds = addZero(Math.floor(currentSong.currentTime - currentMinutes * 60));
		let durationMinutes = addZero(Math.floor(currentSong.duration / 60));
		let durationSeconds = addZero(Math.floor(currentSong.duration - durationMinutes * 60));

		currentTime.textContent = `${currentMinutes}:${currentSeconds}`;
		totalTime.textContent = `${durationMinutes}:${durationSeconds}`;
	}
}

function addZero(item) {
	if (item < 10) {
		return `0${item}`;
	} else {
		return item;
	}
}


// console.log(getResources(`http://localhost:3000/album`).then((data) => console.log(data)));


















// function loadTrack() {
//     let elementDiv = document.createElement(`div`);
//     clearInterval(updateTimer);
//     this.resetValues();

//     elementDiv.innerHTML = `
//         <div class="music__name">${this.songName}</div>
//         <div class="music__artist">${this.songArtist}</div>
//     `;
//     updateTimer = setInterval(this.seekSlider, 1000);
//     currentSong.addEventListener("ended", this.nextTrack);
//     this.parent.append(elementDiv);
// }

// function resetValues() {
//     currentTime.textContent = "00:00";
//     totalTime.textContent = "00:00";
//     seekSlider.value = 0;
// }

// function playTrack() {
//     // Play the loaded track
//     currentSong.play();
//     isPlaying = true;
   
//     // Replace icon with the pause icon
//     pauseAndPlay.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
//   }
   
// function pauseTrack() {
//     // Pause the loaded track
//     currentSong.pause();
//     isPlaying = false;
   
//     // Replace icon with the play icon
//     pauseAndPlay.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
//   }

//   function playpauseTrack() {
//     // Switch between playing and pausing
//     // depending on the current state
//     if (!isPlaying) {
//         playTrack();
//     } else  {
//         pauseTrack(); }
//   }
   
//   function nextTrack() {
//     // Go back to the first track if the
//     // current one is the last in the track list
//     if (musicIndex < getResources('http://localhost:3333/album').length - 1) {
//         musicIndex += 1;
//     } else {
//         musicIndex = 0;
//     }
//     // Load and play the new track
//     loadTrack(musicIndex);
//     playTrack();
//   }
   
//   function prevTrack() {
//     // Go back to the last track if the
//     // current one is the first in the track list
//     if (musicIndex > 0) {
//         musicIndex -= 1;
//     } else {musicIndex = getResources('http://localhost:3333/album').length - 1;}
	 
//     // Load and play the new track
//     this.loadTrack(musicIndex);
//     this.playTrack();
//   }







	  
// musicNext.addEventListener('click', () => {
//     musicIndex++;
//     getResources('http://localhost:3000/album')
//     .then((data, musicIndex) => {
//         data[musicIndex] = ({songName, songArtist, path}) => {
//             new Song(songName, songArtist, path, 'song__descr').render();
//         };
//     });
// });