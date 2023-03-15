/**
 * 1. Render song
 * 2. Scroll top
 * 3. Play / pause/ seek
 * 4. CD rotate
 * 5. Next/ Previous
 * 6. Random
 * 7. Next/ Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const playlistList = $('ul.playlist__list')
const playBtn = $('.btn-toggle-play')
const playIcon = $('.song__play-icon')
const player = $('.player')
const audio = $('#audio')
const currentThumb = $('.current-song .song__thumb')
const currentName = $('.current-song .name')
const currentSinger = $('.current-song .singer')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const progress = $('#progress')
const playlistItem = $('.playlist__item')
const rateLikePlaylist = $('.playlist__rate-like')
const rateLikeSong = $('.song__rate-like')
const timeStart = $('.time-start')
const timeEnd = $('.time-end')
const volume = $('.volume')
const progressVolume = $('#progress-volume')
const volumeUp = $('.volume--up')
const volumeMute = $('.volume--mute')

const listAPI = "http://localhost:3000/songs"



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isLiked: false,

    getSong: async function () {
        const resp = await fetch(listAPI);
        const data = await resp.json();
        this.songs = data;
    },

    songs: [],

    render: function () {
        const htmls = this.songs.map((song, index) => {

            return `
                    <li class="playlist__item ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                        <div class="grid">
                            <div class="row sm-gutters song__info">
                                <div class="col l-0-5 song__status ">
                                    <span class="song__index">${index + 1}</span>
                                    <i class="song__play-icon fa-solid fa-play"></i>
                                    <i class="song__pause-icon fa-solid fa-pause"></i>
                                </div>
                                <div class="col l-4 song">
                                    <div class="song__thumb"
                                        style="background-image: url('${song.img}')">
                                    </div>
                                    <div class="song__title">
                                        <h4 class="name">${song.name}</h4>
                                        <a class="singer">${song.singer}</a>
                                    </div>
                                </div>
    
                                <div class="col l-3">
                                    <span class="song__plays">${song.plays}</span>
                                </div>
    
                                <div class="col l-2-5">
                                    <span class="song__album">${song.album}</span>
                                </div>
    
                                <div class="col l-2 song__more">
                                    <span class="rate-like song__rate-like">
                                        <i class="rate-like-icon--fill fa-solid fa-heart"></i>
                                        <i class="rate-like-icon--empty fa-regular fa-heart"></i>
                                    </span>
                                    <span class="song__time">${song.duration}</span>
                                    <span class="song__option">
                                        <i class="song__option-icon opacity-color fa-solid fa-ellipsis"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </li>
                `
        })
        playlistList.innerHTML = htmls.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function () {
        _this = this;
        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
        }

        // Khi song được pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
            // Hiển thị thời gian hiện tại của song
            let currentMin = Math.floor(audio.currentTime / 60);
            let curentSec = Math.floor(audio.currentTime - currentMin * 60)
            if (currentMin < 10) {
                currentMin = `0${currentMin}`;
            }
            if (curentSec < 10) {
                curentSec = `0${curentSec}`;
            }
            timeStart.innerText = `${currentMin}:${curentSec}`
        }

        // Hiển thị thời gian song
        audio.onloadeddata = function () {
            let duarationMin = Math.floor(audio.duration / 60);
            let duarationSec = Math.floor(audio.duration - duarationMin * 60);
            if (duarationMin < 10) {
                duarationMin = `0${duarationMin}`;
            }
            if (duarationSec < 10) {
                duarationSec = `0${duarationSec}`;
            }
            timeEnd.innerText = `${duarationMin}:${duarationSec}`
        }

        // Xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        // Xử lý khi thay đổi volume
        progressVolume.onchange = function (e) {
            const seekVolume = e.target.value / 100;
            audio.volume = seekVolume;
            if (audio.volume === 0) {
                volume.classList.add('muted');
            } else {
                volume.classList.remove('muted');
            }
        }

        // Xử lý khi click volume up
        volumeUp.onclick = function () {
            volume.classList.add('muted');
            audio.volume = 0;
            progressVolume.value = 0;
        }

        // Xử lý khi click volume mute
        volumeMute.onclick = function () {
            volume.classList.remove('muted');
            audio.volume = 1;
            progressVolume.value = 100;
        }


        // Xử lý khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý khi random song 
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý khi click Repeat
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi khi click vào playlist
        playlistList.onclick = function (e) {
            const songNode = e.target.closest('.playlist__item:not(.active)');
            if (songNode || e.target.closest('.song__option') || e.target.closest('.song__rate-like')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                if (e.target.closest('.song__rate-like')) {
                    _this.isLiked = !_this.isLiked;
                    rateLikeSong.classList.toggle('liked', _this.isLiked);
                    _this.render();
                }
            }
        }

        // Xử lý khi click rate like playlist
        rateLikePlaylist.onclick = function () {
            _this.isLiked = !_this.isLiked;
            rateLikePlaylist.classList.toggle('liked', _this.isLiked);
        }

        // Xử lý khi click rate like song
        rateLikeSong.onclick = function () {
            _this.isLiked = !_this.isLiked;
            rateLikeSong.classList.toggle('liked', _this.isLiked);
        }
    },

    loadCurrentSong: function () {
        currentName.textContent = this.currentSong.name;
        currentSinger.textContent = this.currentSong.singer;
        currentThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === _this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.playlist__item.active').scrollIntoView({
                behavior: 'smooth',
                inlines: 'nearest',
            });
        }, 300)
    },

    start: async function () {
        // get data
        await this.getSong();

        // Render playlist
        this.render();

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe xử lý các sự kiện
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();
    }
}
app.start();


