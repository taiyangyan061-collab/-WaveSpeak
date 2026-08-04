import { CREATIVE } from "./data/creative-lab.js";
import { createVoiceService } from "./core/audio.js";
import { createRouter } from "./core/router.js";
import { mountBrowserCompatibility } from "./core/browser.js";
import { createJSONStore } from "./core/storage.js";

const response = await fetch("/src/data/seed-content.json?v=18", { cache: "no-store" });
if (!response.ok) throw new Error("WaveSpeak content failed to load.");
const DATA = await response.json();


const $=id=>document.getElementById(id);id=>document.getElementById(id);

const store = createJSONStore("ws18_");
const defaultSettings = {
  voiceEngine: "browser",
  aiVoice: "marin",
  aiStyle: "natural",
  dailySentenceTarget: 10,
  soundRatio: 0.4
};
let appSettings = { ...defaultSettings, ...store.get("settings", {}) };

const voiceService = createVoiceService({
  getEngine: () => appSettings.voiceEngine,
  getVoice: () => appSettings.aiVoice,
  getStyle: () => appSettings.aiStyle,
  onStatus: message => { if ($("sStatus")) $("sStatus").textContent = message; },
  onAIStatus: message => { if ($("aiVoiceStatus")) $("aiVoiceStatus").textContent = message; }
});
const speak = (text, rate = 0.88) => voiceService.play(text, rate);

mountBrowserCompatibility({
  banner: $("compatBanner"),
  title: $("compatTitle"),
  text: $("compatText"),
  dismiss: $("dismissCompat"),
  storageKey: "ws18_hide_compat"
});

const topicIndex=(new Date().getDay()+6)%7, topic=DATA.topics[topicIndex];
let current=+(localStorage.ws17_current||0),dictIndex=0,studioIndex=0;
let completed=JSON.parse(localStorage.ws17_completed||"[]"),favorites=JSON.parse(localStorage.ws17_favorites||"[]");
let voices=[],recorder,parts=[],mineUrl=null,modelPlayer=null,currentModelBuffer=null;

const router = createRouter({
  onNavigate(id) {
    if (id === "library") renderLibrary();
    if (id === "progress") renderProgress();
    if (id === "settings") { syncSettingsUI(); updateEngineAvailability(); }
    if (id === "dailyPlan") renderDailyPlanV18();
  }
});
router.mount();
const openScreen = router.open;
$("todayTheme").textContent=topic.name;

function allSentences(){return DATA.topics.flatMap((t,ti)=>t.sentences.map((s,si)=>({...s,topic:t.name,ti,si})))}
function currentSentence(){return topic.sentences[current%topic.sentences.length]}
function globalIndex(){let n=0;for(let i=0;i<topicIndex;i++)n+=DATA.topics[i].sentences.length;return n+(current%topic.sentences.length)}
function save(){localStorage.ws17_current=current;localStorage.ws17_completed=JSON.stringify(completed);localStorage.ws17_favorites=JSON.stringify(favorites)}
function renderHome(){ $("doneCount").textContent=completed.length;$("homeProgress").style.width=Math.min(100,completed.length/8*100)+"%"}
function renderSpeaking(){const s=currentSentence();$("sTopic").textContent=topic.name;$("sFocus").textContent=s.focus;$("sCounter").textContent=`${current%topic.sentences.length+1} of ${topic.sentences.length}`;$("sSentence").textContent=s.text;$("sChunks").innerHTML=s.chunks.map(x=>`<span class="chunk">${x}</span>`).join("");$("favBtn").textContent=favorites.includes(s.text)?"★":"☆";$("vTopic").textContent=topic.name;$("vSentence").textContent=s.text;loadModel();renderHome()}
$("listenBtn").addEventListener("click",()=>speak(currentSentence().text,+$("speed").value));
$("phraseBtn").addEventListener("click", () => {
  voiceService.playSequence(currentSentence().chunks, 0.78);
});
$("randomBtn").addEventListener("click",()=>{current=Math.floor(Math.random()*topic.sentences.length);save();renderSpeaking()});
$("completeBtn").addEventListener("click",()=>{const t=currentSentence().text;if(!completed.includes(t))completed.push(t);current=(current+1)%topic.sentences.length;save();renderSpeaking()});
$("favBtn").addEventListener("click",()=>{const t=currentSentence().text;favorites=favorites.includes(t)?favorites.filter(x=>x!==t):[...favorites,t];save();renderSpeaking()});

