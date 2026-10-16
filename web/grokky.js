/* GROKKY character renderer (canvas 2D). Shared by the dashboard. MIT. */
var ctx=null;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
const seg=(t,a,b)=>clamp((t-a)/(b-a));
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rr(c,x,y,w,h,r){c.beginPath();if(!(w>0&&h>0))return;c.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));}
/* ---------------- MASCOT ---------------- */
function pill(x,y,w,l,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);rr(ctx,-w/2,-l/2,w,l,w/2);ctx.fill();ctx.restore();}
function bodyPath(R,c=ctx){
 c.beginPath();
 c.moveTo(R,0);
 c.bezierCurveTo(R,-R*1.12,R*0.46,-R*1.52,R*0.08,-R*1.98);
 c.bezierCurveTo(-R*0.12,-R*2.24,-R*0.5,-R*2.42,-R*0.82,-R*2.24);
 c.bezierCurveTo(-R*1.02,-R*2.12,-R*0.98,-R*1.84,-R*0.78,-R*1.8);
 c.bezierCurveTo(-R*0.66,-R*1.78,-R*0.6,-R*1.86,-R*0.52,-R*1.84);
 c.bezierCurveTo(-R*0.66,-R*1.5,-R,-R*0.98,-R,0);
 c.ellipse(0,0,R,R*0.96,0,Math.PI,0,true);
 c.closePath();
}
function eyePill(x,y,w,l,rot){
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 const g=ctx.createLinearGradient(-w/2,-l/2,w/2,l/2);g.addColorStop(0,'#000');g.addColorStop(1,'#1d2028');
 ctx.fillStyle=g;rr(ctx,-w/2,-l/2,w,l,w/2);ctx.fill();
 if(l>w*1.2){ctx.fillStyle='rgba(255,255,255,0.42)';rr(ctx,-w*0.28,-l/2+w*0.22,w*0.2,l*0.26,w*0.1);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.arc(w*0.12,l/2-w*0.42,w*0.08,0,7);ctx.fill();}
 ctx.restore();
}
function arm(sx,sy,ang,len,th){
 ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);
 // sleeve (tapered)
 const sl=len*0.6;
 ctx.beginPath();ctx.moveTo(-th*0.6,-th*0.15);ctx.quadraticCurveTo(-th*0.66,sl*0.5,-th*0.46,sl);ctx.lineTo(th*0.46,sl);ctx.quadraticCurveTo(th*0.66,sl*0.5,th*0.6,-th*0.15);ctx.closePath();
 const g=ctx.createLinearGradient(-th*0.6,0,th*0.6,0);g.addColorStop(0,'#4b5367');g.addColorStop(0.45,'#2c3242');g.addColorStop(1,'#141821');ctx.fillStyle=g;ctx.fill();
 ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=th*0.05;ctx.beginPath();ctx.moveTo(-th*0.2,sl*0.35);ctx.quadraticCurveTo(0,sl*0.45,th*0.25,sl*0.32);ctx.stroke();
 // cuff
 const cg=ctx.createLinearGradient(-th*0.5,0,th*0.5,0);cg.addColorStop(0,'#5c657c');cg.addColorStop(1,'#232836');ctx.fillStyle=cg;rr(ctx,-th*0.5,sl-th*0.05,th,th*0.26,th*0.1);ctx.fill();
 ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=th*0.03;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*th*0.13,sl);ctx.lineTo(i*th*0.13,sl+th*0.18);ctx.stroke();}
 // mitten hand
 const hy=sl+th*0.62;
 const hg=ctx.createRadialGradient(-th*0.2,hy-th*0.25,th*0.05,0,hy,th*0.75);hg.addColorStop(0,'#ffffff');hg.addColorStop(0.6,'#eceef3');hg.addColorStop(1,'#a9afbd');
 ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(0,hy,th*0.58,th*0.56,0,0,7);ctx.fill();
 ctx.beginPath();ctx.ellipse(-th*0.48,hy-th*0.12,th*0.2,th*0.26,-0.5,0,7);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.ellipse(-th*0.18,hy-th*0.26,th*0.14,th*0.08,-0.5,0,7);ctx.fill();
 ctx.restore();
}
function sneaker(fx,fy,S,s,ant){
 const w=S*0.27,h=S*0.13;
 // outsole + midsole
 ctx.fillStyle='#0c0f15';rr(ctx,fx-w/2,fy-h*0.22,w,h*0.24,h*0.12);ctx.fill();
 const mg=ctx.createLinearGradient(0,fy-h*0.55,0,fy);mg.addColorStop(0,'#ffffff');mg.addColorStop(1,'#c3c9d4');
 ctx.fillStyle=mg;rr(ctx,fx-w/2,fy-h*0.58,w,h*0.42,h*0.2);ctx.fill();
 ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=S*0.004;ctx.beginPath();ctx.moveTo(fx-w*0.44,fy-h*0.36);ctx.lineTo(fx+w*0.44,fy-h*0.36);ctx.stroke();
 // upper
 ctx.beginPath();ctx.moveTo(fx-w*0.46,fy-h*0.55);ctx.bezierCurveTo(fx-w*0.48,fy-h*1.35,fx+w*0.1,fy-h*1.5,fx+w*0.3,fy-h*1.2);ctx.quadraticCurveTo(fx+w*0.5,fy-h*0.95,fx+w*0.47,fy-h*0.55);ctx.closePath();
 const ug=ctx.createLinearGradient(fx-w/2,fy-h*1.4,fx+w/2,fy-h*0.5);ug.addColorStop(0,'#3d4457');ug.addColorStop(1,'#11141c');ctx.fillStyle=ug;ctx.fill();
 // accent swoop
 ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=S*0.02;ctx.strokeStyle=ant;ctx.lineWidth=S*0.013;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(fx-w*0.36,fy-h*0.68);ctx.quadraticCurveTo(fx,fy-h*0.95,fx+w*0.36,fy-h*0.7);ctx.stroke();ctx.restore();
 // laces
 ctx.strokeStyle='#e9ecf2';ctx.lineWidth=S*0.006;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(fx-w*0.12+s*w*0.02,fy-h*(1.32-i*0.15));ctx.lineTo(fx+w*0.08+s*w*0.02,fy-h*(1.3-i*0.15));ctx.stroke();}
 ctx.fillStyle='rgba(255,255,255,0.16)';ctx.beginPath();ctx.ellipse(fx-w*0.22,fy-h*1.12,w*0.1,h*0.14,-0.4,0,7);ctx.fill();
}
function drawBlob(o){
 const S=o.size,R=S*0.34,ant=o.ant;
 const sq=o.sq||0,sxs=1+sq*0.5,sys=1-sq*0.45;
 const lx=o.lx||0,ly=o.ly||0,T=o.time||0;
 ctx.save();ctx.globalAlpha=o.alpha??1;
 // contact AO
 const ao=ctx.createRadialGradient(o.sx,o.sy,0,o.sx,o.sy,S*0.4);ao.addColorStop(0,'rgba(0,0,0,0.55)');ao.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=ao;ctx.beginPath();ctx.ellipse(o.sx,o.sy,S*0.4,S*0.07,0,0,7);ctx.fill();
 const lp=o.moving?Math.sin(o.leg):0;
 for(const s of [-1,1]){const lift=o.moving?Math.max(0,s*lp)*S*0.07:0;sneaker(o.sx+s*S*0.16+lx*S*0.03,o.sy-lift,S,s,ant);}
 ctx.save();ctx.translate(o.sx,o.sy-S*0.1);ctx.scale(sxs,sys);ctx.translate(0,-R*0.96);
 const lean=o.moving?Math.sin(o.leg*0.5)*0.04:lx*0.05;ctx.rotate(lean);
 // headset band behind
 ctx.lineCap='round';
 ctx.strokeStyle='#151922';ctx.lineWidth=R*0.15;ctx.beginPath();ctx.moveTo(-R*0.98,-R*0.62);ctx.bezierCurveTo(-R*1.08,-R*1.95,R*0.98,-R*2.0,R*0.98,-R*0.62);ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=R*0.03;ctx.beginPath();ctx.moveTo(-R*1.0,-R*0.8);ctx.bezierCurveTo(-R*1.08,-R*2.0,R*0.95,-R*2.05,R*0.97,-R*0.8);ctx.stroke();
 const work=o.work?Math.sin(T*18):0,wave=o.wave?Math.sin(T*9):0;
 const armL=o.wave?-0.15:(o.work?-0.85+work*0.15:0.32+(o.moving?lp*0.4:0));
 const armR=o.wave?-2.55+wave*0.35:(o.work?0.85-work*0.15:-0.32-(o.moving?lp*0.4:0));
 // ===== body
 bodyPath(R);
 const g=ctx.createRadialGradient(-R*0.35,-R*1.0,R*0.05,-R*0.05,-R*0.5,R*1.75);
 g.addColorStop(0,'#ffffff');g.addColorStop(0.4,'#f5f6f9');g.addColorStop(0.75,'#d6dae3');g.addColorStop(1,'#a3aab8');
 ctx.save();ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=S*0.1;ctx.shadowOffsetY=S*0.04;ctx.fillStyle=g;ctx.fill();ctx.restore();
 ctx.save();bodyPath(R);ctx.clip();
 // terminator shading (light from top-left)
 const tg=ctx.createLinearGradient(-R*0.4,-R*1.4,R*1.1,R*0.2);tg.addColorStop(0,'rgba(60,70,100,0)');tg.addColorStop(0.55,'rgba(60,70,100,0)');tg.addColorStop(1,'rgba(50,60,95,0.38)');
 ctx.fillStyle=tg;ctx.fillRect(-R*2,-R*3,R*4,R*4.5);
 // task rim
 const rx=(o.rimx||0);const rim=ctx.createRadialGradient(rx*R*0.5,-R*0.5,R*1.0,rx*R*0.5,-R*0.5,R*1.9);
 rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,ant+'50');ctx.fillStyle=rim;ctx.fillRect(-R*3,-R*3,R*6,R*5);
 // inner fresnel edge
 ctx.save();bodyPath(R);ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=R*0.06;ctx.filter=`blur(${R*0.04}px)`;ctx.translate(-R*0.03,-R*0.03);ctx.stroke();ctx.restore();
 // spec highlights
 ctx.fillStyle='rgba(255,255,255,0.95)';ctx.filter=`blur(${R*0.07}px)`;ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.12,R*0.14,R*0.32,0.42,0,7);ctx.fill();ctx.filter='none';
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-R*0.5,-R*1.3,R*0.04,R*0.07,0.4,0,7);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,0.7)';ctx.filter=`blur(${R*0.03}px)`;ctx.beginPath();ctx.ellipse(-R*0.66,-R*2.02,R*0.09,R*0.05,-0.5,0,7);ctx.fill();ctx.filter='none';
 // blush
 for(const [bx,byy] of [[-0.52,-0.4],[0.5,-0.52]]){const cx=(bx+lx*0.3)*R,cy=(byy+ly*0.2)*R;const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.2);bg.addColorStop(0,'rgba(255,120,150,0.45)');bg.addColorStop(1,'rgba(255,120,150,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(cx,cy,R*0.22,R*0.14,0,0,7);ctx.fill();}
 // shadow of collar onto face
 const cs=ctx.createLinearGradient(0,-R*0.38,0,-R*0.1);cs.addColorStop(0,'rgba(30,35,55,0)');cs.addColorStop(1,'rgba(30,35,55,0.35)');ctx.fillStyle=cs;ctx.fillRect(-R*1.2,-R*0.38,R*2.4,R*0.3);
 ctx.restore();
 // ===== hoodie (garment slightly bigger than body)
 const collar=(c)=>{c.moveTo(-R*1.3,-R*0.08);c.quadraticCurveTo(0,R*0.16,R*1.3,-R*0.08);};
 ctx.save();ctx.beginPath();collar(ctx);ctx.lineTo(R*1.3,R*1.4);ctx.lineTo(-R*1.3,R*1.4);ctx.closePath();ctx.clip();
 ctx.save();ctx.translate(0,-R*0.1);ctx.scale(1.055,1.03);ctx.translate(0,R*0.1);bodyPath(R);ctx.restore();
 const hg=ctx.createRadialGradient(-R*0.4,-R*0.05,R*0.1,0,R*0.3,R*1.25);hg.addColorStop(0,'#4a5267');hg.addColorStop(0.55,'#2a3040');hg.addColorStop(1,'#11141b');
 ctx.fillStyle=hg;ctx.fill();
 ctx.save();ctx.clip();
 // folds
 ctx.lineCap='round';
 for(const [x1,y1,x2,y2,x3,y3,a] of [[-0.85,0.15,-0.6,0.45,-0.75,0.8,0.35],[0.8,0.1,0.62,0.4,0.82,0.75,0.4],[-0.3,0.85,0,0.78,0.3,0.86,0.3]]){
  ctx.strokeStyle=`rgba(0,0,0,${a})`;ctx.lineWidth=R*0.05;ctx.beginPath();ctx.moveTo(x1*R,y1*R);ctx.quadraticCurveTo(x2*R,y2*R,x3*R,y3*R);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=R*0.03;ctx.beginPath();ctx.moveTo(x1*R+R*0.05,y1*R);ctx.quadraticCurveTo(x2*R+R*0.05,y2*R,x3*R+R*0.05,y3*R);ctx.stroke();}
 // hem rib
 ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(-R*1.3,R*0.8,R*2.6,R*0.4);
 ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=R*0.02;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(i*R*0.09,R*0.82);ctx.lineTo(i*R*0.09,R*1.1);ctx.stroke();}
 // kangaroo pocket
 ctx.beginPath();ctx.moveTo(-R*0.5,R*0.4);ctx.lineTo(R*0.5,R*0.4);ctx.quadraticCurveTo(R*0.62,R*0.55,R*0.72,R*0.78);ctx.lineTo(-R*0.72,R*0.78);ctx.quadraticCurveTo(-R*0.62,R*0.55,-R*0.5,R*0.4);ctx.closePath();
 ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fill();ctx.setLineDash([R*0.04,R*0.035]);ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=R*0.015;ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle='rgba(0,0,0,0.45)';ctx.lineWidth=R*0.03;ctx.beginPath();ctx.moveTo(-R*0.5,R*0.4);ctx.quadraticCurveTo(-R*0.62,R*0.55,-R*0.72,R*0.78);ctx.moveTo(R*0.5,R*0.4);ctx.quadraticCurveTo(R*0.62,R*0.55,R*0.72,R*0.78);ctx.stroke();
 // chest badge (embroidered patch)
 ctx.save();ctx.translate(R*0.5,R*0.22);ctx.rotate(-0.06);
 ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.fillStyle=ant;rr(ctx,-R*0.2,-R*0.085,R*0.4,R*0.17,R*0.085);ctx.fill();ctx.shadowBlur=0;
 ctx.setLineDash([R*0.02,R*0.018]);ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=R*0.01;rr(ctx,-R*0.18,-R*0.066,R*0.36,R*0.132,R*0.066);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#0b0f17';ctx.font=`900 ${R*0.11}px JBM`;ctx.textAlign='center';ctx.fillText('GRK',0,R*0.04);ctx.textAlign='left';ctx.restore();
 ctx.restore();ctx.restore();
 // rolled hood/collar
 ctx.save();ctx.lineCap='round';
 ctx.beginPath();collar(ctx);const cg=ctx.createLinearGradient(0,-R*0.2,0,R*0.2);cg.addColorStop(0,'#5a6379');cg.addColorStop(1,'#1c2029');
 ctx.strokeStyle=cg;ctx.lineWidth=R*0.2;ctx.save();ctx.translate(0,R*0.02);ctx.scale(0.86,1);ctx.beginPath();collar(ctx);ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=R*0.04;ctx.translate(0,-R*0.06);ctx.beginPath();collar(ctx);ctx.stroke();ctx.restore();
 ctx.restore();
 // drawstrings
 ctx.lineCap='round';
 for(const s of [-1,1]){const sx=s*R*0.17,sw=Math.sin(T*4+s)*R*0.03;
  ctx.strokeStyle='#eef1f6';ctx.lineWidth=R*0.04;ctx.beginPath();ctx.moveTo(sx,R*0.1);ctx.quadraticCurveTo(sx+s*R*0.03+sw,R*0.3,sx+sw*0.6,R*0.48);ctx.stroke();
  ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.15;ctx.fillStyle=ant;rr(ctx,sx+sw*0.6-R*0.035,R*0.46,R*0.07,R*0.11,R*0.03);ctx.fill();ctx.restore();}
 // curl-tip orb
 const tipL=[-R*0.84,-R*2.06];
 ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.6*(o.glow??1);ctx.fillStyle=ant;ctx.beginPath();ctx.arc(tipL[0],tipL[1],R*0.11,0,7);ctx.fill();ctx.restore();
 const og=ctx.createRadialGradient(tipL[0]-R*0.04,tipL[1]-R*0.04,0,tipL[0],tipL[1],R*0.11);og.addColorStop(0,'rgba(255,255,255,0.95)');og.addColorStop(0.5,'rgba(255,255,255,0.15)');og.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=og;ctx.beginPath();ctx.arc(tipL[0],tipL[1],R*0.11,0,7);ctx.fill();
 // eyes
 const bl=o.blink||1,ew=R*0.2,el=R*0.48*bl,spread=1-Math.abs(lx)*0.15;
 eyePill((-0.3*spread+lx*0.3)*R,(-0.72+ly*0.22)*R,ew,el,-0.35);
 eyePill((0.27*spread+lx*0.3)*R,(-0.84+ly*0.22)*R,ew,el,-0.35);
 // ear cups
 for(const s of [-1,1]){
  const cx=s*R*0.99,cy=-R*0.64;
  const eg=ctx.createRadialGradient(cx-R*0.06,cy-R*0.08,R*0.02,cx,cy,R*0.26);eg.addColorStop(0,'#4a5266');eg.addColorStop(1,'#0e1117');
  ctx.fillStyle='#1a1e27';ctx.beginPath();ctx.ellipse(cx-s*R*0.04,cy,R*0.15,R*0.25,0,0,7);ctx.fill();
  ctx.fillStyle=eg;ctx.beginPath();ctx.ellipse(cx+s*R*0.03,cy,R*0.17,R*0.25,0,0,7);ctx.fill();
  ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.strokeStyle=ant;ctx.lineWidth=R*0.045;ctx.beginPath();ctx.ellipse(cx+s*R*0.05,cy,R*0.085,R*0.14,0,0,7);ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.ellipse(cx+s*R*0.0-R*0.04,cy-R*0.15,R*0.04,R*0.025,-0.4,0,7);ctx.fill();
 }
 // mic boom
 ctx.strokeStyle='#151922';ctx.lineWidth=R*0.055;ctx.beginPath();ctx.moveTo(R*0.98,-R*0.5);ctx.bezierCurveTo(R*0.95,-R*0.2,R*0.7,-R*0.16,R*0.46,-R*0.24);ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=R*0.015;ctx.beginPath();ctx.moveTo(R*0.97,-R*0.52);ctx.bezierCurveTo(R*0.94,-R*0.24,R*0.7,-R*0.2,R*0.48,-R*0.27);ctx.stroke();
 ctx.fillStyle='#1a1e27';ctx.beginPath();ctx.ellipse(R*0.42,-R*0.24,R*0.085,R*0.07,0,0,7);ctx.fill();
 ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.fillStyle=ant;ctx.beginPath();ctx.arc(R*0.38,-R*0.26,R*0.03,0,7);ctx.fill();ctx.restore();
 // arms
 arm(-R*0.9,-R*0.02,armL,R*0.95,R*0.32);
 arm(R*0.9,-R*0.02,armR,R*0.95,R*0.32);
 const m=ctx.getTransform();const tp=m.transformPoint(new DOMPoint(tipL[0],tipL[1]));const top=m.transformPoint(new DOMPoint(0,-R*2.45));
 ctx.restore();ctx.restore();
 return {tipX:tp.x,tipY:tp.y,top:top.y};
}

