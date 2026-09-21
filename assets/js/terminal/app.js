import { phrases } from '@params';
import { resolvePath, tokenize, childNodes, createFilesystem } from './core.mjs';
import { readResource, createSearch } from './content.mjs';
import { createCommands, descriptions, usage } from './commands.mjs';

export async function mountTerminal(entry, config) {
  const [manifest, markup, css] = await Promise.all([readResource(config.manifest), readResource(config.template, 'text'), readResource(config.cssUrl, 'text')]);
  const tree = createFilesystem(manifest);
  const posts = manifest.posts.map(post => ({ ...post, canonical: post.canonical_url }));
  const searchPosts = createSearch(manifest, config.pagefind);
  const host = document.createElement('div');
  host.id = 'terminal-host';
  host.hidden = true;
  const scope = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style'); style.textContent = css; scope.append(style);
  const template = document.createElement('template'); template.innerHTML = markup; scope.append(template.content.cloneNode(true));
  document.body.append(host);
  const $ = selector => scope.querySelector(selector), all = selector => [...scope.querySelectorAll(selector)];
  const dev = $('#dev'), input = $('#command-input'), scroll = $('#terminal-scroll'), transcript = $('#transcript'), reader = $('#reader');
  let commandEpoch = 0;
  let pageInert = [], previousOverflow = '', readerVersion = 0, readerAbort = null, readerTimer = null, readerFrame = null, readingPost = null;
let cwd='/',history=[],historyIndex=-1,savedDraft='',composing=false,previousFocus=null,previousScroll=0,bootTimers=[],petTimers=new Set(),bootVersion=0,ready=false,blink=false,gaze='●',replyIndex=0,bubbleTimer=null;let previousInputMode='pointer',tocObserver=null;host.dataset.inputMode='pointer';
window.addEventListener('pointerdown',()=>host.dataset.inputMode='pointer',true);
window.addEventListener('keydown',e=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))host.dataset.inputMode='keyboard'},true);const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const overview=$('#terminal-overview'),bootWindow=$('#boot-window');let foldTimer=null,bootAutoFocus=false,overviewTouchY=null,readingScrollback=false;function setBootFolded(folded){clearTimeout(foldTimer);foldTimer=null;if(!ready||dev.hidden)return;overview.dataset.bootFolded=String(folded);bootWindow.setAttribute('aria-hidden',String(folded));if(folded||overview.scrollTop)overview.scrollTop=0}

function resetBootFold(){clearTimeout(foldTimer);foldTimer=null;overview.dataset.bootFolded='false';bootWindow.setAttribute('aria-hidden','false');overview.scrollTop=0;readingScrollback=false}

function scheduleBootFold(){clearTimeout(foldTimer);foldTimer=setTimeout(()=>setBootFolded(true),1000)}