async function recordAudio(statusEl,recordBtn,playBtn,onDecoded){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!("MediaRecorder" in window)){statusEl.textContent="Recording is not supported here. Use Safari or Chrome over HTTPS.";return;}if(recorder&&recorder.state==="recording"){recorder.stop();return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});parts=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>parts.push(e.data);recorder.onstop=async()=>{const blob=new Blob(parts,{type:recorder.mimeType});if(mineUrl)URL.revokeObjectURL(mineUrl);mineUrl=URL.createObjectURL(blob);playBtn.disabled=false;recordBtn.textContent="● Record";statusEl.textContent="Recording ready.";const arr=await blob.arrayBuffer(),ctx=new AudioContext();try{const buf=await ctx.decodeAudioData(arr.slice(0));if(onDecoded)onDecoded(buf)}catch{}await ctx.close();stream.getTracks().forEach(t=>t.stop())};recorder.start();recordBtn.textContent="■ Stop";statusEl.textContent="Recording…"}catch{statusEl.textContent="Please allow microphone access."}}
$("recordBtn").addEventListener("click",()=>recordAudio($("sStatus"),$("recordBtn"),$("playBtn")));
$("playBtn").addEventListener("click",()=>{if(mineUrl)new Audio(mineUrl).play()});
$("visualRecord").addEventListener("click",()=>recordAudio($("vStatus"),$("visualRecord"),$("visualMine"),buf=>{drawWave(buf,$("myWave"));drawSpec(buf,$("mySpec"))}));
$("visualMine").addEventListener("click",()=>{if(mineUrl)new Audio(mineUrl).play()});

