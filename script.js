/* ── CUSTOM CURSOR ── */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
});

(function animRing(){
  rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
  ring.style.left=Math.round(rx)+'px';
  ring.style.top=Math.round(ry)+'px';
  requestAnimationFrame(animRing);
})();

const clickables = 'a,button,.port-item,.occ-pill,.promise,.test-card,.price-card';
document.querySelectorAll(clickables).forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});
document.addEventListener('mousedown',()=>document.body.classList.add('clicking'));
document.addEventListener('mouseup',()=>document.body.classList.remove('clicking'));

/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

const portfolioToggle = document.getElementById('portfolioToggle');
const portfolioMore = document.getElementById('portfolioMore');
if (portfolioToggle && portfolioMore) {
  portfolioToggle.addEventListener('click', () => {
    const isOpen = portfolioMore.classList.toggle('open');
    portfolioToggle.textContent = isOpen ? 'Show less drawings' : 'View more drawings';
    portfolioToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ── ORDER ── */
function order(){
  const name=document.getElementById('fname').value.trim();
  const phone=document.getElementById('fphone').value.trim();
  const size=document.getElementById('fsize').value;
  const option=document.getElementById('forder').value;
  const notes=document.getElementById('fnotes').value.trim() || 'None';
  if(!name||!phone||!size||!option){alert('Please fill your name, number, size, and order option.');return;}
  const whatsappNumber='917810064300';
  const msg=`New Portrait Order!\n\nName: ${name}\nPhone: ${phone}\nSize: ${size}\nOrder option: ${option}\nSpecial instructions: ${notes}`;
  const url='https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(msg);
  window.location.href = url;
}