function resumePrompt(){if(ready&&!dev.hidden)setBootFolded(true);readingScrollback=false}overview.addEventListener('wheel',e=>{if(!ready||!reader.hidden||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY)return;clearTimeout(foldTimer);const folded=overview.dataset.bootFolded==='true';if(folded&&e.deltaY<0){e.preventDefault();setBootFolded(false)}else if(!folded&&e.deltaY>0&&overview.scrollTop+overview.clientHeight>=overview.scrollHeight-2){e.preventDefault();setBootFolded(true)}},{passive:false});overview.addEventListener('touchstart',e=>{overviewTouchY=e.touches.length===1?e.touches[0].clientY:null;if(ready)clearTimeout(foldTimer)},{passive:true});overview.addEventListener('touchmove',e=>{if(overviewTouchY===null||!ready||!reader.hidden||e.touches.length!==1)return;const dy=e.touches[0].clientY-overviewTouchY,folded=overview.dataset.bootFolded==='true';if(Math.abs(dy)<24)return;if((folded&&dy>0)||(!folded&&dy<0&&overview.scrollTop+overview.clientHeight>=overview.scrollHeight-2)){e.preventDefault();setBootFolded(!folded);overviewTouchY=null}},{passive:false});overview.addEventListener('touchend',()=>overviewTouchY=null,{passive:true});overview.addEventListener('touchcancel',()=>overviewTouchY=null,{passive:true});overview.addEventListener('keydown',e=>{if(e.target!==overview||!ready)return;if(['ArrowUp','Home'].includes(e.key)){e.preventDefault();setBootFolded(false)}else if(['ArrowDown','End'].includes(e.key)){e.preventDefault();setBootFolded(true)}});scroll.addEventListener('pointerdown',()=>{if(ready)setBootFolded(true)});
input.addEventListener('focus',()=>{if(!bootAutoFocus)resumePrompt()});
input.addEventListener('keydown',()=>{if(!bootAutoFocus)resumePrompt()});
input.addEventListener('input',resumePrompt);
input.addEventListener('compositionstart',resumePrompt);scroll.addEventListener('scroll',()=>{readingScrollback=scroll.scrollHeight-scroll.clientHeight-scroll.scrollTop>40;if(readingScrollback){clearTimeout(bubbleTimer);
$('#bubble').hidden=true}},{passive:true});
const info = tree.get('/about.txt')?.content || manifest.description;
tree.set('/home/cat', {type:'file',content:$('#pet-art').textContent});
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}

function out(parent,text,cls){parent.append(el('p',text,cls))}

function announce(t){$('#announcement').textContent=t}

function pretty(p){return p==='/'?'~':'~'+p}

function children(path){return childNodes(tree,path)}

function resolve(raw){return resolvePath(raw,cwd)}

function setCwd(p){cwd=p;
$('#cwd').textContent=pretty(p)}

function syncInput(){$('.input-wrap').classList.toggle('has-value',!!input.value)}

function focusInput(){if(!dev.hidden&&reader.hidden&&ready)input.focus({preventScroll:true})}

function atPrompt(){requestAnimationFrame(()=>{scroll.scrollTop=scroll.scrollHeight})}