function drawEmpty(canvas,label){const c=canvas.getContext("2d");c.fillStyle="#0b0910";c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle="#8f859a";c.font="18px sans-serif";c.textAlign="center";c.fillText(label,canvas.width/2,canvas.height/2)}
function drawWave(buffer,canvas){const d=buffer.getChannelData(0),c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.fillStyle="#0b0910";c.fillRect(0,0,w,h);c.strokeStyle="#a78bfa";c.lineWidth=2;c.beginPath();for(let x=0;x<w;x++){const start=Math.floor(x*d.length/w),end=Math.floor((x+1)*d.length/w);let min=1,max=-1;for(let i=start;i<end;i++){if(d[i]<min)min=d[i];if(d[i]>max)max=d[i]}c.moveTo(x,(1+min)*h/2);c.lineTo(x,(1+max)*h/2)}c.stroke()}
function dft(samples){const N=samples.length,out=new Float32Array(N/2);for(let k=0;k<N/2;k++){let re=0,im=0;for(let n=0;n<N;n++){const a=2*Math.PI*k*n/N;re+=samples[n]*Math.cos(a);im-=samples[n]*Math.sin(a)}out[k]=Math.hypot(re,im)}return out}
function drawSpec(buffer,canvas){const data=buffer.getChannelData(0),N=512,step=Math.max(1,Math.floor(data.length/N)),sample=new Float32Array(N);for(let i=0;i<N;i++)sample[i]=data[Math.min(data.length-1,i*step)]*(.5-.5*Math.cos(2*Math.PI*i/(N-1)));const spec=dft(sample),max=Math.max(...spec,1e-6),c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.fillStyle="#0b0910";c.fillRect(0,0,w,h);c.strokeStyle="#a78bfa";c.lineWidth=3;c.beginPath();for(let x=0;x<w;x++){const j=Math.floor(x/w*(spec.length-1)),db=20*Math.log10(spec[j]/max+1e-8),y=h-Math.max(0,Math.min(1,(db+70)/70))*h;x===0?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
async function loadModel(){const url=`/audio/model_${String(globalIndex()).padStart(2,"0")}.wav?v=18`;modelPlayer=new Audio(url);try{const arr=await fetch(url,{cache:"no-store"}).then(r=>r.arrayBuffer()),ctx=new AudioContext(),buf=await ctx.decodeAudioData(arr);currentModelBuffer=buf;drawWave(buf,$("modelWave"));drawSpec(buf,$("modelSpec"));await ctx.close()}catch{drawEmpty($("modelWave"),"Model unavailable");drawEmpty($("modelSpec"),"Model unavailable")}drawEmpty($("myWave"),"Record your voice");drawEmpty($("mySpec"),"Record your voice")}
$("modelPlay").addEventListener("click",()=>{if(modelPlayer){modelPlayer.currentTime=0;modelPlayer.play()}});

document.querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>speak(DATA.dictations[dictIndex][0],+b.dataset.rate)));
function norm(s){return s.toLowerCase().replace(/[^\w\s']/g,"").replace(/\s+/g," ").trim()}
function renderDict(){ $("dictHint").textContent=DATA.dictations[dictIndex][1];$("dictInput").value="";$("dictResult").textContent=""}
$("dictCheck").addEventListener("click",()=>{$("dictResult").innerHTML=norm($("dictInput").value)===norm(DATA.dictations[dictIndex][0])?"<b style='color:var(--good)'>Correct!</b>":"Answer: <b>"+DATA.dictations[dictIndex][0]+"</b>"});
$("dictNext").addEventListener("click",()=>{dictIndex=(dictIndex+1)%DATA.dictations.length;renderDict()});

$("chunkList").innerHTML=topic.sentences.flatMap(s=>s.chunks).map(x=>`<div class="item"><b>${x}</b><p class="muted">Say it as one rhythm unit.</p><button class="btn soft speakText" data-text="${encodeURIComponent(x)}">▶ Listen</button></div>`).join("");
$("phrasalList").innerHTML=topic.phrasals.map(x=>`<div class="item phraseGrid"><div class="phrase">${x[0]}</div><div><b>${x[1]}</b><p>${x[2]}</p><button class="btn soft speakText" data-text="${encodeURIComponent(x[0]+'. '+x[2])}">▶ Listen</button></div></div>`).join("");

function renderLibrary(){const q=$("searchBox").value.toLowerCase(),cat=$("categoryFilter").value;let rows=[];if(cat!=="Sound Design"){rows.push(...allSentences().map(s=>({title:s.text,sub:`Daily English · ${s.topic} · ${s.focus}`,speech:s.text})));rows.push(...DATA.topics.flatMap(t=>t.phrasals.map(x=>({title:x[0],sub:`Phrasal Verb · ${x[1]} · ${x[2]}`,speech:x[0]+'. '+x[2]}))))}if(cat!=="Daily English"){rows.push(...DATA.sound.map(x=>({title:x[0],sub:`Sound Design · ${x[3]} · ${x[1]} · ${x[2]}`,speech:x[0]+'. '+x[2]})))}rows=rows.filter(r=>(r.title+" "+r.sub).toLowerCase().includes(q));$("libraryList").innerHTML=rows.map(r=>`<div class="item"><b>${r.title}</b><p class="muted">${r.sub}</p><button class="btn soft speakText" data-text="${encodeURIComponent(r.speech)}">▶ Listen</button></div>`).join("");bindSpeakButtons()}
$("searchBox").addEventListener("input",renderLibrary);$("categoryFilter").addEventListener("change",renderLibrary);
function bindSpeakButtons(){document.querySelectorAll(".speakText").forEach(b=>b.addEventListener("click",()=>speak(decodeURIComponent(b.dataset.text))))}
bindSpeakButtons();

function renderStudio(){const s=DATA.studio[studioIndex];$("studioLead").textContent=s[0];$("studioPrompt").textContent="“"+s[1]+"”";$("studioResponse").textContent=s[2]}
$("studioPromptBtn").addEventListener("click",()=>speak(DATA.studio[studioIndex][1]));
$("studioResponseBtn").addEventListener("click",()=>speak(DATA.studio[studioIndex][2]));
$("studioNext").addEventListener("click",()=>{studioIndex=(studioIndex+1)%DATA.studio.length;renderStudio()});

function renderProgress(){let last=localStorage.ws17_date,today=new Date().toISOString().slice(0,10),st=+(localStorage.ws17_streak||1);if(last&&last!==today){let d=Math.round((new Date(today)-new Date(last))/86400000);st=d===1?st+1:1}localStorage.ws17_date=today;localStorage.ws17_streak=st;$("progressDone").textContent=completed.length;$("streak").textContent=st;$("favoriteCount").textContent=favorites.length;$("favoriteList").innerHTML=favorites.length?favorites.map(t=>`<div class="item"><b>${t}</b><button class="btn soft speakText" data-text="${encodeURIComponent(t)}">▶ Listen</button></div>`).join(""):'<div class="muted">No saved practice yet.</div>';bindSpeakButtons()}
$("resetBtn").addEventListener("click",()=>{if(confirm("Reset all local WaveSpeak progress?")){completed=[];favorites=[];current=0;save();renderSpeaking();renderProgress()}});

let creativeCategory=Object.keys(CREATIVE.categories)[0],listenIndex=0,compareIndex=0,builderContext="Critique",labRecorder,labParts=[],labUrl=null,currentLabSound=0;

function renderCreativeCategories(){
 $("creativeCategoryTabs").innerHTML=Object.keys(CREATIVE.categories).map(c=>`<button class="chip ${c===creativeCategory?"active":""}" data-creative-cat="${c}">${c}</button>`).join("");
 document.querySelectorAll("[data-creative-cat]").forEach(b=>b.addEventListener("click",()=>{creativeCategory=b.dataset.creativeCat;renderCreativeCategories();renderCreativeVocabulary()}));
}
function renderCreativeVocabulary(){
 $("creativeVocabList").innerHTML=CREATIVE.categories[creativeCategory].map(v=>`<div class="vocabEntry"><h3>${v[0]}</h3><div class="definition">${v[1]}</div><div class="example">${v[2]}</div><div class="controls"><button class="btn soft creativeSpeak" data-text="${encodeURIComponent(v[0]+'. '+v[2])}">▶ Listen</button></div></div>`).join("");
 bindCreativeSpeak();
}
function bindCreativeSpeak(){document.querySelectorAll(".creativeSpeak").forEach(b=>b.addEventListener("click",()=>speak(decodeURIComponent(b.dataset.text))))}
document.querySelectorAll(".labTab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".labTab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".labPane").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.lab).classList.add("active")}));

