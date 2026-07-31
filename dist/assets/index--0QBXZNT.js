(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();async function I(){try{const[e,t]=await Promise.all([fetch("./data/rackets.json"),fetch("./data/ranking.json")]);if(!e.ok||!t.ok)throw new Error(`Erreur réseau: Rackets(${e.status}) Ranking(${t.status})`);const n=await e.json(),o=await t.json();return{profilesData:n,rankingData:o}}catch(e){return console.error("Impossible de charger les données :",e),{profilesData:[],rankingData:[]}}}function E(){R(),setTimeout(()=>{const e=document.getElementById("splash-screen");e&&(e.style.opacity="0",setTimeout(()=>{e.style.display="none"},600))},1200)}function R(){const e=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",e),L(e);const t=document.getElementById("theme-toggle");t&&t.addEventListener("click",$)}function $(){const t=(document.documentElement.getAttribute("data-theme")||"dark")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t),L(t)}window.toggleTheme=$;function L(e){const t=document.getElementById("theme-icon-light"),n=document.getElementById("theme-icon-dark");t&&n&&(e==="dark"?(t.style.display="block",n.style.display="none"):(t.style.display="none",n.style.display="block"))}const P=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("visible"),P.unobserve(t.target))})},{threshold:.1,rootMargin:"0px 0px -50px 0px"}),T=Object.freeze(Object.defineProperty({__proto__:null,initUI:E,scrollObserver:P},Symbol.toStringTag,{value:"Module"}));function A(e,t){const n=document.getElementById("ranking-list");n&&(n.innerHTML="",e.sort((o,s)=>o.nationalRank===null?1:s.nationalRank===null?-1:o.nationalRank-s.nationalRank),e.forEach(o=>{const s=document.createElement("div");s.className="ranking-item";const r=o.nationalRank?`#${o.nationalRank}`:"NC",i=t.find(c=>c.name===o.name),a=i?i.color:"var(--text-muted)";s.style.setProperty("--rank-color",a),s.innerHTML=`
            <div class="rank-num">${r.replace("#","")}</div>
            <div class="rank-name">${o.name}</div>
            <div class="rank-points">${o.points} pts</div>
        `,n.appendChild(s)}),B(e))}function B(e,t){const n=document.getElementById("fun-facts-dash");if(!n)return;const o=e.filter(a=>a.points>0),s=o.length>0?Math.round(o.reduce((a,c)=>a+c.points,0)/o.length):0,r=e.filter(a=>a.nationalRank!==null),i=r.length>0?Math.min(...r.map(a=>a.nationalRank)):"N/A";n.innerHTML=`
        <div class="dash-stat">
            <span class="dash-icon">🏆</span>
            <div class="dash-info">
                <span class="dash-val">#${i}</span>
                <span class="dash-label">Meilleur Rang de l'Équipe</span>
            </div>
        </div>
        <div class="dash-stat" style="border-left: 1px solid var(--border-glass); padding-left: 30px;">
            <span class="dash-icon">📈</span>
            <div class="dash-info">
                <span class="dash-val">${s}</span>
                <span class="dash-label">Points Nationaux (Moyenne)</span>
            </div>
        </div>
    `}function S(e,t){const n=document.getElementById("profile-container");if(!n)return;n.innerHTML="";const o=e.map(s=>{const r=t.find(i=>i.name.toLowerCase()===s.name.toLowerCase()||i.name.toLowerCase()===s.firstName.toLowerCase());return{...s,color:r?r.color:"#00f0ff",racketCount:r&&r.rackets?r.rackets.length:0,racketsList:r&&r.rackets?r.rackets:[]}});o.sort((s,r)=>r.points-s.points),o.forEach((s,r)=>{const i=document.createElement("div");i.className="card player-card",i.style.setProperty("--glow-color",s.color);const a=r+1;let c=a;a===1?c="🥇 1er":a===2?c="🥈 2ème":a===3&&(c="🥉 3ème"),i.innerHTML=`
            <div class="player-avatar-large" style="background: ${s.color}20; border-color: ${s.color}50;">
                <span style="color: ${s.color};">${s.firstName.substring(0,1)}${s.lastName.substring(0,1)}</span>
            </div>
            
            <div class="card-info-header" style="justify-content: center; text-align: center; margin-top: 20px;">
                <div>
                    <h2 class="card-title">${s.firstName} ${s.lastName}</h2>
                    <div class="card-status" style="justify-content: center;">
                        <span class="status-dot" style="background: var(--glow-color);"></span>
                        Active
                    </div>
                </div>
            </div>

            <div class="profile-stats" style="margin-top: 30px;">
                <div class="p-stat"><span>Rank</span><strong style="color: var(--glow-color);">${c}</strong></div>
                <div class="p-stat"><span>Points</span><strong>${s.points}</strong></div>
                <div class="p-stat"><span>Rackets</span><strong>${s.racketCount}</strong></div>
            </div>
            
        `,i.onclick=()=>{navigator.vibrate&&navigator.vibrate(15),openPlayerModal(s)},i.addEventListener("mousemove",u=>{const l=i.getBoundingClientRect(),m=u.clientX-l.left,d=u.clientY-l.top,g=l.width/2,p=l.height/2,w=(d-p)/p*-10,C=(m-g)/g*10;i.style.transform=`perspective(1000px) rotateX(${w}deg) rotateY(${C}deg) scale3d(1.02, 1.02, 1.02)`}),i.addEventListener("mouseleave",()=>{i.style.transform="perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"}),n.appendChild(i),setTimeout(()=>{i.classList.add("visible")},r*100)})}window.openPlayerModal=function(e){const t=document.getElementById("player-modal");t.style.display="flex",t.offsetWidth,t.classList.add("show");const n=document.getElementById("pm-header");n.innerHTML=`
        <div class="player-avatar-large" style="width: 80px; height: 80px; font-size: 2rem; background: ${e.color}20; border-color: ${e.color}; box-shadow: 0 0 15px ${e.color}; margin-top: 0;">
            <span style="color: ${e.color};">${e.firstName.substring(0,1)}${e.lastName.substring(0,1)}</span>
        </div>
        <div>
            <h2 style="font-size: 1.8rem; margin: 0; color: #fff;">${e.firstName} ${e.lastName}</h2>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">POINTS: <strong style="color: ${e.color};">${e.points}</strong> &nbsp;|&nbsp; RACKETS: <strong style="color: ${e.color};">${e.racketCount}</strong></div>
        </div>
    `;const o=document.getElementById("pm-chart");if(!o)return;const s=o.getContext("2d");window.pmChartInstance&&window.pmChartInstance.destroy();const r=e.history.map(c=>new Date(c.date).toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})),i=e.history.map(c=>c.points);window.pmChartInstance=new Chart(s,{type:"line",data:{labels:r,datasets:[{label:"Points",data:i,borderColor:e.color,backgroundColor:e.color+"20",borderWidth:3,tension:.4,pointBackgroundColor:e.color,pointBorderColor:"#111",pointRadius:5,pointHoverRadius:8,fill:!0}]},options:{responsive:!0,plugins:{legend:{display:!1}},scales:{y:{grid:{color:"rgba(255,255,255,0.05)"},ticks:{color:"#888"},beginAtZero:!0},x:{grid:{display:!1},ticks:{color:"#888",maxRotation:45,minRotation:45}}}}});const a=document.getElementById("pm-arsenal");a.innerHTML="",e.racketsList&&e.racketsList.length>0?e.racketsList.forEach(c=>{const u=document.createElement("div");u.className="mini-racket-card",u.style.setProperty("--glow-color",e.color),u.innerHTML=`
                <div class="mini-racket-img">
                    <img src="${c.images[0]}" alt="${c.name}">
                </div>
                <div class="mini-racket-title">${c.name}</div>
            `,a.appendChild(u)}):a.innerHTML='<p style="color: var(--text-muted); font-size: 0.9rem;">Aucune raquette dans le garage.</p>'};window.closePlayerModal=function(){const e=document.getElementById("player-modal");e.classList.remove("show"),setTimeout(()=>{e.classList.contains("show")||(e.style.display="none")},400)};const M="modulepreload",x=function(e){return"/"+e},b={},N=function(t,n,o){let s=Promise.resolve();if(n&&n.length>0){let u=function(l){return Promise.all(l.map(m=>Promise.resolve(m).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};var i=u;document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");s=u(n.map(l=>{if(l=x(l),l in b)return;b[l]=!0;const m=l.endsWith(".css"),d=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${d}`))return;const g=document.createElement("link");if(g.rel=m?"stylesheet":M,m||(g.as="script"),g.crossOrigin="",g.href=l,c&&g.setAttribute("nonce",c),document.head.appendChild(g),m)return new Promise((p,w)=>{g.addEventListener("load",p),g.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(a){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=a,window.dispatchEvent(c),!c.defaultPrevented)throw a}return s.then(a=>{for(const c of a||[])c.status==="rejected"&&r(c.reason);return t().catch(r)})};let y=[];function O(e){y=[],e.forEach(t=>{t.rackets.forEach(n=>{y.push({...n,ownerName:t.name,ownerColor:t.color})})}),y.length!==0&&D()}function D(){const e=document.getElementById("sr-feed");e&&(e.innerHTML="",y.forEach((t,n)=>{const o=document.createElement("div");o.className="sr-racket-row",o.id=`racket-row-${n}`,o.style.setProperty("--glow-color",t.ownerColor);let s="";t.images&&t.images.length>1&&(s=`<div class="sr-angle-indicators" id="sr-angles-${n}">`,t.images.forEach((m,d)=>{s+=`<div class="sr-angle-dot ${d===0?"active":""}" title="Angle ${d+1}" data-index="${d}"></div>`}),s+="</div>");const r=t.specs||{},i=r.weight||"-",a=r.shape||"-",c=r.foam||"-",u=r.surface||"-";let l="";if(t.stats)for(const[m,d]of Object.entries(t.stats)){const g=d<10?"0"+d:d,p=176-d*17.6;l+=`
                    <div class="sr-telemetry-item">
                        <div class="sr-gauge-container">
                            <svg class="sr-gauge-svg" viewBox="0 0 70 70">
                                <circle class="sr-gauge-bg" cx="35" cy="35" r="28" />
                                <circle class="sr-gauge-fill" cx="35" cy="35" r="28" style="stroke-dasharray: 176; stroke-dashoffset: 176;" data-offset="${p}" />
                            </svg>
                            <div class="sr-gauge-val">${g}</div>
                        </div>
                        <span class="sr-telemetry-label">${m}</span>
                    </div>
                `}o.innerHTML=`
            <!-- Zone Showcase de gauche (Image de la raquette) -->
            <div class="sr-showcase" id="sr-showcase-${n}">
                <div class="sr-glow-backdrop"></div>
                <div class="sr-racket-wrapper" id="sr-racket-wrap-${n}">
                    <img id="sr-img-${n}" src="${t.images[0]}" alt="${t.name}" loading="lazy">
                </div>
                ${s}
            </div>

            <!-- Zone de droite (Détails & Performance) -->
            <div class="sr-details">
                <div class="sr-header">
                    <div class="sr-meta">
                        <span class="sr-owner-tag" style="border-left-color: ${t.ownerColor};">
                            <span class="sr-owner-dot" style="background: ${t.ownerColor};"></span>
                            ${t.ownerName.toUpperCase()}
                        </span>
                        <span class="sr-level-tag">${t.level.toUpperCase()}</span>
                    </div>
                    <h2 class="sr-title">${t.name}</h2>
                    <div class="sr-price">${t.price.replace("€"," EUR")}</div>
                </div>

                <p class="sr-description">${t.description}</p>

                <div class="sr-specs-grid">
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Poids</span>
                        <span class="sr-spec-value">${i}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Forme</span>
                        <span class="sr-spec-value">${a}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Mousse</span>
                        <span class="sr-spec-value">${c}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Surface</span>
                        <span class="sr-spec-value">${u}</span>
                    </div>
                </div>

                <div class="sr-telemetry">
                    <h3 class="sr-telemetry-title">TÉLÉMÉTRIE DE PERFORMANCE</h3>
                    <div class="sr-telemetry-grid">
                        ${l}
                    </div>
                </div>

                <div class="sr-actions">
                    <a href="${t.url||"#"}" target="_blank" class="sr-buy-btn">
                        Acheter la Raquette
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            </div>
        `,e.appendChild(o),F(n),H(n,t),N(()=>Promise.resolve().then(()=>T),void 0).then(m=>{m.scrollObserver&&m.scrollObserver.observe(o)})}),j())}function F(e){const t=document.getElementById(`sr-racket-wrap-${e}`),n=document.getElementById(`sr-img-${e}`);!t||!n||(t.addEventListener("mousemove",o=>{const s=t.getBoundingClientRect(),r=o.clientX-s.left,i=o.clientY-s.top,a=s.width/2,c=s.height/2,u=(r-a)/a*20,l=(c-i)/c*20;n.style.transform=`rotateX(${l}deg) rotateY(${u}deg) scale(1.04)`}),t.addEventListener("mouseleave",()=>{n.style.transform="rotateX(0deg) rotateY(0deg) scale(1)"}))}function H(e,t){const n=document.querySelectorAll(`#sr-angles-${e} .sr-angle-dot`),o=document.getElementById(`sr-img-${e}`);!n.length||!o||n.forEach(s=>{const r=()=>{const i=parseInt(s.getAttribute("data-index"));s.classList.contains("active")||(navigator.vibrate&&navigator.vibrate(5),o.style.transition="transform 0.25s ease, opacity 0.25s ease",o.style.transform="rotateY(90deg) scale(0.9)",o.style.opacity="0.3",setTimeout(()=>{o.src=t.images[i],o.style.transform="rotateY(-90deg) scale(0.9)",o.offsetWidth,o.style.transform="rotateY(0deg) scale(1)",o.style.opacity="1",n.forEach(a=>a.classList.remove("active")),s.classList.add("active"),setTimeout(()=>{o.style.transition="transform 0.1s ease, filter 0.5s ease"},250)},200))};s.onclick=r,s.onmouseenter=r})}function j(){const e=new IntersectionObserver(t=>{t.forEach(n=>{n.isIntersecting&&(n.target.querySelectorAll(".sr-gauge-fill").forEach(s=>{const r=s.getAttribute("data-offset");s.style.strokeDashoffset=r}),e.unobserve(n.target))})},{threshold:.15});document.querySelectorAll(".sr-racket-row").forEach(t=>{e.observe(t)})}let h,v="showroom";async function k(){E();const{profilesData:e,rankingData:t}=await I();A(t,e),S(t,e),O(e),Y(),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(n=>console.log("✅ Service Worker Registered",n)).catch(n=>console.error("❌ Service Worker Registration failed",n))}),X()}function X(){const e=document.getElementById("install-btn");if(!e)return;const t=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone,n=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);!t&&n&&(e.style.display="block"),window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),h=o,e.style.display="block"}),e.addEventListener("click",async()=>{if(h){e.style.display="none",h.prompt();const{outcome:o}=await h.userChoice;o==="accepted"&&console.log("User accepted the PWA prompt"),h=null}else alert(`🍏 Sur iPhone/iPad : Appuyez sur l'icône 'Partager' au centre en bas, puis choisissez 'Sur l'écran d'accueil'.

🤖 Sur Android (si ça ne marche pas) : Appuyez sur les 3 points du navigateur en haut à droite, puis sur 'Ajouter à l'écran d'accueil'.`)}),window.addEventListener("appinstalled",()=>{console.log("PWA was installed"),e.style.display="none"})}function Y(){const e=document.getElementById("nav-showroom"),t=document.getElementById("nav-ranking");e&&e.addEventListener("click",()=>{navigator.vibrate&&navigator.vibrate(10),f("showroom")}),t&&t.addEventListener("click",()=>{navigator.vibrate&&navigator.vibrate(10),f("ranking")});let n=0,o=0;function s(){o<n-70&&(v==="showroom"?(navigator.vibrate&&navigator.vibrate(15),f("ranking")):v==="ranking"?(navigator.vibrate&&navigator.vibrate(15),f("profile")):v==="profile"&&(navigator.vibrate&&navigator.vibrate(15),f("showroom"))),o>n+70&&(v==="profile"?(navigator.vibrate&&navigator.vibrate(15),f("ranking")):v==="ranking"?(navigator.vibrate&&navigator.vibrate(15),f("showroom")):v==="showroom"&&(navigator.vibrate&&navigator.vibrate(15),f("profile")))}document.addEventListener("touchstart",r=>{n=r.changedTouches[0].screenX}),document.addEventListener("touchend",r=>{o=r.changedTouches[0].screenX,s()})}function f(e){if(!(v===e&&!document.getElementById(e+"-view").style.display)){if(v===e)return;v=e}document.querySelectorAll(".view-section").forEach(n=>n.style.display="none"),document.querySelectorAll(".nav-btn").forEach(n=>n.classList.remove("active"));const t=document.getElementById(e+"-view");t.style.display="block",t.classList.remove("active"),t.offsetWidth,t.classList.add("active"),document.getElementById("nav-"+e).classList.add("active"),e==="ranking"&&typeof confetti<"u"&&confetti({particleCount:80,spread:60,origin:{y:.1,x:.5},colors:["#D4AF37","#FFDF00","#FFFFFF"]})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();window.switchView=f;
