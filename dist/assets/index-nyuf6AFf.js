(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();async function Z(){try{const[e,n]=await Promise.all([fetch("./data/rackets.json"),fetch("./data/ranking.json")]);if(!e.ok||!n.ok)throw new Error(`Erreur réseau: Rackets(${e.status}) Ranking(${n.status})`);const t=await e.json(),s=await n.json();return{profilesData:t,rankingData:s}}catch(e){return console.error("Impossible de charger les données :",e),{profilesData:[],rankingData:[]}}}function _(e=[],n=[]){return e.map(t=>{const s=n.find(a=>{const i=a.name.toLowerCase();return i===String(t.name).toLowerCase()||i===String(t.firstName).toLowerCase()});return{...t,color:s?s.color:"#22e1ff",rackets:s&&s.rackets?s.rackets:[],racketCount:s&&s.rackets?s.rackets.length:0,history:Array.isArray(t.history)?t.history:[]}}).sort((t,s)=>s.points-t.points||(t.nationalRank??1/0)-(s.nationalRank??1/0)).map((t,s)=>({...t,position:s+1}))}const w=window.matchMedia("(prefers-reduced-motion: reduce)").matches;function K(){J(),ee(),te()}function J(){const e=localStorage.getItem("theme")||"dark";j(e);const n=document.getElementById("theme-toggle");n&&n.addEventListener("click",Q)}function j(e){document.documentElement.setAttribute("data-theme",e);const n=document.querySelector('meta[name="theme-color"]');n&&n.setAttribute("content",e==="dark"?"#06070c":"#eef1f7");const t=document.getElementById("theme-icon-light"),s=document.getElementById("theme-icon-dark");t&&s&&(t.style.display=e==="dark"?"block":"none",s.style.display=e==="dark"?"none":"block")}function Q(){const n=(document.documentElement.getAttribute("data-theme")||"dark")==="dark"?"light":"dark";localStorage.setItem("theme",n),j(n),navigator.vibrate&&navigator.vibrate(8)}function ee(){const e=document.getElementById("splash-screen");if(!e)return;setTimeout(()=>{e.classList.add("is-gone"),setTimeout(()=>{e.style.display="none"},800)},w?200:1250)}function te(){const e=document.getElementById("topbar"),n=document.getElementById("scroll-bar");let t=!1;const s=()=>{const a=window.scrollY;if(e&&e.classList.toggle("is-scrolled",a>12),n){const i=document.documentElement.scrollHeight-window.innerHeight;n.style.width=i>0?`${Math.min(100,a/i*100)}%`:"0%"}t=!1};window.addEventListener("scroll",()=>{t||(t=!0,requestAnimationFrame(s))},{passive:!0}),s()}const H=new IntersectionObserver(e=>{e.forEach(n=>{n.isIntersecting&&(n.target.classList.add("visible"),H.unobserve(n.target))})},{threshold:.12,rootMargin:"0px 0px -40px 0px"});function b(e,n=0){e.classList.add("reveal"),e.style.transitionDelay=`${Math.min(n,8)*60}ms`,H.observe(e)}function N(e,n,{duration:t=1100,suffix:s=""}={}){if(w||n===0){e.textContent=m(n)+s;return}const a=()=>{const d=performance.now(),c=u=>{const o=Math.min(1,(u-d)/t),l=o===1?1:1-Math.pow(2,-10*o);e.textContent=m(Math.round(n*l))+s,o<1&&requestAnimationFrame(c)};requestAnimationFrame(c)},i=new IntersectionObserver(d=>{d.forEach(c=>{c.isIntersecting&&(a(),i.disconnect())})},{threshold:.4});e.textContent="0"+s,i.observe(e)}function m(e){return new Intl.NumberFormat("fr-FR").format(e)}function R(e,{width:n=120,height:t=34,dot:s=!0}={}){const a=(e||[]).filter(v=>typeof v=="number");if(a.length<2)return"";const i=Math.min(...a),d=Math.max(...a),c=d===i,u=d-i||1,o=3,l=t-o*2,p=a.map((v,x)=>{const M=x/(a.length-1)*n,U=c?.5:(v-i)/u;return[M,o+l-U*l]}),T=p.map(([v,x],M)=>`${M===0?"M":"L"}${v.toFixed(1)},${x.toFixed(1)}`).join(" "),z=`${T} L${n},${t} L0,${t} Z`,[X,G]=p[p.length-1];return`
        <svg class="spark" viewBox="0 0 ${n} ${t}" preserveAspectRatio="none" aria-hidden="true">
            <path class="area" d="${z}" />
            <path class="line" d="${T}" vector-effect="non-scaling-stroke" />
            ${s?`<circle cx="${X.toFixed(1)}" cy="${G.toFixed(1)}" r="2.6" />`:""}
        </svg>
    `}function E(e="",n=""){return((e[0]||"")+(n[0]||"")).toUpperCase()}function D(e=""){const n=e.toLowerCase();return n.includes("expert")?"lvl-expert":n.includes("avanc")?"lvl-avance":n.includes("inter")?"lvl-inter":"lvl-debutant"}function $(e=[]){return e.length<2?0:e[e.length-1].points-e[e.length-2].points}function L(e,n="pts"){if(!e)return'<span class="delta">= 0</span>';const t=e>0;return`<span class="delta ${t?"up":"down"}">${t?"▲":"▼"} ${t?"+":""}${e} ${n}</span>`}function r(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const O={1:"🥇",2:"🥈",3:"🥉"};function ne(e){const n=document.getElementById("profile-container");n&&(n.innerHTML="",e.forEach((t,s)=>{const a=document.createElement("article");a.className="player-card",a.style.setProperty("--pc",t.color),a.tabIndex=0,a.setAttribute("role","button"),a.setAttribute("aria-label",`Voir le profil de ${t.firstName} ${t.lastName}`);const i=$(t.history),d=t.history.slice(-14).map(l=>l.points),c=O[t.position]||"",u=t.rackets.slice(0,3).map(l=>`
            <div class="player-thumb"><img src="${r(l.images[0])}" alt="${r(l.name)}" loading="lazy"></div>
        `).join("");a.innerHTML=`
            <div class="player-top">
                <div class="avatar">${E(t.firstName,t.lastName)}</div>
                <div class="player-id">
                    <h3 class="player-name">${r(t.firstName)} ${r(t.lastName)}</h3>
                    <span class="player-pos">${c} ${F(t.position)} de l'équipe</span>
                </div>
            </div>

            <div class="player-stats">
                <div class="player-stat">
                    <b>${m(t.points)}</b><span>Points</span>
                </div>
                <div class="player-stat">
                    <b>${t.nationalRank?m(t.nationalRank):"—"}</b><span>Rang nat.</span>
                </div>
                <div class="player-stat">
                    <b>${t.racketCount}</b><span>Raquettes</span>
                </div>
            </div>

            <div class="player-spark">${R(d,{width:260,height:46})}</div>

            <div class="player-arsenal">
                ${u}
                <span class="player-more">
                    ${L(i)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
            </div>
        `;const o=()=>{navigator.vibrate&&navigator.vibrate(12),V(t)};a.addEventListener("click",o),a.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),o())}),n.appendChild(a),b(a,s)}))}function F(e){return e===1?"1er":`${e}ème`}let S=null;function V(e){const n=document.getElementById("player-modal"),t=document.getElementById("player-modal-content");!n||!t||(t.style.setProperty("--pc",e.color),n.classList.add("show"),document.body.style.overflow="hidden",se(e),ae(e),ie(e))}function se(e){const n=document.getElementById("pm-header");if(!n)return;const t=$(e.history);n.innerHTML=`
        <div class="avatar">${E(e.firstName,e.lastName)}</div>
        <div>
            <h2 class="pm-name" id="pm-name-label">${r(e.firstName)} ${r(e.lastName)}</h2>
            <div class="pm-chips">
                <span class="chip">${O[e.position]||""} ${F(e.position)} de l'équipe</span>
                <span class="chip">${m(e.points)} pts</span>
                <span class="chip">Rang ${e.nationalRank?m(e.nationalRank):"NC"}</span>
                ${L(t)}
            </div>
        </div>
    `}function ae(e){const n=document.getElementById("pm-chart");if(!n||typeof Chart>"u")return;const t=n.getContext("2d");S&&S.destroy();const s=getComputedStyle(document.documentElement),a=s.getPropertyValue("--stroke").trim()||"rgba(255,255,255,.09)",i=s.getPropertyValue("--dim").trim()||"#626a7d",d=e.history.map(o=>new Date(o.date).toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})),c=e.history.map(o=>o.points),u=t.createLinearGradient(0,0,0,n.height||240);u.addColorStop(0,B(e.color,.34)),u.addColorStop(1,B(e.color,0)),S=new Chart(t,{type:"line",data:{labels:d,datasets:[{label:"Points",data:c,borderColor:e.color,backgroundColor:u,borderWidth:2.5,tension:.38,pointBackgroundColor:e.color,pointBorderColor:"transparent",pointRadius:0,pointHoverRadius:6,pointHitRadius:18,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(6,7,12,.94)",borderColor:e.color,borderWidth:1,padding:12,displayColors:!1,titleFont:{family:"Outfit",size:11,weight:"600"},bodyFont:{family:"Outfit",size:14,weight:"700"},callbacks:{label:o=>`${o.parsed.y} points`}}},scales:{y:{beginAtZero:!0,border:{display:!1},grid:{color:a,drawTicks:!1},ticks:{color:i,font:{family:"Outfit",size:11},padding:10,maxTicksLimit:5}},x:{border:{display:!1},grid:{display:!1},ticks:{color:i,font:{family:"Outfit",size:10},maxRotation:0,autoSkip:!0,maxTicksLimit:7}}}}})}function ie(e){const n=document.getElementById("pm-arsenal");if(n){if(!e.rackets.length){n.innerHTML='<p style="color:var(--muted);font-size:.9rem;">Aucune raquette dans le garage.</p>';return}n.innerHTML=e.rackets.map(t=>`
        <div class="mini-racket">
            <div class="mini-racket-img">
                <img src="${r(t.images[0])}" alt="${r(t.name)}" loading="lazy">
            </div>
            <div class="mini-racket-name">${r(t.name)}</div>
            <div class="mini-racket-price">${r(t.price)}</div>
            <span class="chip chip-level ${D(t.level)}" style="justify-content:center">${r(t.level)}</span>
        </div>
    `).join("")}}function I(){const e=document.getElementById("player-modal");e&&(e.classList.remove("show"),document.body.style.overflow="")}function oe(){const e=document.getElementById("player-modal"),n=document.getElementById("pm-close");e&&(n&&n.addEventListener("click",I),e.addEventListener("click",t=>{t.target===e&&I()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&e.classList.contains("show")&&I()}))}function B(e,n){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e||"");return t?`rgba(${parseInt(t[1],16)},${parseInt(t[2],16)},${parseInt(t[3],16)},${n})`:`rgba(34,225,255,${n})`}const re=["🥇","🥈","🥉"];function le(e){ce(e),de(e.slice(0,3)),ue(e.slice(3))}function ce(e){const n=document.getElementById("fun-facts-dash");if(!n)return;const t=e.filter(o=>o.nationalRank!==null&&o.nationalRank!==void 0),s=t.length?Math.min(...t.map(o=>o.nationalRank)):null,a=e.filter(o=>o.points>0),i=e.reduce((o,l)=>o+(l.points||0),0),d=a.length?Math.round(i/a.length):0,c=e.reduce((o,l)=>o+$(l.history),0),u=[{label:"Meilleur rang de l'équipe",value:s,prefix:"#"},{label:"Points cumulés",value:i},{label:"Moyenne par pilote",value:d},{label:"Gagnés ce relevé",value:c,signed:!0,unit:"pts"}];n.innerHTML=u.map(o=>{if(o.value===null)return C(o.label,'<span class="stat-tile-val">—</span>');if(o.signed){const l=o.value>0?"up":o.value<0?"down":"",p=o.value>0?"+":"";return C(o.label,`<span class="stat-tile-val ${l}" style="${l?`color:var(--${l})`:""}">${p}${m(o.value)}<small>${o.unit}</small></span>`)}return C(o.label,`<span class="stat-tile-val">${o.prefix||""}<i data-count="${o.value}"></i></span>`)}).join(""),n.querySelectorAll("[data-count]").forEach(o=>{o.style.fontStyle="normal",N(o,Number(o.dataset.count))}),n.querySelectorAll(".stat-tile").forEach((o,l)=>b(o,l))}function C(e,n){return`<div class="stat-tile"><span class="stat-tile-label">${e}</span>${n}</div>`}function de(e){const n=document.getElementById("podium");n&&(n.innerHTML=e.map((t,s)=>{const a=$(t.history),i=t.history.slice(-14).map(d=>d.points);return`
            <article class="podium-card p${s+1}" style="--pc:${t.color}" data-player="${r(t.name)}"
                     tabindex="0" role="button" aria-label="Voir le profil de ${r(t.firstName)} ${r(t.lastName)}">
                <span class="podium-medal" aria-hidden="true">${re[s]}</span>
                <div class="avatar">${E(t.firstName,t.lastName)}</div>
                <div class="podium-body">
                    <h3 class="podium-name">${r(t.firstName)} ${r(t.lastName)}</h3>
                    <p class="podium-rank">Rang national ${t.nationalRank?m(t.nationalRank):"NC"}</p>
                    <p class="podium-pts"><i data-count="${t.points}" style="font-style:normal"></i><small>pts</small></p>
                    ${L(a)}
                </div>
                <div class="podium-spark">${R(i,{width:160,height:38})}</div>
            </article>`}).join(""),n.querySelectorAll("[data-count]").forEach(t=>N(t,Number(t.dataset.count))),n.querySelectorAll(".podium-card").forEach((t,s)=>{b(t,s),W(t,e)}))}function ue(e){const n=document.getElementById("ranking-list");if(n){if(!e.length){n.innerHTML="";return}n.innerHTML=e.map(t=>{const s=$(t.history),a=t.history.slice(-14).map(i=>i.points);return`
            <article class="rk-row" style="--pc:${t.color}" data-player="${r(t.name)}"
                     tabindex="0" role="button" aria-label="Voir le profil de ${r(t.firstName)} ${r(t.lastName)}">
                <div class="rk-pos">${t.position}</div>
                <div class="avatar">${E(t.firstName,t.lastName)}</div>
                <div>
                    <div class="rk-name">${r(t.firstName)} ${r(t.lastName)}</div>
                    <div class="rk-sub">Rang ${t.nationalRank?m(t.nationalRank):"NC"}</div>
                </div>
                <div class="rk-spark">${R(a,{width:120,height:34})}</div>
                <div class="rk-delta-cell">${L(s)}</div>
                <div class="rk-pts">${m(t.points)}<small>pts</small></div>
            </article>`}).join(""),n.querySelectorAll(".rk-row").forEach((t,s)=>{b(t,s),W(t,e)})}}function W(e,n){const t=n.find(a=>a.name===e.dataset.player);if(!t)return;const s=()=>{navigator.vibrate&&navigator.vibrate(12),V(t)};e.addEventListener("click",s),e.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),s())})}let g=[],y="all",k=[];function me(e,n=[]){g=[],k=[],e.forEach(t=>{k.push({name:t.name,color:t.color,count:t.rackets.length}),t.rackets.forEach(s=>{g.push({...s,ownerName:t.name,ownerColor:t.color})})}),fe(n),pe(),Y()}function fe(e){const n=document.getElementById("hero-stats");if(!n)return;const t=e.map(c=>c.points||0),s=t.length?Math.max(...t):0,a=g.map(c=>parseFloat(String(c.price).replace(/[^\d,.]/g,"").replace(",","."))).filter(c=>!isNaN(c)),i=a.length?Math.round(Math.max(...a)):0,d=[{val:g.length,label:"Raquettes"},{val:k.length,label:"Pilotes"},{val:s,label:"Meilleur score"},{val:i,label:"Pièce maîtresse",suffix:" €"}];n.innerHTML=d.map(c=>`<div class="hero-stat"><b data-count="${c.val}" data-suffix="${c.suffix||""}">0</b><span>${c.label}</span></div>`).join(""),n.querySelectorAll("[data-count]").forEach(c=>{N(c,Number(c.dataset.count),{suffix:c.dataset.suffix})})}function pe(){const e=document.getElementById("sr-filters");if(!e)return;const n=['<button class="filter-btn active" data-owner="all">Tout le garage</button>',...k.map(t=>`
            <button class="filter-btn" data-owner="${r(t.name)}" style="--pc:${t.color}">
                <i class="chip-dot"></i>${r(t.name)}
            </button>`)];e.innerHTML=n.join(""),e.querySelectorAll(".filter-btn").forEach(t=>{t.addEventListener("click",()=>{t.dataset.owner!==y&&(y=t.dataset.owner,e.querySelectorAll(".filter-btn").forEach(s=>s.classList.remove("active")),t.classList.add("active"),navigator.vibrate&&navigator.vibrate(8),Y())})})}function Y(){const e=document.getElementById("sr-feed"),n=document.getElementById("sr-count");if(!e)return;const t=y==="all"?g:g.filter(s=>s.ownerName===y);if(n&&(n.innerHTML=`<b>${t.length}</b> raquette${t.length>1?"s":""} affichée${t.length>1?"s":""}`),e.innerHTML="",!t.length){e.innerHTML='<div class="empty-state"><span class="emoji">🎾</span>Aucune raquette pour ce pilote.</div>';return}t.forEach((s,a)=>{const i=ge(s,a);e.appendChild(i),b(i,a),he(i),be(i,s)}),$e(e)}function ge(e,n){const t=document.createElement("article");t.className="sr-card",t.style.setProperty("--pc",e.ownerColor);const{brand:s,model:a}=ve(e.name),i=e.specs||{},d=e.images&&e.images.length>1?`<div class="sr-angles">${e.images.map((o,l)=>`<button class="sr-angle-dot ${l===0?"active":""}" data-index="${l}"
                     aria-label="Angle ${l+1}"></button>`).join("")}</div>`:"",c=[["Poids",i.weight],["Forme",i.shape],["Mousse",i.foam],["Surface",i.surface]].map(([o,l])=>`
        <div class="sr-spec">
            <dt>${o}</dt>
            <dd>${r(l||"—")}</dd>
        </div>`).join(""),u=Object.entries(e.stats||{}).map(([o,l])=>`
            <div class="sr-gauge">
                <div class="sr-gauge-ring">
                    <svg viewBox="0 0 70 70" aria-hidden="true">
                        <circle class="sr-gauge-bg" cx="35" cy="35" r="28" />
                        <circle class="sr-gauge-fill" cx="35" cy="35" r="28" data-offset="${176-Number(l)*17.6}" />
                    </svg>
                    <span class="sr-gauge-val">${String(l).padStart(2,"0")}</span>
                </div>
                <span class="sr-gauge-label">${r(o)}</span>
            </div>`).join("");return t.innerHTML=`
        <div class="sr-stage">
            <span class="chip sr-owner"><i class="chip-dot"></i>${r(e.ownerName)}</span>
            <span class="sr-price">${r(e.price)}</span>
            <div class="sr-glow" aria-hidden="true"></div>
            <div class="sr-frame">
                <img src="${r(e.images[0])}" alt="${r(e.name)}"
                     loading="${n<3?"eager":"lazy"}" decoding="async">
            </div>
            ${d}
        </div>

        <div class="sr-body">
            <div class="sr-head">
                <div>
                    ${s?`<span class="sr-brand">${r(s)}</span>`:""}
                    <h3 class="sr-title">${r(a)}</h3>
                </div>
                <span class="chip chip-level ${D(e.level)}">${r(e.level)}</span>
            </div>

            <p class="sr-desc">${r(e.description||"")}</p>

            <dl class="sr-specs">${c}</dl>

            <div class="sr-telemetry">
                <h4 class="sr-telemetry-title">Télémétrie</h4>
                <div class="sr-gauges">${u}</div>
            </div>

            <div class="sr-actions">
                <a class="btn-ghost" href="${r(e.url||"#")}" target="_blank" rel="noopener noreferrer">
                    Voir l'offre
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    `,t}function ve(e=""){const n=e.trim().split(/\s+/);return n.length<2?{brand:"",model:e}:{brand:n[0],model:n.slice(1).join(" ")}}function he(e){if(w)return;const n=e.querySelector(".sr-frame"),t=e.querySelector(".sr-frame img");!n||!t||(n.addEventListener("mousemove",s=>{const a=n.getBoundingClientRect(),i=((s.clientX-a.left)/a.width-.5)*26,d=(.5-(s.clientY-a.top)/a.height)*26;t.style.transform=`rotateX(${d}deg) rotateY(${i}deg) scale(1.05)`}),n.addEventListener("mouseleave",()=>{t.style.transform=""}))}function be(e,n){const t=e.querySelectorAll(".sr-angle-dot"),s=e.querySelector(".sr-frame img");if(!t.length||!s)return;const a=i=>{if(i.classList.contains("active"))return;const d=Number(i.dataset.index);if(navigator.vibrate&&navigator.vibrate(5),t.forEach(c=>c.classList.remove("active")),i.classList.add("active"),w){s.src=n.images[d];return}s.style.opacity="0",s.style.transform="rotateY(38deg) scale(.92)",setTimeout(()=>{s.src=n.images[d],s.style.transform="rotateY(-38deg) scale(.92)",s.offsetWidth,s.style.transform="",s.style.opacity="1"},180)};t.forEach(i=>{i.addEventListener("click",()=>a(i)),i.addEventListener("mouseenter",()=>a(i))})}function $e(e){const n=new IntersectionObserver(t=>{t.forEach(s=>{s.isIntersecting&&(s.target.querySelectorAll(".sr-gauge-fill").forEach(a=>{a.style.strokeDashoffset=a.dataset.offset}),n.unobserve(s.target))})},{threshold:.2});e.querySelectorAll(".sr-card").forEach(t=>n.observe(t))}const f=["showroom","ranking","profile"];let h=null,A="showroom";async function q(){K(),oe();const{profilesData:e,rankingData:n}=await Z(),t=_(n,e);me(e,n),le(t),ne(t),ye(),we(),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(s=>console.log("✅ Service Worker enregistré",s)).catch(s=>console.error("❌ Échec du Service Worker",s))})}function ye(){document.querySelectorAll(".nav-btn, .tab-btn").forEach(e=>{e.addEventListener("click",()=>{navigator.vibrate&&navigator.vibrate(10),P(e.dataset.view)})}),ke()}function P(e){if(!f.includes(e)||e===A)return;A=e,document.querySelectorAll(".view-section").forEach(t=>{t.style.display="none",t.classList.remove("active")});const n=document.getElementById(`${e}-view`);n.style.display="block",n.offsetWidth,n.classList.add("active"),document.querySelectorAll(".nav-btn, .tab-btn").forEach(t=>{t.classList.toggle("active",t.dataset.view===e)}),window.scrollTo({top:0,behavior:"smooth"}),e==="ranking"&&typeof confetti<"u"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&confetti({particleCount:70,spread:62,startVelocity:34,origin:{y:.12,x:.5},colors:["#ffd166","#22e1ff","#ff3ded","#ffffff"]})}function ke(){let e=0,n=0;document.addEventListener("touchstart",t=>{e=t.changedTouches[0].screenX,n=t.changedTouches[0].screenY},{passive:!0}),document.addEventListener("touchend",t=>{const s=t.changedTouches[0].screenX-e,a=t.changedTouches[0].screenY-n;if(Math.abs(s)<70||Math.abs(s)<Math.abs(a)*1.5)return;const i=f.indexOf(A),d=s<0?f[(i+1)%f.length]:f[(i-1+f.length)%f.length];navigator.vibrate&&navigator.vibrate(15),P(d)},{passive:!0})}function we(){const e=document.getElementById("install-btn");if(!e)return;const n=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone,t=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);!n&&t&&(e.style.display="grid"),window.addEventListener("beforeinstallprompt",s=>{s.preventDefault(),h=s,e.style.display="grid"}),e.addEventListener("click",async()=>{h?(e.style.display="none",h.prompt(),await h.userChoice,h=null):alert(`🍏 Sur iPhone/iPad : appuie sur l'icône « Partager » en bas, puis « Sur l'écran d'accueil ».

🤖 Sur Android : menu ⋮ du navigateur, puis « Ajouter à l'écran d'accueil ».`)}),window.addEventListener("appinstalled",()=>{e.style.display="none"})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q):q();window.switchView=P;