let labAudioCtx;
function ensureLabCtx(){if(!labAudioCtx)labAudioCtx=new (window.AudioContext||window.webkitAudioContext)();if(labAudioCtx.state==="suspended")labAudioCtx.resume();return labAudioCtx}
function createLabSound(type){
 const ctx=ensureLabCtx(),now=ctx.currentTime,duration=4,master=ctx.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.25,now+.08);master.gain.exponentialRampToValueAtTime(.0001,now+duration);master.connect(ctx.destination);
 if(type==="eerie"){const o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain();o1.type="sine";o2.type="sine";o1.frequency.value=220;o2.frequency.value=331;lfo.frequency.value=.35;lg.gain.value=18;lfo.connect(lg);lg.connect(o2.frequency);o1.connect(master);o2.connect(master);o1.start();o2.start();lfo.start();o1.stop(now+duration);o2.stop(now+duration);lfo.stop(now+duration)}
 if(type==="muffled"){const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();osc.type="sawtooth";osc.frequency.value=95;filter.type="lowpass";filter.frequency.value=420;osc.connect(filter);filter.connect(master);osc.start();osc.stop(now+duration)}
 if(type==="cavernous"){for(let i=0;i<7;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=120+i*34;g.gain.setValueAtTime(.12/(i+1),now+i*.38);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(master);o.start(now+i*.38);o.stop(now+duration)}}
 if(type==="pulsating"){const o=ctx.createOscillator(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();o.type="sine";o.frequency.value=85;lfo.frequency.value=2.2;lg.gain.value=.45;lfo.connect(lg);lg.connect(g.gain);g.gain.value=.5;o.connect(g);g.connect(master);o.start();lfo.start();o.stop(now+duration);lfo.stop(now+duration)}
 if(type==="accumulate"){for(let i=0;i<9;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type=i%2?"triangle":"sine";o.frequency.value=120+i*47;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+i*.35+.1);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(master);o.start();o.stop(now+duration)}}
}
function renderListeningExercise(){
 const ex=CREATIVE.listening[listenIndex];$("soundExerciseTitle").textContent=`Sound Example ${listenIndex+1} of ${CREATIVE.listening.length}`;$("soundChoices").innerHTML=ex.choices.map(c=>`<button class="choice" data-sound-choice="${c}"><b>${c}</b></button>`).join("");$("soundFeedback").textContent="";
 document.querySelectorAll("[data-sound-choice]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-sound-choice]").forEach(x=>x.disabled=true);if(b.dataset.soundChoice===ex.type){b.classList.add("correct");$("soundFeedback").innerHTML=`<b style="color:var(--good)">Correct.</b> ${ex.explain}`}else{b.classList.add("wrong");document.querySelector(`[data-sound-choice="${ex.type}"]`).classList.add("correct");$("soundFeedback").innerHTML=`The best word is <b>${ex.type}</b>. ${ex.explain}`}}))
}
$("playSoundExample").addEventListener("click",()=>createLabSound(CREATIVE.listening[listenIndex].type));
$("replaySoundExample").addEventListener("click",()=>createLabSound(CREATIVE.listening[listenIndex].type));
$("nextSoundExercise").addEventListener("click",()=>{listenIndex=(listenIndex+1)%CREATIVE.listening.length;renderListeningExercise()});

