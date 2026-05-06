class MusicPlayer {
  constructor() {
    this.audio = document.getElementById('audioPlayer');
    this.queue = [];
    this.currentSong = null;
    this.isPlaying = false;

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextSong());
    this.audio.addEventListener('loadedmetadata', () => this.updateProgress());

    document.getElementById('fileInput').addEventListener('change', (e) => this.addFiles(e));
    document.getElementById('progressBar').addEventListener('click', (e) => this.seek(e));
    document.getElementById('progressBarSmall').addEventListener('click', (e) => this.seekSmall(e));
  }

  addFiles(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        this.queue.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: url
        });
      }
    });
    
    if (!this.currentSong && this.queue.length > 0) {
      this.nextSong();
    } else {
      this.update();
    }
    document.getElementById('fileInput').value = '';
  }

  nextSong() {
    if (this.queue.length === 0) {
      this.currentSong = null;
      this.audio.src = '';
      this.isPlaying = false;
    } else {
      this.currentSong = this.queue.shift(); 
      this.audio.src = this.currentSong.url;
      this.play();
    }
    this.update();
  }

  play() {
    if (this.currentSong) {
      this.audio.play();
      this.isPlaying = true;
      this.update();
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.update();
  }

  togglePlay() {
    if (!this.currentSong && this.queue.length > 0) {
      this.nextSong();
    } else if (this.currentSong) {
      this.isPlaying ? this.pause() : this.play();
    }
  }

  seek(event) {
    const bar = event.currentTarget;
    const percent = event.offsetX / bar.offsetWidth;
    if (this.audio.duration) this.audio.currentTime = percent * this.audio.duration;
  }

  seekSmall(event) {
    const bar = event.currentTarget;
    const percent = event.offsetX / bar.offsetWidth;
    if (this.audio.duration) this.audio.currentTime = percent * this.audio.duration;
  }

  updateProgress() {
    const currentTime = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const percent = (currentTime / duration) * 100 || 0;

    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressFillSmall').style.width = percent + '%';
    document.getElementById('currentTime').textContent = this.formatTime(currentTime);
    document.getElementById('currentTimeSmall').textContent = this.formatTime(currentTime);
    document.getElementById('duration').textContent = this.formatTime(duration);
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  update() {
    this.renderQueue();
    this.renderNowPlaying();
    this.renderPlayerBottom();
    this.updateButtons();
  }

  renderQueue() {
    const queueList = document.getElementById('queueList');
    const queueCount = document.getElementById('queueCount');
    queueCount.textContent = this.queue.length;

    if (this.queue.length === 0) {
      queueList.innerHTML = '<div class="queue-empty">Antrean kosong</div>';
      return;
    }

    queueList.innerHTML = this.queue
      .map((song, index) => `
        <div class="queue-item">
          <div class="queue-item-index">${index + 1}</div>
          <div class="queue-item-title">${this.escapeHtml(song.name)}</div>
        </div>
      `).join('');
  }

  renderNowPlaying() {
    const songTitle = document.getElementById('songTitle');
    if (!songTitle) return;

    if (!this.currentSong) {
      songTitle.textContent = 'Tidak ada lagu';
      songTitle.classList.add('empty-player');
      return;
    }

    songTitle.textContent = this.escapeHtml(this.currentSong.name);
    songTitle.classList.remove('empty-player');
  }

  renderPlayerBottom() {
    const playerTitle = document.getElementById('playerTitle');
    const playBtn = document.getElementById('playBtn');
    if (!playerTitle || !playBtn) return;

    if (!this.currentSong) {
      playerTitle.textContent = 'Antrean kosong';
      playBtn.textContent = '▶';
      return;
    }

    playerTitle.textContent = this.escapeHtml(this.currentSong.name);
    playBtn.textContent = this.isPlaying ? '⏸' : '▶';
  }

  updateButtons() {
    const nextBtn = document.getElementById('nextBtn');
    const playBtn = document.getElementById('playBtn');

    if (nextBtn) nextBtn.disabled = this.queue.length === 0;
    if (playBtn) playBtn.disabled = !this.currentSong && this.queue.length === 0;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

const player = new MusicPlayer();

function togglePlay() { player.togglePlay(); }
function nextSong() { player.nextSong(); }