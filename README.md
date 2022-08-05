
# MP3 Player using json-server

## Для функционирования требуется:

 - Любой локальный сервер (в моем случае был MAMP)
 - npm-пакет json-server
## Usage/Examples
Первым этапом идет создание БД формата ".json". БД содержит в себе название песни, комозитора, а также путь к аудиофайлу. В данном проекте 8 саундтреков.

```javascript
from 'db.json'

{
    "album": [
      {
        "name": "A Walk in the Woods",
        "artist": "Martin O'Donnell",
        "path": "audio/martin-odonnell-and-michael-salvatori-a-walk-in-the-woods.mp3"
      },
      {
        "name": "Covenant Dance",
        "artist": "Martin O'Donnell",
        "path": "audio/martin-odonnell-and-michael-salvatori-covenant-dance.mp3"
      }, 
      // and go on
```

Далее идет создание HTML структуры и наложение стилей на нее. Предпроцессоры и другие фреймворки не использовались.

### Переходим к файлу "script.js". 
Начала кода состоит из получения нужных даных с страницы, а именно:

- оболочки, где будет находиться сам плеер;
- соответствующие кнопки старт/стоп песни, скип вперед и скип назад;
- получение слайдера песни (показ процесс проигрывания песни);
- получение поверхностного эффекта на слайдере (принимает вид светового меча);
- слайдер громкости;
- индикаторы показана текущего времени песни и общего времени песни.

```javascript
const musicWrapper = document.querySelector(`.music__wrapper`),
	  playPause = document.querySelector(`.playpause-track`),
	  musicNext = document.querySelector(".next-track"),
	  musicPrev = document.querySelector(".prev-track"),
	  seekSlider = document.querySelector(".seek_slider"),
	  seekSliderEffect = document.querySelector(".seek_slider_effect"),
	  volumeSlider = document.querySelector(".volume_slider"),
	  currentTime = document.querySelector(".current-time"),
	  totalTime = document.querySelector(".total-duration");
```

#### Также былы созданы переменные:
- индекс, который будет служить указателем песни, которая будет проигрываться;
- переменная isPlaying, которая будет отвечать за старт/стоп саундтрека;
- переменная updateTimer, которая будет служить интервалом в 1 секунду, для обновления таймера песни и слайдера;
- переменная, которая отвечает за создания аудио.
```javascript
let musicIndex = 0,
	isPlaying = false,
	updateTimer;

let currentSong = document.createElement(`audio`);
```

Следующим етапом создание класса, который будет отвечать за вставку определенных элементов на страницу и подгрузку нужного саундтрека.
Данный клас принимает в себя название саундтрека, его композитора, путь к саундтреку и элемент-родитель (место, куда будет вставляться информация), а также классы, которые могут прийти в случае надобности.

Функция render() создает элемент `div`, загружает саундтрек используя путь к файлу, а также применяет к блок-элементу классы, если они вдруг пришли тоже.
Далее в созданный  элемент `div` вставляется название песни и ее композитора.

Также следует сразу проверка, если первый элемент, который находится в родителе имеет класс `song__descr`, тогда он заменяется но новый элемент, который создан с помощью класса. Если же в родительском селекторе не было такого класса, тогда созданный блочный элемент вставляется в начало родителя (prepend).

```javascript
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
```


Далее создадим переменную-функцию, которая принимает в себя адрес сервера и использует API fetch (делается запрос на адрес сервера). Также сразу ответ переводится из формата json и передается тип данных promise.
```javascript
const getResources = async (url) => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Could not fetch ${url}, status: ${res.status}`);
	}
	return await res.json();
};
```
Также нам необходимо знать, сколько всего объектов передается в массиве. Количество записываем в localStorage.
```javascript
const arrayOfObjLength = getResources(`http://localhost:3000/album`)
.then(data => {
	localStorage.setItem('number', data.length);
});
```
Далее идет функция сброса времени песни, а также слайдера песни.
```javascript
function resetValues() {
	currentSong.textContent = "00:00";
	totalTime.textContent = "00:00";
	seekSlider.value = 0;
}
```
Следующим етапом идет важная функция, которая собственно будет отвечать за использование класса. Делаем ее ассинхронной, поскольку мы не знаем, как быстро придет ответ от сервера. Ответ, который к нам приходит, это массив объектов. Поскольку нам нужно выбрать определенную песню из списка, тут и входит в работу индекс, который по умолчанию стоит 0. То есть мы принимаем первый объект из массива.

Далее после получения мы проводим деструктуризацию объекта, вытагивая нужные значения, и передаем эти же значения далее в класс добавляя при этом селектор родителя, где будет размещаться песня. 

Также запускается функция с интервалом, которая будет отвечать за таймер песни и движение слайдера с диапазоном работы в 1 секунду (setInterval). 
После окончания песни будет запускаться следующая песня. 

Вызываем все это сразу же после объявления, поскольку на странице изначально должно что-то быть (какая-то песня).
```javascript
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
```

### Также стоит обратить внимание на функции рассчета громкости, движения слайдера и обновление таймера песни (текущее время и общее время песни).
```javascript
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
```