function renderComparison(){
 const ex=CREATIVE.comparisons[compareIndex];$("comparisonTitle").textContent=ex.title;$("comparisonPrompt").textContent=ex.prompt;$("comparisonChoices").innerHTML=ex.options.map(x=>`<button class="choice" data-comparison="${x}"><b>${x}</b></button>`).join("");$("comparisonExplanation").textContent="Choose the stronger word for the context.";
 document.querySelectorAll("[data-comparison]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-comparison]").forEach(x=>x.disabled=true);if(b.dataset.comparison===ex.answer)b.classList.add("correct");else{b.classList.add("wrong");document.querySelector(`[data-comparison="${ex.answer}"]`).classList.add("correct")}$("comparisonExplanation").innerHTML=`<b>${ex.answer}</b>: ${ex.explain}`}))
}
$("nextComparison").addEventListener("click",()=>{compareIndex=(compareIndex+1)%CREATIVE.comparisons.length;renderComparison()});

const speakSoundTypes=["eerie","muffled","cavernous","pulsating","accumulate"];
$("speakSoundPlay").addEventListener("click",()=>createLabSound(speakSoundTypes[currentLabSound]));
$("newSpeakPrompt").addEventListener("click",()=>{currentLabSound=(currentLabSound+1)%speakSoundTypes.length;$("speakPrompt").textContent=`Describe this ${currentLabSound+1} of ${speakSoundTypes.length} sound for 20–40 seconds. Discuss atmosphere, texture, space, movement, and narrative function.`;$("labTranscript").value="";$("descriptionFeedback").innerHTML='<p class="muted">Record or type your description, then request feedback.</p>'});

$("labRecordBtn").addEventListener("click",async()=>{if(labRecorder&&labRecorder.state==="recording"){labRecorder.stop();return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});labParts=[];labRecorder=new MediaRecorder(stream);labRecorder.ondataavailable=e=>labParts.push(e.data);labRecorder.onstop=()=>{const blob=new Blob(labParts,{type:labRecorder.mimeType});if(labUrl)URL.revokeObjectURL(labUrl);labUrl=URL.createObjectURL(blob);$("labPlayRecording").disabled=false;$("labRecordBtn").textContent="● Record Description";stream.getTracks().forEach(t=>t.stop())};labRecorder.start();$("labRecordBtn").textContent="■ Stop Recording";
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR){const sr=new SR();sr.lang="en-US";sr.continuous=true;sr.interimResults=true;sr.onresult=e=>{let text="";for(let i=0;i<e.results.length;i++)text+=e.results[i][0].transcript+" ";$("labTranscript").value=text.trim()};sr.start();labRecorder.addEventListener("stop",()=>{try{sr.stop()}catch{}},{once:true})}
 }catch{$("descriptionFeedback").innerHTML='<p>Please allow microphone access.</p>'}});
$("labPlayRecording").addEventListener("click",()=>{if(labUrl)new Audio(labUrl).play()});

$("analyzeDescription").addEventListener("click",()=>{const text=$("labTranscript").value.toLowerCase();const groups={
 "Atmosphere":["eerie","ominous","haunting","ethereal","oppressive","serene","dreamlike"],
 "Timbre":["grainy","brittle","glassy","metallic","abrasive","muffled","resonant","warm","saturated"],
 "Space":["intimate","distant","enclosed","cavernous","diffuse","localized","immersive","dry","reverberant"],
 "Movement":["emerge","emerges","dissolve","dissolves","swell","swells","recede","recedes","drift","drifts","accumulate","accumulates","scatter","scatters","morph","morphs","collapse","collapses"],
 "Dramaturgy":["sonic world","sonic motif","emotional arc","dramatic tension","psychological space","sonic memory","sense of place","narrative function"]
 };let found={},score=0;Object.entries(groups).forEach(([g,ws])=>{found[g]=ws.filter(w=>text.includes(w));if(found[g].length)score++});const professional=/begins|gradually|creates|supports|suggests|establishes|functions|transforms|develops|throughout/.test(text);if(professional)score++;
 const wordCount=text.trim()?text.trim().split(/\s+/).length:0;
 $("descriptionFeedback").innerHTML=`<h3>Feedback</h3><div class="rubric">${Object.keys(groups).map(g=>`<div class="rubricItem ${found[g].length?"ok":""}"><b>${g}</b><br>${found[g].length?found[g].join(", "):"Add one term"}</div>`).join("")}<div class="rubricItem ${professional?"ok":""}"><b>Professional structure</b><br>${professional?"Clear descriptive verb used":"Add begins / creates / supports / transforms"}</div></div><p><b>Coverage: ${score}/6</b> · ${wordCount} words</p><p class="muted">${score>=5?"Strong professional description. Add one precise contrast or narrative consequence for more depth.":score>=3?"Good foundation. Add vocabulary from the missing categories and explain what the sound does dramatically.":"Build the description in this order: atmosphere → timbre → space → movement → narrative function."}</p>`;
});