/* ---------------- OUTFITS ---------------- */
const OUT={
 hoodie:{g:['#4a5267','#2a3040','#11141b'],sl:['#4b5367','#2c3242','#141821'],cuff:'#5c657c'},
 trench:{g:['#e0bf86','#b58f58','#6e5330'],sl:['#d8b47a','#a8834f','#6e5330'],cuff:'#8c6a3e'},
 army:{g:['#87965a','#5f6e3b','#323b1f'],sl:['#7f8e55','#58663a','#323b1f'],cuff:'#4a5530'},
 suit:{g:['#45599a','#26375f','#0f1730'],sl:['#3f5390','#23335d','#0f1730'],cuff:'#f2f4f8'},
 artist:{g:['#ffffff','#eef1f7','#b9c1d3'],sl:['#ffffff','#e3e8f1','#aab3c6'],cuff:'#1d2c5a'},
 ceo:{g:['#33333d','#18181e','#050507'],sl:['#30303a','#18181e','#050507'],cuff:'#f2f4f8'},
 seo:{g:['#a6e86a','#5fae2e','#2c5a12'],sl:['#9fe063','#58a42a','#2c5a12'],cuff:'#2c5a12'},
 creative:{g:['#3d3d48','#1c1c22','#08080b'],sl:['#3a3a44','#1c1c22','#08080b'],cuff:'#ff8a00'},
 pr:{g:['#ff9cc8','#e0569a','#8a1f55'],sl:['#ff94c2','#d84f92','#8a1f55'],cuff:'#f2f4f8'},
 community:{g:['#9a7bff','#5b3fd6','#2a1a7a'],sl:['#9473ff','#5639cc','#2a1a7a'],cuff:'#7c5cff'},
 pm:{g:['#ffab45','#e2700a','#7a3a00'],sl:['#5d6578','#3a4152','#1b1f29'],cuff:'#ffab45'},
 analyst:{g:['#a9b2c4','#677087','#2f3545'],sl:['#a1aabd','#626b82','#2f3545'],cuff:'#4a5266'},
 qa:{g:['#ffffff','#e6ebf3','#aeb8c9'],sl:['#ffffff','#e3e8f1','#aab3c6'],cuff:'#d0d6e2'},
 dev:{g:['#46a678','#22684a','#0d2f20'],sl:['#42a072','#22684a','#0d2f20'],cuff:'#174a33'},
 captain:{g:['#3a5190','#1a2a52','#0a1430'],sl:['#36508c','#1a2a52','#0a1430'],cuff:'#e8c56a'},
};
function armO(sx,sy,ang,len,th,pal){
 ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);
 const sl=len*0.6;
 ctx.beginPath();ctx.moveTo(-th*0.6,-th*0.15);ctx.quadraticCurveTo(-th*0.66,sl*0.5,-th*0.46,sl);ctx.lineTo(th*0.46,sl);ctx.quadraticCurveTo(th*0.66,sl*0.5,th*0.6,-th*0.15);ctx.closePath();
 const g=ctx.createLinearGradient(-th*0.6,0,th*0.6,0);g.addColorStop(0,pal.sl[0]);g.addColorStop(0.45,pal.sl[1]);g.addColorStop(1,pal.sl[2]);ctx.fillStyle=g;ctx.fill();
 ctx.fillStyle=pal.cuff;rr(ctx,-th*0.5,sl-th*0.05,th,th*0.24,th*0.1);ctx.fill();
 const hy=sl+th*0.62;
 const hg=ctx.createRadialGradient(-th*0.2,hy-th*0.25,th*0.05,0,hy,th*0.75);hg.addColorStop(0,'#ffffff');hg.addColorStop(0.6,'#eceef3');hg.addColorStop(1,'#a9afbd');
 ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(0,hy,th*0.58,th*0.56,0,0,7);ctx.fill();
 ctx.beginPath();ctx.ellipse(-th*0.48,hy-th*0.12,th*0.2,th*0.26,-0.5,0,7);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.ellipse(-th*0.18,hy-th*0.26,th*0.14,th*0.08,-0.5,0,7);ctx.fill();
 ctx.restore();
}
function garmentDetails(R,of,ant,T){
 const r=rng(of.length*7);
 if(of==='hoodie'||of==='community'){
  ctx.lineCap='round';
  for(const [x1,y1,x2,y2,x3,y3] of [[-0.85,0.15,-0.6,0.45,-0.75,0.8],[0.8,0.1,0.62,0.4,0.82,0.75]]){ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=R*0.05;ctx.beginPath();ctx.moveTo(x1*R,y1*R);ctx.quadraticCurveTo(x2*R,y2*R,x3*R,y3*R);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(-R*0.5,R*0.4);ctx.lineTo(R*0.5,R*0.4);ctx.quadraticCurveTo(R*0.62,R*0.55,R*0.72,R*0.78);ctx.lineTo(-R*0.72,R*0.78);ctx.quadraticCurveTo(-R*0.62,R*0.55,-R*0.5,R*0.4);ctx.closePath();
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fill();ctx.setLineDash([R*0.04,R*0.035]);ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=R*0.015;ctx.stroke();ctx.setLineDash([]);
  ctx.save();ctx.translate(R*0.5,R*0.22);ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.fillStyle=ant;rr(ctx,-R*0.2,-R*0.085,R*0.4,R*0.17,R*0.085);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#0b0f17';ctx.font=`900 ${R*0.11}px JBM`;ctx.textAlign='center';ctx.fillText('GRK',0,R*0.04);ctx.textAlign='left';ctx.restore();
 }
 if(of==='trench'){
  ctx.fillStyle='rgba(60,40,15,0.35)';ctx.beginPath();ctx.moveTo(-R*0.08,R*0.05);ctx.lineTo(-R*0.5,R*0.02);ctx.lineTo(-R*0.12,R*0.5);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(R*0.08,R*0.05);ctx.lineTo(R*0.5,R*0.02);ctx.lineTo(R*0.12,R*0.5);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(60,40,15,0.5)';ctx.lineWidth=R*0.025;ctx.beginPath();ctx.moveTo(R*0.05,R*0.45);ctx.lineTo(R*0.05,R*1.1);ctx.stroke();
  ctx.fillStyle='#4a3420';ctx.fillRect(-R*1.3,R*0.52,R*2.6,R*0.14);
  ctx.strokeStyle='#e8c56a';ctx.lineWidth=R*0.035;ctx.strokeRect(-R*0.1,R*0.5,R*0.2,R*0.18);
  ctx.fillStyle='#3a2a18';for(const [x,y] of [[-0.22,0.28],[0.22,0.28],[-0.22,0.82],[0.22,0.82]]){ctx.beginPath();ctx.arc(x*R,y*R,R*0.045,0,7);ctx.fill();}
 }
 if(of==='army'){
  const cols=['#4c5a2e','#8a8f5a','#3a4224','#6d7a43'];
  for(let i=0;i<26;i++){ctx.fillStyle=cols[i%4];ctx.beginPath();ctx.ellipse((r()*2.4-1.2)*R,(r()*1.2)*R,R*(0.1+r()*0.14),R*(0.05+r()*0.08),r()*3,0,7);ctx.fill();}
  ctx.fillStyle='rgba(0,0,0,0.25)';for(const s of [-1,1]){rr(ctx,s*R*0.45-R*0.2,R*0.18,R*0.4,R*0.3,R*0.04);ctx.fill();}
  ctx.fillStyle='rgba(0,0,0,0.35)';for(const s of [-1,1]){rr(ctx,s*R*0.45-R*0.21,R*0.16,R*0.42,R*0.1,R*0.04);ctx.fill();}
 }
 if(of==='suit'||of==='ceo'||of==='pr'){
  ctx.fillStyle='#f4f6fa';ctx.beginPath();ctx.moveTo(-R*0.32,R*0.0);ctx.lineTo(R*0.32,R*0.0);ctx.lineTo(0,R*0.55);ctx.closePath();ctx.fill();
  ctx.fillStyle=of==='ceo'?'#f2b81c':of==='pr'?'#1a1a22':'#e0283c';ctx.beginPath();ctx.moveTo(-R*0.07,R*0.05);ctx.lineTo(R*0.07,R*0.05);ctx.lineTo(R*0.1,R*0.42);ctx.lineTo(0,R*0.55);ctx.lineTo(-R*0.1,R*0.42);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.moveTo(-R*0.32,R*0.0);ctx.lineTo(-R*0.62,R*0.0);ctx.lineTo(-R*0.02,R*0.62);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(R*0.32,R*0.0);ctx.lineTo(R*0.62,R*0.0);ctx.lineTo(R*0.02,R*0.62);ctx.closePath();ctx.fill();
  ctx.fillStyle=of==='ceo'?'#f2b81c':'#ffffff';ctx.beginPath();ctx.moveTo(R*0.42,R*0.28);ctx.lineTo(R*0.66,R*0.28);ctx.lineTo(R*0.6,R*0.18);ctx.lineTo(R*0.5,R*0.22);ctx.closePath();ctx.fill();
  ctx.fillStyle=of==='ceo'?'#f2b81c':'#0b0f17';for(const y of [0.72,0.9]){ctx.beginPath();ctx.arc(0,y*R,R*0.04,0,7);ctx.fill();}
 }
 if(of==='seo'){ctx.save();ctx.translate(-R*0.45,R*0.3);ctx.fillStyle='#1f3a10';rr(ctx,-R*0.22,-R*0.1,R*0.44,R*0.2,R*0.06);ctx.fill();ctx.fillStyle='#d6ffb0';ctx.font=`900 ${R*0.13}px JBM`;ctx.textAlign='center';ctx.fillText('SEO',0,R*0.05);ctx.textAlign='left';ctx.restore();
  ctx.strokeStyle='#1f3a10';ctx.lineWidth=R*0.05;ctx.beginPath();ctx.arc(R*0.45,R*0.5,R*0.14,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(R*0.55,R*0.6);ctx.lineTo(R*0.72,R*0.78);ctx.stroke();}
 if(of==='creative'){const cs=['#ff4fa3','#ffb020','#3b9cff','#2fe38a','#9a5cff'];const r2=rng(77);for(let i=0;i<14;i++){ctx.fillStyle=cs[i%5];ctx.beginPath();ctx.ellipse((r2()*2-1)*R,(0.1+r2()*1.0)*R,R*(0.04+r2()*0.08),R*(0.03+r2()*0.06),r2()*3,0,7);ctx.fill();}
  ctx.fillStyle='#2a2a33';ctx.fillRect(-R*1.3,-R*0.02,R*2.6,R*0.16);}
 if(of==='pm'){ctx.fillStyle='#cfd6e2';ctx.fillRect(-R*1.3,R*0.42,R*2.6,R*0.09);ctx.fillRect(-R*1.3,R*0.72,R*2.6,R*0.09);ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(-R*1.3,R*0.44,R*2.6,R*0.02);
  ctx.save();ctx.translate(R*0.5,R*0.2);ctx.rotate(0.15);ctx.fillStyle='#8a5a2b';rr(ctx,-R*0.17,-R*0.2,R*0.34,R*0.42,R*0.03);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-R*0.13,-R*0.14,R*0.26,R*0.32);ctx.fillStyle='#2fe38a';for(let i=0;i<3;i++)ctx.fillRect(-R*0.1,-R*0.1+i*R*0.09,R*0.05,R*0.04);ctx.restore();}
 if(of==='analyst'){ctx.fillStyle='#e9ecf2';ctx.beginPath();ctx.moveTo(-R*0.22,R*0.0);ctx.lineTo(R*0.22,R*0.0);ctx.lineTo(0,R*0.32);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2f3545';for(const y of [0.42,0.6,0.78])for(const s of [-1,1]){ctx.beginPath();ctx.arc(s*R*0.08,y*R,R*0.035,0,7);ctx.fill();}
  ctx.strokeStyle='rgba(0,0,0,0.18)';ctx.lineWidth=R*0.02;for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(i*R*0.12,R*0.05);ctx.lineTo(i*R*0.12,R*1.2);ctx.stroke();}
  ctx.fillStyle='#ffb020';ctx.fillRect(R*0.48,R*0.12,R*0.04,R*0.22);}
 if(of==='qa'){ctx.fillStyle='rgba(0,0,0,0.08)';ctx.beginPath();ctx.moveTo(-R*0.1,R*0.02);ctx.lineTo(-R*0.5,R*0.0);ctx.lineTo(-R*0.12,R*0.6);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(R*0.1,R*0.02);ctx.lineTo(R*0.5,R*0.0);ctx.lineTo(R*0.12,R*0.6);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=R*0.025;ctx.beginPath();ctx.moveTo(0,R*0.3);ctx.lineTo(0,R*1.2);ctx.stroke();rr(ctx,R*0.3,R*0.25,R*0.34,R*0.3,R*0.04);ctx.stroke();
  for(const [x,c] of [[0.38,'#3b9cff'],[0.47,'#ff4d6a'],[0.56,'#2fe38a']]){ctx.fillStyle=c;ctx.fillRect(x*R,R*0.12,R*0.04,R*0.16);}}
 if(of==='dev'){
  ctx.strokeStyle='#cfd6e2';ctx.lineWidth=R*0.03;ctx.beginPath();ctx.moveTo(0,R*0.03);ctx.lineTo(0,R*1.1);ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,0.25)';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*R*0.12,R*0.45);ctx.lineTo(s*R*0.62,R*0.45);ctx.lineTo(s*R*0.7,R*0.8);ctx.lineTo(s*R*0.12,R*0.8);ctx.closePath();ctx.fill();}
  ctx.save();ctx.translate(-R*0.5,R*0.22);ctx.fillStyle='#0b1a12';rr(ctx,-R*0.19,-R*0.09,R*0.38,R*0.18,R*0.05);ctx.fill();ctx.fillStyle='#7dffb9';ctx.font=`900 ${R*0.12}px JBM`;ctx.textAlign='center';ctx.fillText('</>',0,R*0.045);ctx.textAlign='left';ctx.restore();
 }
 if(of==='captain'){
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.moveTo(-R*0.1,R*0.02);ctx.lineTo(-R*0.55,R*0.0);ctx.lineTo(-R*0.12,R*0.55);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(R*0.1,R*0.02);ctx.lineTo(R*0.55,R*0.0);ctx.lineTo(R*0.12,R*0.55);ctx.closePath();ctx.fill();
  const gg=ctx.createRadialGradient(-2,-2,0,0,0,R*0.06);gg.addColorStop(0,'#fff1a8');gg.addColorStop(1,'#c28a12');
  for(const [x,y] of [[-0.25,0.35],[0.25,0.35],[-0.25,0.62],[0.25,0.62],[-0.25,0.89],[0.25,0.89]]){ctx.save();ctx.translate(x*R,y*R);ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,R*0.05,0,7);ctx.fill();ctx.restore();}
  ctx.fillStyle='#e8c56a';for(const s of [-1,1])ctx.fillRect(s*R*0.95-R*0.12,R*0.05,R*0.24,R*0.05);
 }
 if(of==='artist'){
  ctx.fillStyle='#1d2c5a';for(let y=0.08;y<1.2;y+=0.17){ctx.fillRect(-R*1.3,y*R,R*2.6,R*0.075);}
  ctx.fillStyle='#e63946';ctx.beginPath();ctx.moveTo(-R*0.4,R*0.0);ctx.lineTo(R*0.4,R*0.0);ctx.lineTo(R*0.02,R*0.38);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(R*0.1,R*0.42,R*0.06,R*0.12,0.5,0,7);ctx.fill();
 }
}
function drawHat(R,of,ant,T){
 ctx.save();
 if(of==='trench'){
  const bg=ctx.createLinearGradient(0,-R*2.2,0,-R*1.4);bg.addColorStop(0,'#6b5236');bg.addColorStop(1,'#3a2a18');
  ctx.fillStyle='#2e2214';ctx.beginPath();ctx.ellipse(-R*0.1,-R*1.42,R*1.02,R*0.22,-0.08,0,7);ctx.fill();
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-R*0.66,-R*1.45);ctx.bezierCurveTo(-R*0.7,-R*2.0,-R*0.55,-R*2.18,-R*0.1,-R*2.05);ctx.bezierCurveTo(R*0.35,-R*2.2,R*0.52,-R*2.0,R*0.46,-R*1.5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1d140c';ctx.beginPath();ctx.moveTo(-R*0.67,-R*1.5);ctx.lineTo(R*0.47,-R*1.55);ctx.lineTo(R*0.48,-R*1.68);ctx.lineTo(-R*0.69,-R*1.64);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.ellipse(-R*0.35,-R*1.9,R*0.1,R*0.18,0.2,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.08)';ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.36,R*0.5,R*0.06,-0.08,0,7);ctx.fill();
  ctx.restore();return [-R*0.1,-R*2.12];
 }
 if(of==='army'){
  const hg=ctx.createRadialGradient(-R*0.35,-R*1.9,R*0.05,0,-R*1.4,R*1.3);hg.addColorStop(0,'#95a463');hg.addColorStop(0.6,'#5c6b37');hg.addColorStop(1,'#2e361b');
  ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(-R*0.06,-R*1.22,R*1.02,R*1.08,0,Math.PI,0);ctx.closePath();ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(-R*0.06,-R*1.22,R*1.02,R*1.08,0,Math.PI,0);ctx.clip();
  ctx.strokeStyle='rgba(20,25,10,0.35)';ctx.lineWidth=R*0.02;for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(i*R*0.16-R*0.6,-R*2.4);ctx.lineTo(i*R*0.16+R*0.6,-R*1.1);ctx.stroke();ctx.beginPath();ctx.moveTo(i*R*0.16+R*0.6,-R*2.4);ctx.lineTo(i*R*0.16-R*0.6,-R*1.1);ctx.stroke();}
  ctx.fillStyle='#3d6b2a';for(const [x,y,a] of [[-0.5,-1.75,-0.6],[0.35,-1.9,0.5],[-0.1,-2.15,0]]){ctx.save();ctx.translate(x*R,y*R);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,R*0.05,R*0.16,0,0,7);ctx.fill();ctx.restore();}
  ctx.restore();
  ctx.fillStyle='#2a3118';ctx.beginPath();ctx.ellipse(-R*0.06,-R*1.22,R*1.12,R*0.15,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.85,R*0.12,R*0.22,0.5,0,7);ctx.fill();
  ctx.strokeStyle='#2a3118';ctx.lineWidth=R*0.04;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*R*0.98,-R*1.2);ctx.quadraticCurveTo(s*R*0.98,-R*0.6,s*R*0.7,-R*0.25);ctx.stroke();}
  ctx.restore();return [-R*0.06,-R*2.3];
 }
 if(of==='suit'){
  ctx.strokeStyle='#145a3a';ctx.lineWidth=R*0.07;ctx.beginPath();ctx.ellipse(0,-R*1.32,R*0.72,R*0.12,0,0,Math.PI);ctx.stroke();
  ctx.fillStyle='rgba(30,220,140,0.55)';ctx.beginPath();ctx.ellipse(R*0.02,-R*1.24,R*0.62,R*0.24,0,0,Math.PI);ctx.fill();
  ctx.strokeStyle='rgba(180,255,220,0.7)';ctx.lineWidth=R*0.02;ctx.beginPath();ctx.ellipse(R*0.02,-R*1.24,R*0.62,R*0.24,0,0.1,Math.PI-0.1);ctx.stroke();
  ctx.restore();return null;
 }
 if(of==='artist'){
  ctx.translate(-R*0.12,-R*1.72);ctx.rotate(-0.18);
  const bg=ctx.createRadialGradient(-R*0.25,-R*0.12,R*0.05,0,0,R*0.9);bg.addColorStop(0,'#ff6b76');bg.addColorStop(1,'#a3101f');
  ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(0,0,R*0.88,R*0.34,0,0,7);ctx.fill();
  ctx.fillStyle='#8a0c19';ctx.beginPath();ctx.ellipse(0,R*0.18,R*0.72,R*0.1,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='#a3101f';ctx.beginPath();ctx.arc(R*0.05,-R*0.34,R*0.06,0,7);ctx.fill();
  ctx.restore();return [-R*0.18,-R*2.08];
 }
 if(of==='seo'){
  const cg=ctx.createRadialGradient(-R*0.3,-R*1.9,R*0.05,0,-R*1.5,R*1.1);cg.addColorStop(0,'#3d6b24');cg.addColorStop(1,'#16300a');
  ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.38,R*0.86,R*0.75,0,Math.PI,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0f2207';ctx.beginPath();ctx.ellipse(R*0.42,-R*1.36,R*0.62,R*0.14,-0.1,0,7);ctx.fill();
  ctx.fillStyle='#a6e86a';ctx.beginPath();ctx.arc(-R*0.05,-R*2.12,R*0.06,0,7);ctx.fill();
  ctx.fillStyle='#d6ffb0';ctx.font=`900 ${R*0.2}px Inter`;ctx.textAlign='center';ctx.fillText('#1',-R*0.05,-R*1.55);ctx.textAlign='left';
  ctx.restore();return [-R*0.05,-R*2.15];
 }
 if(of==='creative'){
  const cg=ctx.createLinearGradient(-R,-R*2,R,-R*1.3);cg.addColorStop(0,'#ff8a00');cg.addColorStop(0.5,'#ff4fa3');cg.addColorStop(1,'#9a5cff');
  ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-R*0.62,-R*1.45);ctx.quadraticCurveTo(-R*0.6,-R*2.15,-R*0.05,-R*2.15);ctx.quadraticCurveTo(R*0.5,-R*2.15,R*0.52,-R*1.45);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.42,R*1.0,R*0.22,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.beginPath();ctx.ellipse(-R*0.3,-R*1.9,R*0.12,R*0.18,0.3,0,7);ctx.fill();
  ctx.restore();return [-R*0.05,-R*2.2];
 }
 if(of==='pr'){
  ctx.fillStyle='#14141a';ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.42,R*0.95,R*0.2,-0.05,0,7);ctx.fill();
  const tg=ctx.createLinearGradient(-R*0.55,0,R*0.45,0);tg.addColorStop(0,'#3a3a46');tg.addColorStop(1,'#0c0c10');ctx.fillStyle=tg;rr(ctx,-R*0.55,-R*2.45,R*1.0,R*1.05,R*0.08);ctx.fill();
  ctx.fillStyle='#ff5aa8';ctx.fillRect(-R*0.55,-R*1.68,R*1.0,R*0.16);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(-R*0.45,-R*2.35,R*0.12,R*0.6);
  ctx.restore();return [-R*0.05,-R*2.45];
 }
 if(of==='pm'){
  const hg=ctx.createRadialGradient(-R*0.35,-R*1.9,R*0.05,0,-R*1.5,R*1.2);hg.addColorStop(0,'#fff27a');hg.addColorStop(1,'#d6a300');
  ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.32,R*0.88,R*0.92,0,Math.PI,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c79500';ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.32,R*1.06,R*0.16,0,0,7);ctx.fill();
  ctx.strokeStyle='#e8b800';ctx.lineWidth=R*0.08;ctx.beginPath();ctx.moveTo(-R*0.05,-R*2.22);ctx.lineTo(-R*0.05,-R*1.4);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.8,R*0.1,R*0.2,0.5,0,7);ctx.fill();
  ctx.restore();return [-R*0.05,-R*2.25];
 }
 if(of==='analyst'){
  ctx.fillStyle='#16161c';ctx.beginPath();ctx.ellipse(-R*0.05,-R*1.45,R*0.7,R*0.22,0,0,Math.PI);ctx.fill();ctx.fillRect(-R*0.75,-R*1.6,R*1.4,R*0.18);
  ctx.beginPath();ctx.moveTo(-R*1.05,-R*1.75);ctx.lineTo(-R*0.05,-R*2.1);ctx.lineTo(R*0.95,-R*1.75);ctx.lineTo(-R*0.05,-R*1.45);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#ffb020';ctx.lineWidth=R*0.04;ctx.beginPath();ctx.moveTo(-R*0.05,-R*1.78);ctx.quadraticCurveTo(R*0.6,-R*1.7,R*0.7,-R*1.3);ctx.stroke();
  ctx.fillStyle='#ffb020';rr(ctx,R*0.64,-R*1.32,R*0.12,R*0.22,R*0.04);ctx.fill();
  ctx.restore();return [-R*0.05,-R*2.1];
 }
 if(of==='qa'){
  ctx.fillStyle='#22262f';ctx.fillRect(-R*0.95,-R*1.3,R*1.85,R*0.14);
  for(const x of [-0.42,0.32]){const lg=ctx.createRadialGradient(x*R-R*0.06,-R*1.28,R*0.02,x*R,-R*1.23,R*0.26);lg.addColorStop(0,'#c9fff0');lg.addColorStop(1,'#19d3c5');
   ctx.fillStyle='#2b303c';ctx.beginPath();ctx.ellipse(x*R,-R*1.23,R*0.3,R*0.22,0,0,7);ctx.fill();ctx.fillStyle=lg;ctx.beginPath();ctx.ellipse(x*R,-R*1.23,R*0.23,R*0.16,0,0,7);ctx.fill();
   ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.ellipse(x*R-R*0.08,-R*1.28,R*0.05,R*0.03,-0.4,0,7);ctx.fill();}
  ctx.restore();return [-R*0.84,-R*2.06];
 }
 if(of==='dev'){
  const bg=ctx.createRadialGradient(-R*0.3,-R*1.9,R*0.05,0,-R*1.5,R*1.2);bg.addColorStop(0,'#ff9a55');bg.addColorStop(1,'#c4410f');
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-R*0.86,-R*1.28);ctx.bezierCurveTo(-R*0.95,-R*2.1,-R*0.4,-R*2.35,-R*0.05,-R*2.3);ctx.bezierCurveTo(R*0.4,-R*2.3,R*0.82,-R*2.0,R*0.8,-R*1.3);ctx.closePath();ctx.fill();
  ctx.save();ctx.clip();ctx.strokeStyle='rgba(120,30,0,0.35)';ctx.lineWidth=R*0.03;for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(i*R*0.13,-R*2.4);ctx.lineTo(i*R*0.15,-R*1.3);ctx.stroke();}ctx.restore();
  ctx.fillStyle='#a8360b';rr(ctx,-R*0.92,-R*1.5,R*1.76,R*0.26,R*0.12);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=R*0.025;for(let i=-7;i<=7;i++){ctx.beginPath();ctx.moveTo(i*R*0.11,-R*1.47);ctx.lineTo(i*R*0.11,-R*1.27);ctx.stroke();}
  ctx.fillStyle='#fff3e6';ctx.beginPath();ctx.arc(-R*0.05,-R*2.36,R*0.17,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.85,R*0.1,R*0.18,0.4,0,7);ctx.fill();
  ctx.restore();return [-R*0.05,-R*2.4];
 }
 if(of==='captain'){
  ctx.fillStyle='#111520';ctx.beginPath();ctx.ellipse(R*0.02,-R*1.3,R*0.62,R*0.16,0,0,Math.PI);ctx.fill();
  const cg=ctx.createLinearGradient(0,-R*1.95,0,-R*1.4);cg.addColorStop(0,'#ffffff');cg.addColorStop(1,'#cfd5e0');
  ctx.fillStyle='#1a2a52';rr(ctx,-R*0.72,-R*1.55,R*1.44,R*0.27,R*0.06);ctx.fill();
  ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(-R*0.02,-R*1.7,R*0.98,R*0.3,-0.04,0,7);ctx.fill();
  ctx.fillStyle='#e8c56a';ctx.fillRect(-R*0.72,-R*1.5,R*1.44,R*0.05);
  ctx.save();ctx.shadowColor='#ffd23f';ctx.shadowBlur=R*0.2;ctx.fillStyle='#f5c430';ctx.beginPath();ctx.arc(0,-R*1.48,R*0.12,0,7);ctx.fill();ctx.restore();
  ctx.strokeStyle='#1a2a52';ctx.lineWidth=R*0.03;ctx.beginPath();ctx.moveTo(0,-R*1.56);ctx.lineTo(0,-R*1.4);ctx.moveTo(-R*0.06,-R*1.43);ctx.quadraticCurveTo(0,-R*1.38,R*0.06,-R*1.43);ctx.stroke();
  ctx.restore();return [-R*0.02,-R*2.0];
 }
 if(of==='ceo'){
  const gg=ctx.createLinearGradient(0,-R*2.2,0,-R*1.5);gg.addColorStop(0,'#fff1a8');gg.addColorStop(0.5,'#f5c430');gg.addColorStop(1,'#b97d0c');
  ctx.shadowColor='#ffd23f';ctx.shadowBlur=R*0.4;
  ctx.fillStyle=gg;ctx.beginPath();ctx.moveTo(-R*0.62,-R*1.5);ctx.lineTo(-R*0.66,-R*2.12);ctx.lineTo(-R*0.38,-R*1.82);ctx.lineTo(-R*0.12,-R*2.25);ctx.lineTo(R*0.12,-R*1.82);ctx.lineTo(R*0.38,-R*2.15);ctx.lineTo(R*0.48,-R*1.55);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#b97d0c';ctx.fillRect(-R*0.63,-R*1.62,R*1.12,R*0.13);
  for(const [x,y,c] of [[-0.66,-2.14,'#ff3b5c'],[-0.12,-2.27,'#3b9cff'],[0.38,-2.17,'#2fe38a']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x*R,y*R,R*0.06,0,7);ctx.fill();}
  ctx.fillStyle='#ff3b5c';ctx.beginPath();ctx.arc(-R*0.07,-R*1.56,R*0.05,0,7);ctx.fill();
  ctx.restore();return [-R*0.12,-R*2.3];
 }
 ctx.restore();return null;
}
function drawGrokky(o){
 const S=o.size,R=S*0.34,ant=o.ant,of=o.outfit||'hoodie',pal=OUT[of];
 const sq=o.sq||0,sxs=1+sq*0.5,sys=1-sq*0.45;
 const lx=o.lx||0,ly=o.ly||0,T=o.time||0;
 ctx.save();ctx.globalAlpha=o.alpha??1;
 if(!o.sitting){
  const ao=ctx.createRadialGradient(o.sx,o.sy,0,o.sx,o.sy,S*0.4);ao.addColorStop(0,'rgba(0,0,0,0.55)');ao.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=ao;ctx.beginPath();ctx.ellipse(o.sx,o.sy,S*0.4,S*0.07,0,0,7);ctx.fill();
  for(const s of [-1,1])sneaker(o.sx+s*S*0.16,o.sy,S,s,of==='army'?'#6b7a45':ant);
 }
 ctx.save();ctx.translate(o.sx,o.sy-S*0.1);ctx.scale(sxs*(o.pop??1),sys*(o.pop??1));ctx.translate(0,-R*0.96);
 ctx.rotate(lx*0.05);
 const head=of==='hoodie'||of==='community';
 if(head){ctx.lineCap='round';ctx.strokeStyle='#151922';ctx.lineWidth=R*0.15;ctx.beginPath();ctx.moveTo(-R*0.98,-R*0.62);ctx.bezierCurveTo(-R*1.08,-R*1.95,R*0.98,-R*2.0,R*0.98,-R*0.62);ctx.stroke();}
 const work=o.work?Math.sin(T*18+(o.seed||0)):0,wave=o.wave?Math.sin(T*9+(o.seed||0)):0;
 const salute=o.salute;
 const armL=o.wave?-0.15:(o.work?-0.85+work*0.15:0.32);
 const armR=salute?-2.75:(o.wave?-2.55+wave*0.35:(o.work?0.85-work*0.15:-0.32));
 if(o.backlight){const hg0=ctx.createRadialGradient(0,-R*0.8,R*0.4,0,-R*0.8,R*2.4);hg0.addColorStop(0,o.backlight+'30');hg0.addColorStop(1,o.backlight+'00');ctx.fillStyle=hg0;ctx.fillRect(-R*2.6,-R*3.4,R*5.2,R*5);}
 bodyPath(R);
 const g=ctx.createRadialGradient(-R*0.35,-R*1.0,R*0.05,-R*0.05,-R*0.5,R*1.75);
 g.addColorStop(0,'#ffffff');g.addColorStop(0.4,'#f5f6f9');g.addColorStop(0.75,'#d6dae3');g.addColorStop(1,'#a3aab8');
 ctx.save();ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=S*0.1;ctx.shadowOffsetY=S*0.04;ctx.fillStyle=g;ctx.fill();ctx.restore();
 ctx.save();bodyPath(R);ctx.clip();
 if(o.backlight){ctx.save();bodyPath(R);ctx.strokeStyle=o.backlight;ctx.lineWidth=R*0.24;ctx.filter=`blur(${R*0.06}px)`;ctx.globalAlpha=0.5;ctx.stroke();ctx.restore();}
 const tg=ctx.createLinearGradient(-R*0.4,-R*1.4,R*1.1,R*0.2);tg.addColorStop(0,'rgba(60,70,100,0)');tg.addColorStop(0.55,'rgba(60,70,100,0)');tg.addColorStop(1,'rgba(50,60,95,0.38)');
 ctx.fillStyle=tg;ctx.fillRect(-R*2,-R*3,R*4,R*4.5);
 const rim=ctx.createRadialGradient(0,-R*0.5,R*1.0,0,-R*0.5,R*1.9);rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,ant+'2a');ctx.fillStyle=rim;ctx.fillRect(-R*3,-R*3,R*6,R*5);
 ctx.fillStyle='rgba(255,255,255,0.95)';ctx.filter=`blur(${R*0.07}px)`;ctx.beginPath();ctx.ellipse(-R*0.45,-R*1.12,R*0.14,R*0.32,0.42,0,7);ctx.fill();ctx.filter='none';
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-R*0.5,-R*1.3,R*0.04,R*0.07,0.4,0,7);ctx.fill();
 for(const [bx,byy] of [[-0.52,-0.4],[0.5,-0.52]]){const cx=(bx+lx*0.3)*R,cy=(byy+ly*0.2)*R;const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.2);bg.addColorStop(0,'rgba(255,120,150,0.45)');bg.addColorStop(1,'rgba(255,120,150,0)');ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(cx,cy,R*0.22,R*0.14,0,0,7);ctx.fill();}
 const cs=ctx.createLinearGradient(0,-R*0.38,0,-R*0.1);cs.addColorStop(0,'rgba(30,35,55,0)');cs.addColorStop(1,'rgba(30,35,55,0.35)');ctx.fillStyle=cs;ctx.fillRect(-R*1.2,-R*0.38,R*2.4,R*0.3);
 ctx.restore();
 // garment
 const collar=(c)=>{c.moveTo(-R*1.3,-R*0.08);c.quadraticCurveTo(0,R*0.16,R*1.3,-R*0.08);};
 ctx.save();ctx.beginPath();collar(ctx);ctx.lineTo(R*1.3,R*1.4);ctx.lineTo(-R*1.3,R*1.4);ctx.closePath();ctx.clip();
 ctx.save();ctx.translate(0,-R*0.1);ctx.scale(1.055,1.03);ctx.translate(0,R*0.1);bodyPath(R);ctx.restore();
 const hg=ctx.createRadialGradient(-R*0.4,-R*0.05,R*0.1,0,R*0.3,R*1.25);hg.addColorStop(0,pal.g[0]);hg.addColorStop(0.55,pal.g[1]);hg.addColorStop(1,pal.g[2]);
 ctx.fillStyle=hg;ctx.fill();ctx.save();ctx.clip();garmentDetails(R,of,ant,T);
 const sh=ctx.createRadialGradient(-R*0.4,0,R*0.3,0,R*0.3,R*1.3);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,0.35)');ctx.fillStyle=sh;ctx.fillRect(-R*1.4,-R*0.2,R*2.8,R*1.6);
 ctx.restore();ctx.restore();
 // collar
 ctx.save();ctx.lineCap='round';
 const ccol=of==='dev'?['#5cc08f','#123d29']:of==='captain'?['#465c99','#0a1430']:of==='hoodie'?['#5a6379','#1c2029']:of==='trench'?['#e6c891','#8c6a3e']:of==='army'?['#7f8e55','#3a4224']:of==='artist'?['#ffffff','#b9c1d3']:['#4a4f63','#121318'];
 const cg=ctx.createLinearGradient(0,-R*0.2,0,R*0.2);cg.addColorStop(0,ccol[0]);cg.addColorStop(1,ccol[1]);
 ctx.strokeStyle=cg;ctx.lineWidth=R*(of==='hoodie'?0.2:0.11);ctx.translate(0,R*0.02);ctx.scale(0.86,1);ctx.beginPath();collar(ctx);ctx.stroke();
 ctx.restore();
 if(of==='trench'){ctx.fillStyle='#c9a36a';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*R*0.95,-R*0.05);ctx.lineTo(s*R*0.55,-R*0.42);ctx.lineTo(s*R*0.35,R*0.08);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(60,40,15,0.5)';ctx.lineWidth=R*0.02;ctx.stroke();}}
 if(of==='army'){ctx.strokeStyle='#c8ccd4';ctx.lineWidth=R*0.015;ctx.beginPath();ctx.moveTo(-R*0.3,R*0.0);ctx.lineTo(0,R*0.3);ctx.lineTo(R*0.3,R*0.0);ctx.stroke();ctx.fillStyle='#d9dde5';rr(ctx,-R*0.06,R*0.28,R*0.12,R*0.17,R*0.03);ctx.fill();ctx.fillStyle='#aab0bc';rr(ctx,-R*0.01,R*0.3,R*0.12,R*0.17,R*0.03);ctx.fill();}
 if(of==='hoodie'||of==='community'){for(const s of [-1,1]){const sx=s*R*0.17,sw=Math.sin(T*4+s)*R*0.03;ctx.strokeStyle='#eef1f6';ctx.lineWidth=R*0.04;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,R*0.1);ctx.quadraticCurveTo(sx+s*R*0.03+sw,R*0.3,sx+sw*0.6,R*0.48);ctx.stroke();ctx.fillStyle=ant;rr(ctx,sx+sw*0.6-R*0.035,R*0.46,R*0.07,R*0.11,R*0.03);ctx.fill();}}
 // curl-tip orb (if visible)
 let tipL=[-R*0.84,-R*2.06];
 if(of==='hoodie'||of==='suit'||of==='community'||of==='qa'){
  ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.6;ctx.fillStyle=ant;ctx.beginPath();ctx.arc(tipL[0],tipL[1],R*0.11,0,7);ctx.fill();ctx.restore();
  const og=ctx.createRadialGradient(tipL[0]-R*0.04,tipL[1]-R*0.04,0,tipL[0],tipL[1],R*0.11);og.addColorStop(0,'rgba(255,255,255,0.95)');og.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=og;ctx.beginPath();ctx.arc(tipL[0],tipL[1],R*0.11,0,7);ctx.fill();
 }
 // eyes
 const bl=o.blink||1,ew=R*0.2,el=R*0.48*bl,spread=1-Math.abs(lx)*0.15;
 eyePill((-0.3*spread+lx*0.3)*R,(-0.72+ly*0.22)*R,ew,el,-0.35);
 eyePill((0.27*spread+lx*0.3)*R,(-0.84+ly*0.22)*R,ew,el,-0.35);
 const ht=drawHat(R,of,ant,T);if(ht)tipL=ht;
 if(head){
  for(const s of [-1,1]){const cx=s*R*0.99,cy=-R*0.64;const eg=ctx.createRadialGradient(cx-R*0.06,cy-R*0.08,R*0.02,cx,cy,R*0.26);eg.addColorStop(0,'#4a5266');eg.addColorStop(1,'#0e1117');
   ctx.fillStyle=eg;ctx.beginPath();ctx.ellipse(cx+s*R*0.03,cy,R*0.17,R*0.25,0,0,7);ctx.fill();
   ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.strokeStyle=ant;ctx.lineWidth=R*0.045;ctx.beginPath();ctx.ellipse(cx+s*R*0.05,cy,R*0.085,R*0.14,0,0,7);ctx.stroke();ctx.restore();}
  ctx.strokeStyle='#151922';ctx.lineWidth=R*0.055;ctx.beginPath();ctx.moveTo(R*0.98,-R*0.5);ctx.bezierCurveTo(R*0.95,-R*0.2,R*0.7,-R*0.16,R*0.46,-R*0.24);ctx.stroke();
  ctx.save();ctx.shadowColor=ant;ctx.shadowBlur=R*0.3;ctx.fillStyle=ant;ctx.beginPath();ctx.arc(R*0.4,-R*0.25,R*0.05,0,7);ctx.fill();ctx.restore();
 }
 armO(-R*0.9,-R*0.02,armL,R*0.95,R*0.32,pal);
 armO(R*0.9,-R*0.02,armR,R*0.95,R*0.32,pal);
 const m=ctx.getTransform();const tp=m.transformPoint(new DOMPoint(tipL[0],tipL[1]));const top=m.transformPoint(new DOMPoint(0,-R*2.45));
 ctx.restore();ctx.restore();
 return {tipX:tp.x,tipY:tp.y,top:top.y};
}
