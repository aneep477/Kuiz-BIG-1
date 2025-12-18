
// ============================
// CONFIGURATION
// ============================
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwf0gtA5sV4oIMM53baae9t9WKXDgVUGtAaqU-e0No2x69r_bosnJ0yGJ-89IQ_mCI9/exec';
let soalanList = [];
let pelajarId = 'MPU3411_001';
let jawapanUser = [];
let duration = 20*60;
let timer;

window.onload = () => {
  document.getElementById('honourCode').addEventListener('change', e => {
    document.getElementById('submitBtn').disabled = !e.target.checked;
  });
  loadSoalan();
};

function loadSoalan() {
  fetch(`${WEBAPP_URL}?action=getSoalan`)
    .then(response => response.json())
    .then(data => {
      soalanList = data;
      renderSoalan();
      startTimer();
      enterFullscreen();
    })
    .catch(err => console.error(err));
}

function renderSoalan() {
  const container = document.getElementById('soalanContainer');
  container.innerHTML = '';
  soalanList.forEach((q, idx) => {
    let html = `<div class="p-2 border rounded bg-gray-50">
                  <p class="font-semibold">${idx+1}. ${q.soalan}</p>`;
    q.pilihan.forEach((p,j)=>{
      html += `<label class="block mt-1"><input type="radio" name="soalan_${q.id}" value="${String.fromCharCode(65+j)}" class="mr-2"> ${p}</label>`;
    });
    html += `</div>`;
    container.innerHTML += html;
  });
}

function startTimer() {
  timer = setInterval(()=>{
    let min = Math.floor(duration/60);
    let sec = duration%60;
    document.getElementById('timer').innerText = `${min}:${sec<10?'0'+sec:sec}`;
    duration--;
    if(duration < 0) {
      clearInterval(timer);
      submitKuiz();
    }
  },1000);
}

function submitKuiz() {
  jawapanUser = soalanList.map(q => {
    let radios = document.getElementsByName('soalan_' + q.id);
    let jaw = '';
    radios.forEach(r => { if(r.checked) jaw=r.value; });
    return {id: q.id, jawapanUser: jaw, jawapan: q.jawapan};
  });

  fetch(WEBAPP_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'simpanJawapan',
      pelajarId: pelajarId,
      jawapanArray: jawapanUser
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(result => {
    alert(`Kuiz tamat! Markah: ${result.markah} / ${result.total}`);
    location.reload();
  })
  .catch(err => console.error(err));
}

window.onblur = () => {
  fetch(WEBAPP_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'logEvent',
      pelajarId: pelajarId,
      event: 'Tab keluar / minimize',
      nota: 'Pelajar tinggalkan halaman'
    }),
    headers: { 'Content-Type': 'application/json' }
  });
};

function enterFullscreen() {
  const el = document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen();
  else if(el.mozRequestFullScreen) el.mozRequestFullScreen();
  else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if(el.msRequestFullscreen) el.msRequestFullscreen();
}