const builderWords={
 atmosphere:["eerie","ominous","haunting","ethereal","oppressive","serene","dreamlike"],
 timbre:["grainy","brittle","glassy","metallic","abrasive","muffled","resonant","warm","saturated"],
 space:["intimate","distant","enclosed","cavernous","diffuse","localized","immersive","dry","reverberant"],
 movement:["emerge","dissolve","swell","recede","drift","accumulate","scatter","morph","collapse"],
 drama:["sonic motif","emotional arc","dramatic tension","psychological space","sonic memory","sense of place","narrative function"]
};
function fillSelect(id,arr){$(id).innerHTML=arr.map(x=>`<option>${x}</option>`).join("")}
fillSelect("builderAtmosphere",builderWords.atmosphere);fillSelect("builderTimbre",builderWords.timbre);fillSelect("builderSpace",builderWords.space);fillSelect("builderMovement",builderWords.movement);fillSelect("builderDrama",builderWords.drama);
$("contextChoices").innerHTML=Object.keys(CREATIVE.contexts).map(c=>`<div class="contextCard ${c===builderContext?"active":""}" data-context="${c}"><b>${c}</b></div>`).join("");
function renderBuilderContexts(){document.querySelectorAll("[data-context]").forEach(c=>c.classList.toggle("active",c.dataset.context===builderContext))}
document.querySelectorAll("[data-context]").forEach(c=>c.addEventListener("click",()=>{builderContext=c.dataset.context;renderBuilderContexts();renderBuiltSentence()}));
function renderBuiltSentence(variation=false){let template=CREATIVE.contexts[builderContext],vals={atmosphere:$("builderAtmosphere").value,timbre:$("builderTimbre").value,space:$("builderSpace").value,movement:$("builderMovement").value,drama:$("builderDrama").value};let sentence=template.replace(/\{(\w+)\}/g,(_,k)=>vals[k]);if(variation){const starters=["In this moment, ","Across the transition, ","From a dramaturgical perspective, "];sentence=starters[Math.floor(Math.random()*starters.length)]+sentence.charAt(0).toLowerCase()+sentence.slice(1)}$("builderOutput").textContent=sentence;$("builderTip").textContent=builderContext==="Director Conversation"?"Keep the language collaborative and connect the sonic choice to the scene, performer, or dialogue.":builderContext==="Portfolio"?"Describe both your artistic intention and the technique used to achieve it.":"Use precise adjectives, active transformation verbs, and a clear dramatic consequence."}
["builderAtmosphere","builderTimbre","builderSpace","builderMovement","builderDrama"].forEach(id=>$(id).addEventListener("change",()=>renderBuiltSentence()));
$("speakBuiltSentence").addEventListener("click",()=>speak($("builderOutput").textContent));
$("copyVariation").addEventListener("click",()=>renderBuiltSentence(true));
renderCreativeCategories();renderCreativeVocabulary();renderListeningExercise();renderComparison();renderBuiltSentence();