const WORDS=phrases.en,WORDS_ZH=phrases.zh;const phraseBags=new Map(),lastPhrase=new Map();const petState={pose:'idle',quiet:false,manualNap:false,lastActivity:Date.now(),snacks:0};const readingTrail=[];let lastPost=null;
function pick(pool='idle',language){const lang=language||(Math.random()<.7?'zh':'en');const bank=lang==='zh'?WORDS_ZH:WORDS;const source=bank[pool]||WORDS_ZH[pool]||bank.idle;pool=lang+':'+pool;let bag=phraseBags.get(pool);if(!bag?.length){bag=source.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(source[bag.at(-1)]===lastPhrase.get(pool)&&bag.length>1)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];phraseBags.set(pool,bag)}const text=source[bag.pop()];lastPhrase.set(pool,text);return text}
function syncPetLabel(){$('#pet').dataset.pose=petState.pose;$('.pet-label').textContent='cat · '+(petState.quiet?'quiet':petState.pose==='sleep'?'sleeping':petState.pose==='play'?'playing':petState.pose==='happy'?'purring':'curious')}
function renderPet(mouth='ᴗ'){syncPetLabel();if(petState.pose==='sleep'){$('#pet-art').textContent='        z\n /\\_/\\  z\n( ─.─ )\n /     \\\n(_______)';return}if(petState.pose==='stretch'){$('#pet-art').textContent=' /\\_/\\\n( ◡ ◡ )\n  >ᴗ<\n /|   |\\\n/ |___| \\';return}const eyes=blink?'─':petState.pose==='happy'?'^':gaze;const toy=petState.pose==='play'?' o':'';
$('#pet-art').textContent=' /\\_/\\\n( '+eyes+' '+eyes+' )\n(  '+mouth+'  )\n /| |\\'+toy+'\n(_| |_)'}
function later(fn,delay){const timer=setTimeout(()=>{petTimers.delete(timer);fn()},delay);petTimers.add(timer);return timer}
function say(text){if(dev.hidden||!ready||petState.quiet||petState.pose==='sleep'||!reader.hidden)return;clearTimeout(bubbleTimer);
$('#bubble').textContent=text;
$('#bubble').hidden=false;
$('#pet').classList.add('speaking');renderPet('o');later(()=>{$('#pet').classList.remove('speaking');renderPet()},400);bubbleTimer=setTimeout(()=>$('#bubble').hidden=true,3400)}
function stopPet(){petTimers.forEach(clearTimeout);petTimers.clear();clearTimeout(bubbleTimer);
$('#bubble').hidden=true;
$('#pet').classList.remove('speaking');blink=false;if(['play','happy','stretch'].includes(petState.pose))petState.pose='idle';renderPet()}
function touchPet(){petState.lastActivity=Date.now();if(petState.pose==='sleep'&&!petState.manualNap){petState.pose='idle';renderPet()}}
function startPet(greeting=true){stopPet();if(greeting)say(pick('greet'));if(reduced.matches||petState.quiet)return;const blinkLoop=()=>{if(!dev.hidden&&!document.hidden&&reader.hidden&&petState.pose!=='sleep'){blink=true;renderPet();later(()=>{blink=false;renderPet()},140)}later(blinkLoop,2800+Math.random()*2400)};const idleLoop=()=>{if(!document.hidden&&reader.hidden&&!readingScrollback){if(!petState.manualNap&&Date.now()-petState.lastActivity>45000){petState.pose='sleep';
$('#bubble').hidden=true;renderPet()}else if(petState.pose!=='sleep'){const hour=new Date().getHours();say(pick(hour<6||hour>22?'night':readingTrail.length&&Math.random()<.3?'reading':Math.random()<.3?'code':'idle'));if(Math.random()<.22){petState.pose='stretch';renderPet();later(()=>{petState.pose='idle';renderPet()},1000)}}}later(idleLoop,9000+Math.random()*5000)};later(blinkLoop,1600);later(idleLoop,6500)}
function petCommand(action) {
  touchPet();
  if (action === 'nap') { stopPet(); petState.manualNap = true; petState.pose = 'sleep'; renderPet(); return; }
  if (action === 'quiet') { petState.quiet = true; stopPet(); return; }
  if (action === 'auto') { petState.quiet = false; startPet(false); say(pick('greet')); return; }
  petState.manualNap = false; petState.pose = 'idle';
  if (action === 'feed') petState.snacks++;
  startPet(false);
  if (action === 'feed' || action === 'play') {
    petState.pose = action === 'feed' ? 'happy' : 'play'; renderPet();
    later(() => { petState.pose = 'idle'; renderPet(); }, action === 'feed' ? 1800 : 1600);
  }
  say(pick(action === 'feed' ? 'feed' : action === 'play' ? 'play' : 'wake'));
}
function trailText(){return readingTrail.length?readingTrail.map((p,i)=>String(i+1).padStart(2,'0')+'  '+p.title+'\n    cat '+JSON.stringify('/posts/'+p.name)).join('\n'):'(no pages opened)'}
tree.set('/home/reading.log',{type:'file',get content(){return trailText()}});
function rememberReading(post){lastPost=post;const index=readingTrail.findIndex(p=>p.name===post.name);if(index>=0)readingTrail.splice(index,1);readingTrail.push(post);if(readingTrail.length>50)readingTrail.shift()}
const bootSteps=[['booting xvsf-shell v0.3',0],['loading /etc/personality.conf',180],['mounting /posts ('+posts.length+' entries)',420],['indexing local content',710],['waking /home/cat',1020],['ready.',1260]];function bootLine(index){const [text,ms]=bootSteps[index],line=el('div',undefined,'boot-line');line.append(el('span','['+(ms/1000).toFixed(2).padStart(5,'0')+'s] ','boot-time'),el('span',text));if(index<bootSteps.length-1)line.append(el('span',' … ok','ok'));
$('#boot').append(line)}

