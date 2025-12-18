let soalanList = [];
let pelajarId = 'MPU3411_001'; // Boleh auto assign
let jawapanUser = [];
let duration = 20*60; // 20 minit
let timer;

window.onload = () => {
  document.getElementById('honourCode').addEventListener('change', e => {
    document.getElementById('submitBtn').disabled = !e.target.checked;
  });
  loadSoalan();
};

// Load soalan dari Apps Script
function loadSoalan() {
  google.script.run.withSuccessHandler(data => {
    soalanList = data;
    renderSoalan();
    startTimer();
    enterFullscreen();
  }).getSoalan();
}

// Render soalan
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

// Timer 20 minit
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

// Submit jawapan
function submitKuiz() {
  jawapanUser = soalanList.map(q => {
    let radios = document.getElementsByName('soalan_' + q.id);
    let jaw = '';
    radios.forEach(r => { if(r.checked) jaw=r.value; });
    return {id: q.id, jawapanUser: jaw, jawapan: q.jawapan};
  });

  google.script.run.withSuccessHandler(result=>{
    alert(`Kuiz tamat! Markah: ${result.markah} / ${result.total}`);
    location.reload();
  }).simpanJawapan(pelajarId, jawapanUser);
}

// Anti-tab / minimize
window.onblur = () => {
  google.script.run.logEvent(pelajarId,'Tab keluar / minimize','Pelajar tinggalkan halaman');
};

// Fullscreen paksa pelajar
function enterFullscreen() {
  const el = document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen();
  else if(el.mozRequestFullScreen) el.mozRequestFullScreen();
  else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if(el.msRequestFullscreen) el.msRequestFullscreen();
}