let CONTENT_CATALOG=null;
async function loadContentCatalog(){
 try{
  const response=await fetch("/content-catalog.json?v=18",{cache:"no-store"});
  if(!response.ok)throw new Error("catalog");
  CONTENT_CATALOG=await response.json();
  renderContentEngine();
 }catch(e){
  $("enginePlan").innerHTML='<div class="item">Content catalog could not be loaded. Refresh after deployment.</div>';
 }
}
function contentHistory(){
 try{return JSON.parse(localStorage.ws17_content_history||"{}")}catch{return {}}
}
function saveContentHistory(h){localStorage.ws17_content_history=JSON.stringify(h)}
function dateKey(d=new Date()){return d.toISOString().slice(0,10)}
function dueItems(catalog,history){
 const today=dateKey();
 return catalog.daily_sentences.filter(item=>{
  const h=history[item.id];
  return h&&h.next_review&&h.next_review<=today;
 });
}
function newItems(catalog,history){
 return catalog.daily_sentences.filter(item=>!history[item.id]);
}
function buildDailyPlan(){
 if(!CONTENT_CATALOG)return[];
 const history=contentHistory();
 const due=dueItems(CONTENT_CATALOG,history).slice(0,4);
 const unseen=newItems(CONTENT_CATALOG,history);
 const topicName=DATA.topics[topicIndex].name;
 const preferred=unseen.filter(x=>x.topic===topicName);
 const pool=[...preferred,...unseen.filter(x=>x.topic!==topicName)];
 const selected=[];
 for(const item of pool){if(selected.length>=6)break;if(!selected.some(x=>x.id===item.id)&&!due.some(x=>x.id===item.id))selected.push(item)}
 return [...due.map(x=>({...x,plan_type:"Review"})),...selected.map(x=>({...x,plan_type:"New"}))].slice(0,10);
}
function renderPlan(plan){
 localStorage.ws17_today_plan=JSON.stringify({date:dateKey(),ids:plan.map(x=>x.id)});
 $("enginePlan").innerHTML=plan.length?plan.map((x,i)=>`<div class="item"><span class="tag">${x.plan_type}</span><b>${i+1}. ${x.text}</b><p class="muted">${x.topic} · ${x.level} · ${x.focus}</p><button class="btn soft engineSpeak" data-text="${encodeURIComponent(x.text)}">▶ Listen</button></div>`).join(""):'<div class="item">No items available.</div>';
 document.querySelectorAll(".engineSpeak").forEach(b=>b.addEventListener("click",()=>speak(decodeURIComponent(b.dataset.text))));
}
function completePlan(){
 if(!CONTENT_CATALOG)return;
 let plan;
 try{plan=JSON.parse(localStorage.ws17_today_plan||"{}")}catch{plan={}}
 if(!plan.ids||!plan.ids.length){renderPlan(buildDailyPlan());return}
 const history=contentHistory(),today=new Date();
 plan.ids.forEach(id=>{
  const old=history[id]||{repetitions:0};
  const repetitions=old.repetitions+1;
  const intervals=[1,3,7,14,30,60];
  const next=new Date(today);next.setDate(next.getDate()+intervals[Math.min(repetitions-1,intervals.length-1)]);
  history[id]={repetitions,last_review:dateKey(today),next_review:dateKey(next)};
 });
 saveContentHistory(history);
 $("enginePlan").innerHTML='<div class="item"><b>Today’s plan completed.</b><p class="muted">These items were added to the spaced-review schedule.</p></div>';
}
function renderEngineTopic(){
 if(!CONTENT_CATALOG)return;
 const topic=$("engineTopicSelect").value,level=$("engineLevelSelect").value;
 let rows=CONTENT_CATALOG.daily_sentences.filter(x=>x.topic===topic&&(level==="All"||x.level===level));
 $("engineTopicItems").innerHTML=rows.map(x=>`<div class="item"><b>${x.text}</b><p class="muted">${x.level} · ${x.focus} · ${x.chunk_ids.length} chunks</p><button class="btn soft engineSpeak" data-text="${encodeURIComponent(x.text)}">▶ Listen</button></div>`).join("");
 document.querySelectorAll(".engineSpeak").forEach(b=>b.addEventListener("click",()=>speak(decodeURIComponent(b.dataset.text))));
}
function renderContentEngine(){
 const c=CONTENT_CATALOG.counts;
 $("engineSentenceCount").textContent=c.sentences;$("engineChunkCount").textContent=c.chunks;$("enginePhrasalCount").textContent=c.phrasal_verbs;$("engineSoundCount").textContent=c.sound_terms;
 const topics=[...new Set(CONTENT_CATALOG.daily_sentences.map(x=>x.topic))];
 $("engineTopicSelect").innerHTML=topics.map(t=>`<option>${t}</option>`).join("");
 renderPlan(buildDailyPlan());renderEngineTopic();
}
$("generatePlan").addEventListener("click",()=>renderPlan(buildDailyPlan()));
$("markPlanComplete").addEventListener("click",completePlan);
$("engineTopicSelect").addEventListener("change",renderEngineTopic);
$("engineLevelSelect").addEventListener("change",renderEngineTopic);
loadContentCatalog();