function startup(animate){commandEpoch++;resetBootFold();bootVersion++;const version=bootVersion;bootTimers.forEach(clearTimeout);bootTimers=[];stopPet();closeReader(false);
$('#drawer').hidden=true;
$('#directory-toggle').setAttribute('aria-expanded','false');transcript.replaceChildren();
$('#boot').replaceChildren();
$('#identity').hidden=true;dev.classList.add('booting');ready=false;input.value='';syncInput();historyIndex=-1;scroll.scrollTop=0;const finish=()=>{if(version!==bootVersion||dev.hidden)return;
$('#identity').hidden=false;dev.classList.remove('booting');ready=true;startPet();bootAutoFocus=true;if(matchMedia('(min-width:701px)').matches)focusInput();bootAutoFocus=false;scheduleBootFold();announce('ready')};if(!animate||reduced.matches){bootSteps.forEach((_,i)=>bootLine(i));finish()}else bootSteps.forEach((step,i)=>bootTimers.push(setTimeout(()=>{if(version!==bootVersion||dev.hidden)return;bootLine(i);if(i===bootSteps.length-1)finish()},step[1])))}
function openDev(){host.hidden=false;syncTheme();previousInputMode=document.documentElement.dataset.terminalInput||'pointer';host.dataset.inputMode=previousInputMode;previousFocus=entry;previousScroll=window.scrollY;previousOverflow=document.body.style.overflow;pageInert=[...document.body.children].filter(n=>n!==host).map(n=>[n,n.inert]);pageInert.forEach(([n])=>n.inert=true);document.body.classList.add('terminal-open');document.documentElement.classList.add('terminal-open');dev.hidden=false;document.body.style.overflow='hidden';startup(true);
$('#exit').focus({preventScroll:true})}

function closeDev(){commandEpoch++;clearTimeout(foldTimer);foldTimer=null;bootVersion++;bootTimers.forEach(clearTimeout);bootTimers=[];stopPet();closeReader(false);dev.hidden=true;pageInert.forEach(([n,value])=>n.inert=value);pageInert=[];document.body.style.overflow=previousOverflow;document.body.classList.remove('terminal-open');document.documentElement.classList.remove('terminal-open');host.hidden=true;window.scrollTo(0,previousScroll);host.dataset.inputMode=previousInputMode;document.documentElement.dataset.terminalInput=previousInputMode;previousFocus?.focus({preventScroll:true})}

function toggleTree(){const show=$('#drawer').hidden;
$('#drawer').hidden=!show;
$('#directory-toggle').setAttribute('aria-expanded',String(show));if(show)$('#drawer summary')?.focus();else focusInput()}
function record(raw){const group=el('section',undefined,'record');const prompt=el('div',undefined,'prompt');prompt.append(el('span','xvsf@xvsf.devserver '+pretty(cwd)+' $','prompt-prefix'),el('span',raw,'raw'));const output=el('div',undefined,'output');group.append(prompt,output);transcript.append(group);while(transcript.children.length>200)transcript.firstElementChild.remove();return output}

