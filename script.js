const QUESTIONS = [
  {cat:"Коммуникация", text:"Самостоятельно инициирует общение с другими людьми."},
  {cat:"Коммуникация", text:"Поддерживает разговор и реагирует на слова собеседника."},
  {cat:"Социальная активность", text:"Проявляет инициативу во время совместной деятельности."},
  {cat:"Социальная активность", text:"Принимает участие в групповой работе."},
  {cat:"Внимание", text:"Сохраняет внимание во время выполнения задания."},
  {cat:"Внимание", text:"Следует инструкции и выполняет поставленную задачу."},
  {cat:"Эмоциональные реакции", text:"Спокойно реагирует на замечания или исправления."},
  {cat:"Эмоциональные реакции", text:"Сохраняет контроль поведения при возникновении трудностей."},
  {cat:"Сотрудничество", text:"Учитывает мнение других участников."},
  {cat:"Сотрудничество", text:"Сотрудничает с другими для достижения общей цели."},
];
const CATS = ["Коммуникация","Социальная активность","Внимание","Эмоциональные реакции","Сотрудничество"];
const LEVELS = [
  {min:4.3, label:"высокий"},
  {min:3.5, label:"средне-высокий"},
  {min:2.5, label:"средний"},
  {min:1.5, label:"средне-низкий"},
  {min:0,   label:"низкий"}
];
const PHRASES = {
  "Коммуникация":{high:"человек активно вступал во взаимодействие и поддерживал коммуникацию.",mid:"коммуникация проявлялась периодически, без выраженной инициативы.",low:"инициатива в общении наблюдалась редко."},
  "Социальная активность":{high:"наблюдалось активное участие в совместной деятельности.",mid:"участие в совместной деятельности было умеренным.",low:"участие в совместной деятельности было ограниченным."},
  "Внимание":{high:"человек преимущественно сохранял внимание и следовал инструкции.",mid:"внимание удерживалось непостоянно.",low:"удержание внимания вызывало заметные трудности."},
  "Эмоциональные реакции":{high:"эмоциональные реакции были устойчивыми и контролируемыми.",mid:"в отдельных ситуациях наблюдались изменения эмоциональных реакций.",low:"часто наблюдались сложности с контролем эмоциональных реакций."},
  "Сотрудничество":{high:"часто проявлялись готовность взаимодействовать и учитывать мнение других.",mid:"готовность к сотрудничеству проявлялась ситуативно.",low:"сотрудничество с другими наблюдалось редко."}
};
function phraseFor(cat, level){
  if(level==="высокий") return PHRASES[cat].high;
  if(level==="средне-высокий" || level==="средний") return PHRASES[cat].mid;
  return PHRASES[cat].low;
}
let state = {situation:null, answers:{}};

const grid = document.getElementById('sit-grid');
grid.addEventListener('click', e=>{
  const card = e.target.closest('.sit-card'); if(!card) return;
  [...grid.children].forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');
  state.situation = card.dataset.v;
  document.getElementById('to-2').disabled = false;
});

const qc = document.getElementById('q-container');
const SCALE_WORDS = ['никогда','редко','иногда','часто','всегда'];
let html = ''; let lastCat = '';
QUESTIONS.forEach((q,i)=>{
  if(q.cat !== lastCat){ if(lastCat) html+='</div>'; html += `<div class="q-group"><div class="q-cat">${q.cat}</div>`; lastCat=q.cat; }
  html += `<div class="q-item"><p>${i+1}. ${q.text}</p><div class="scale">`;
  for(let v=1; v<=5; v++){
    html += `<label title="${v} — ${SCALE_WORDS[v-1]}"><input type="radio" name="q${i}" value="${v}" onchange="onAnswer(${i},${v})"><div class="dot">${v}</div></label>`;
  }
  html += `</div></div>`;
});
html += '</div>';
qc.innerHTML = html;

function onAnswer(i,v){
  state.answers[i]=v;
  document.getElementById('to-3').disabled = Object.keys(state.answers).length < QUESTIONS.length;
}

function showView(n){
  document.querySelectorAll('.app-view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+n).classList.add('active');
  document.querySelectorAll('.app-progress span').forEach(s=>{
    s.classList.toggle('done', parseInt(s.dataset.p) <= n);
  });
}
document.getElementById('to-2').onclick = ()=>showView(2);
document.getElementById('to-1').onclick = ()=>showView(1);
document.getElementById('to-2b').onclick = ()=>showView(2);
document.getElementById('to-3').onclick = ()=>{ renderResults(); showView(3); };
document.getElementById('restart').onclick = ()=>{
  state = {situation:null, answers:{}};
  [...grid.children].forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('input[type=radio]').forEach(r=>r.checked=false);
  document.getElementById('to-2').disabled = true;
  document.getElementById('to-3').disabled = true;
  showView(1);
  document.getElementById('app').scrollIntoView({behavior:'smooth'});
};

function renderResults(){
  document.getElementById('sit-echo').textContent = state.situation || '—';
  const el = document.getElementById('results');
  let out = '';
  CATS.forEach((cat,ci)=>{
    const i1 = ci*2, i2 = ci*2+1;
    const avg = ((state.answers[i1]||0) + (state.answers[i2]||0)) / 2;
    const level = LEVELS.find(l=>avg>=l.min).label;
    out += `<div class="result-row">
      <div class="result-head"><span>${cat}</span><strong>${avg.toFixed(1)} / 5</strong></div>
      <div class="bar-track"><div class="bar-fill" style="width:${avg/5*100}%"></div></div>
      <div class="interp"><strong style="color:var(--ink); font-weight:600;">${level}.</strong> В процессе наблюдения ${phraseFor(cat, level)}</div>
    </div>`;
  });
  el.innerHTML = out;
}