function saveSettingsFromUI() {
  const selectedEngine = document.querySelector('input[name="voiceEngine"]:checked')?.value || "browser";
  appSettings = {
    voiceEngine: selectedEngine,
    aiVoice: $("settingsVoice").value,
    aiStyle: $("settingsStyle").value,
    dailySentenceTarget: Number($("dailySentenceTarget").value),
    soundRatio: Number($("soundRatio").value)
  };
  store.set("settings", appSettings);
  $("settingsStatus").textContent = "Settings saved.";
  syncSettingsUI();
}

function syncSettingsUI() {
  document.querySelectorAll('input[name="voiceEngine"]').forEach(radio => {
    radio.checked = radio.value === appSettings.voiceEngine;
  });
  $("settingsVoice").value = appSettings.aiVoice;
  $("settingsStyle").value = appSettings.aiStyle;
  $("dailySentenceTarget").value = String(appSettings.dailySentenceTarget);
  $("soundRatio").value = String(appSettings.soundRatio);
  if ($("aiVoiceSelect")) $("aiVoiceSelect").value = appSettings.aiVoice;
  if ($("aiStyleSelect")) $("aiStyleSelect").value = appSettings.aiStyle;
}

async function updateEngineAvailability() {
  $("engineAvailability").textContent = "Checking AI Voice availability…";
  const available = await voiceService.checkAIAvailability();
  $("engineAvailability").innerHTML = available
    ? "<b>AI Voice available.</b> You can select AI Voice."
    : "<b>AI Voice not configured.</b> Browser Voice remains available. Add OPENAI_API_KEY in Vercel to enable AI Voice.";
}

function buildDailyPlanV18() {
  const target = appSettings.dailySentenceTarget;
  const allDaily = DATA.topics.flatMap(t => t.sentences.map(s => ({
    type: "Speaking",
    title: s.text,
    subtitle: `${t.name} · ${s.focus}`,
    speech: s.text
  })));
  const daily = allDaily.slice(0, target);

  const chunkItems = topic.sentences.flatMap(s => s.chunks).slice(0, 6).map(text => ({
    type: "Chunk",
    title: text,
    subtitle: topic.name,
    speech: text
  }));

  const phrasalItems = topic.phrasals.slice(0, 5).map(x => ({
    type: "Phrasal Verb",
    title: x[0],
    subtitle: `${x[1]} · ${x[2]}`,
    speech: `${x[0]}. ${x[2]}`
  }));

  const soundCount = Math.max(2, Math.round(target * appSettings.soundRatio));
  const soundItems = DATA.sound.slice(0, soundCount).map(x => ({
    type: "Sound English",
    title: x[0],
    subtitle: `${x[3]} · ${x[1]}`,
    speech: `${x[0]}. ${x[2]}`
  }));

  return [...daily, ...chunkItems, ...phrasalItems, ...soundItems];
}

function renderDailyPlanV18() {
  const items = buildDailyPlanV18();
  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  $("dailyPlanSummary").innerHTML = Object.entries(counts).map(([type, count]) =>
    `<div class="card"><div class="score">${count}</div><p class="muted">${type}</p></div>`
  ).join("");

  $("dailyPlanItems").innerHTML = items.map((item, i) =>
    `<div class="item"><span class="tag">${item.type}</span><b>${i + 1}. ${item.title}</b><p class="muted">${item.subtitle}</p><button class="btn soft planSpeak" data-text="${encodeURIComponent(item.speech)}">▶ Listen</button></div>`
  ).join("");

  document.querySelectorAll(".planSpeak").forEach(button => {
    button.addEventListener("click", () => speak(decodeURIComponent(button.dataset.text)));
  });

  store.set("dailyPlan", { date: new Date().toISOString().slice(0, 10), items });
  $("dailyPlanStatus").textContent = `${items.length} activities prepared.`;
}

$("saveSettings").addEventListener("click", saveSettingsFromUI);
$("testVoice").addEventListener("click", () => speak("WaveSpeak is ready for today's practice."));
$("regenerateDailyPlan").addEventListener("click", renderDailyPlanV18);
$("completeDailyPlan").addEventListener("click", () => {
  store.set("lastCompletedPlan", new Date().toISOString());
  $("dailyPlanStatus").textContent = "Today's plan completed.";
});

document.querySelectorAll('input[name="voiceEngine"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      appSettings.voiceEngine = radio.value;
      store.set("settings", appSettings);
    }
  });
});

syncSettingsUI();
updateEngineAvailability();
renderDailyPlanV18();

renderDict();renderStudio();renderSpeaking();renderLibrary();renderProgress();
if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).finally(()=>window.addEventListener("load",()=>navigator.serviceWorker.register("/service-worker.js?v=18")))}