function syncTheme(){host.dataset.theme=document.documentElement.dataset.theme==='dark'?'dark':'light';readerFrame?.contentWindow?.postMessage({channel:'xvsf-terminal',type:'theme',theme:host.dataset.theme},location.origin)}
new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
function readerFailure(post,hash=''){clearTimeout(readerTimer);readerFrame=null;reader.replaceChildren();const box=el('div',undefined,'reader-error');box.append(el('p','read: unable to load article','error'));const retry=el('button','retry');retry.type='button';retry.addEventListener('click',()=>showReader(post,hash));const back=el('button','← terminal');back.type='button';back.addEventListener('click',()=>closeReader());const original=el('a','open original ↗');original.href=post.canonical+hash;original.target='_blank';original.rel='noopener noreferrer';box.append(retry,document.createTextNode('  '),back,document.createTextNode('  '),original);reader.append(box);back.focus()}
async function showReader(post,hash=''){closeReader(false);const version=++readerVersion;const controller=new AbortController();readerAbort=controller;readingPost=post;clearTimeout(bubbleTimer);
$('#bubble').hidden=true;reader.hidden=false;scroll.inert=true;
$('#terminal-overview').inert=true;
$('#drawer').hidden=true;
$('#directory-toggle').setAttribute('aria-expanded','false');reader.replaceChildren(el('p','reading…','reader-error'));const deadline=setTimeout(()=>controller.abort(),15000);try{const url=new URL(post.reader_url,location.href);if(url.origin!==location.origin)throw Error('read: cross-origin document');await readResource(url,'text',controller.signal);if(version!==readerVersion)return;readerFrame=el('iframe');readerFrame.className='reader-frame';readerFrame.title=post.title;readerFrame.tabIndex=0;url.hash=hash;readerFrame.src=url.href;readerFrame.addEventListener('error',()=>{if(version===readerVersion)readerFailure(post,hash)});reader.replaceChildren(readerFrame);readerTimer=setTimeout(()=>{if(version===readerVersion)readerFailure(post,hash)},20000)}catch(e){if(version===readerVersion)readerFailure(post,hash)}finally{clearTimeout(deadline)}}
function closeReader(focus=true){readerVersion++;readerAbort?.abort();readerAbort=null;clearTimeout(readerTimer);readerFrame=null;readingPost=null;reader.replaceChildren();reader.hidden=true;scroll.inert=false;
$('#terminal-overview').inert=false;if(focus){focusInput();say(pick('return'))}}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==readerFrame?.contentWindow||event.data?.channel!=='xvsf-terminal'||reader.hidden)return;const message=event.data;if(message.type==='ready'){clearTimeout(readerTimer);if(readingPost)rememberReading(readingPost);syncTheme();readerFrame.contentWindow.postMessage({channel:'xvsf-terminal',type:'focus'},location.origin)}else if(message.type==='close')closeReader();else if(message.type==='clear')startup(false);else if(message.type==='navigate'){try{const url=new URL(message.url);if(url.origin!==location.origin)return;const match=posts.find(post=>new URL(post.canonical).pathname===url.pathname);if(match)showReader(match,url.hash);else location.href=url.href}catch{}}});
function reply(message){const m=message.trim().toLowerCase(),language=/[\u3400-\u9fff]/u.test(m)||/^(hi|meow|miao)[!.\s]*$/u.test(m)?'zh':'en';let pool='fallback';if(/喵|meow|miao|咪呜|猫语/.test(m))pool='meow';else if(/累|难过|烦|压力|伤心|难受|sad|stress|upset/.test(m))pool='comfort';else if(/睡|困|晚安|sleep|tired/.test(m))pool='night';else if(/猫|摸|蹭|抱|可爱|cat|purr|cute/.test(m))pool='cuddle';else if(/你好|hello|\bhi\b|嗨|hey|早上好/.test(m))pool='greet';else if(/安全|审计|java|漏洞|security/.test(m))pool='security';else if(/agent|ai|上下文|code|代码|编程/.test(m))pool='code';else if(/吃|鱼|饿|fish|food/.test(m))pool='feed';else if(/谢|thanks|thank you/.test(m))pool='cuddle';else if(/文章|阅读|读书|read|book/.test(m))pool='reading';else if(/玩|毛线|球|play|yarn/.test(m))pool='play';else if(/help|帮助|怎么/.test(m)){return 'pet hi · pet 你好 · pet 喵喵 · help pet'}return pick(pool,language)}
const commands = createCommands({ tree, posts, manifest, manifestURL: new URL(config.manifest, location.href).href, search: searchPosts, reply });
function renderResult(parent, result) {
  for (const item of result.output) {
    if (item.type === 'text') out(parent, item.text, item.tone);
    else if (item.type === 'pre') parent.append(el('pre', item.text));
    else if (item.type === 'table') {
      const block = el('div', undefined, item.style);
      for (const row of item.rows) row.forEach((text, i) => block.append(el('span', text, item.style === 'listing' ? (i ? 'description' : 'filename') : undefined)));
      parent.append(block);
    }
  }
  for (const effect of result.effects) {
    switch (effect.type) {
      case 'cwd': setCwd(effect.path); break;
      case 'read': showReader(effect.post); break;
      case 'open': window.open(effect.url, '_blank', 'noopener,noreferrer'); break;
      case 'clear': startup(false); break;
      case 'tree': toggleTree(); break;
      case 'exit': closeDev(); break;
      case 'say': say(effect.text); break;
      case 'phrase': say(pick(effect.pool)); break;
      case 'pet': petCommand(effect.action); break;
    }
  }
}
async function run(raw) {
  raw = raw.trim(); if (!raw || !ready) return;
  resumePrompt(); touchPet(); if (!reader.hidden) closeReader(false);
  history.push(raw); if (history.length > 100) history.shift(); historyIndex = -1;
  const parent = record(raw), epoch = commandEpoch;
  let loading;
  try {
    let result = commands.execute(raw, { cwd, history: [...history], info, pet: { ...petState }, trail: trailText(), trailCount: readingTrail.length, lastPost });
    if (result instanceof Promise) {
      loading = el('p', 'searching…', 'muted'); parent.append(loading);
      result = await result;
    }
    if (epoch !== commandEpoch || dev.hidden || !parent.isConnected) return;
    renderResult(parent, result);
  } catch (error) {
    if (epoch !== commandEpoch || dev.hidden || !parent.isConnected) return;
    out(parent, error.message, 'error'); say(pick('error'));
  } finally { loading?.remove(); }
  syncInput(); if (raw !== 'clear' && reader.hidden && !dev.hidden) atPrompt(); announce('done');
}
function complete(){const raw=input.value,tokens=tokenize(raw,true),space=/\s$/.test(raw);let options=[];if(tokens.length<2&&!space){options=Object.keys(descriptions).filter(k=>k.startsWith(tokens[0]||''))}else{const cmd=tokens[0],part=space?'':tokens.at(-1);if(cmd==='pet'){options=['status','nap','wake','feed','play','quiet','auto'].filter(x=>x.startsWith(part)).map(x=>'pet '+x)}else if(['ls','cd','cat','open'].includes(cmd)){const slash=part.lastIndexOf('/'),prefix=slash<0?'':part.slice(0,slash+1),leaf=slash<0?part:part.slice(slash+1);options=children(resolve(prefix||'.')).filter(([p,n])=>p.slice(p.lastIndexOf('/')+1).startsWith(leaf)&&(cmd!=='cd'||n.type==='dir')).map(([p,n])=>cmd+' '+JSON.stringify(prefix+p.slice(p.lastIndexOf('/')+1)+(n.type==='dir'?'/':'')))}}if(options.length===1){input.value=options[0]+(options[0].includes('/')?'':' ');syncInput()}else if(options.length>1){out(record(raw),options.join('\n'),'muted');atPrompt()}focusInput()}
$('#post-count').textContent=posts.length+' mounted · ls /posts';function treeIcon(kind){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','tree-icon');svg.setAttribute('aria-hidden','true');const paths=kind==='dir'?[['folder-closed','M3 6h7l2 2h9v12H3Z'],['folder-open','M3 8V5h7l2 2h8v3M3 10h19l-4 10H3Z']]:kind==='link'?[['','M13 4h7v7M20 4l-9 9M9 4H4v16h16v-5']]:[['','M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6']];paths.forEach(([cls,d])=>{const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);if(cls)p.setAttribute('class',cls);svg.append(p)});return svg}
function mountTree(path,container){children(path).forEach(([p,n])=>{const name=p.slice(p.lastIndexOf('/')+1);if(n.type==='dir'){const d=el('details'),s=el('summary',undefined,'tree-summary');d.dataset.path=p;s.append(treeIcon('dir'),el('span',name,'tree-label'),el('span',String(children(p).length),'tree-count'));d.append(s);const child=el('div',undefined,'tree-children');mountTree(p,child);d.append(child);container.append(d)}else{const a=el('a',undefined,'tree-file');a.dataset.path=p;a.href=n.post?.canonical||n.href||'#'+encodeURIComponent(p);a.append(treeIcon(n.type==='link'?'link':'file'),el('span',name,'tree-label'));a.addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();
$('#drawer').hidden=true;
$('#directory-toggle').setAttribute('aria-expanded','false');const command=(n.type==='link'?'open ':'cat ')+JSON.stringify(p);input.value=command;syncInput();run(command);input.value='';syncInput();if(reader.hidden)focusInput()});container.append(a)}})}
mountTree('/',$('#file-tree'));
$('#exit').addEventListener('click',closeDev);
$('#directory-toggle').addEventListener('click',toggleTree);
$('#command-form').addEventListener('submit',e=>{e.preventDefault();if(composing||!ready)return;const value=input.value;input.value='';savedDraft='';syncInput();run(value)});
input.addEventListener('compositionstart',()=>composing=true);
input.addEventListener('compositionend',()=>{composing=false;syncInput()});
input.addEventListener('input',()=>{touchPet();syncInput()});
input.addEventListener('keydown',e=>{if(composing||e.isComposing||e.keyCode===229)return;if(e.key==='Tab'&&!e.shiftKey&&input.value){e.preventDefault();complete()}else if(e.key==='ArrowUp'){e.preventDefault();if(history.length){if(historyIndex===-1){savedDraft=input.value;historyIndex=history.length-1}else historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex];syncInput()}}else if(e.key==='ArrowDown'&&historyIndex!==-1){e.preventDefault();if(historyIndex<history.length-1)input.value=history[++historyIndex];else{historyIndex=-1;input.value=savedDraft}syncInput()}else if(e.ctrlKey&&e.key.toLowerCase()==='c'&&!getSelection().toString()&&input.selectionStart===input.selectionEnd){e.preventDefault();out(record(input.value+'^C'),'');input.value='';syncInput();atPrompt()}});
window.addEventListener('keydown',e=>{if(dev.hidden||composing||e.isComposing||e.keyCode===229)return;if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();e.stopImmediatePropagation();startup(false);return}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!reader.hidden)closeReader();else if(!$('#drawer').hidden){$('#drawer').hidden=true;
$('#directory-toggle').setAttribute('aria-expanded','false');focusInput()}else closeDev();return}if(e.key==='Tab'){const focusable=all('#dev button,#dev a[href],#dev input,#dev summary,#dev [tabindex="0"]').filter(n=>n.offsetParent!==null&&!n.closest('[inert]'));const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&scope.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&scope.activeElement===last&&!input.value){e.preventDefault();first?.focus()}}},true);
scroll.addEventListener('click',e=>{if(!e.target.closest('a,button,input,#pet')&&!getSelection().toString())focusInput()});
window.addEventListener('pointermove',e=>{if(dev.hidden||!ready||reduced.matches||e.pointerType==='touch')return;const r=$('#pet').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);gaze=Math.abs(dy)>300&&Math.abs(dy)>Math.abs(dx)?(dy<0?'◉':'●'):dx<-100?'◖':dx>100?'◗':'●';renderPet()},{passive:true});
$('#pet').addEventListener('pointerenter',()=>say(pick('cuddle')));
$('#pet').addEventListener('click',()=>{if(petState.pose==='sleep'){petState.manualNap=false;petState.pose='idle';touchPet();startPet(false);say(pick('wake'))}else say(pick('cuddle'))});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPet();else if(!dev.hidden&&ready)startPet()});reduced.addEventListener('change',()=>{if(!dev.hidden&&ready)startPet()});
return {open:openDev};
}
