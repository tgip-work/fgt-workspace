import{b as t}from "./p-ed62be1c.js";import{c as n}from "./p-f4d641a6.js";import{c as r}from "./p-613c0939.js";import{MENU_BACK_BUTTON_PRIORITY as a}from "./p-94c70170.js";const e= t=>r().duration(t?400:300),s= n=>{let a,s;const o=n.width+8,i=r(),c=r();n.isEndSide?(a=o+"px",s="0px"):(a=-o+"px",s="0px"),i.addElement(n.menuInnerEl).fromTo("transform",`translateX(${a})`,`translateX(${s})`);const p="ios"===t(n),u=p?.2:.25;return c.addElement(n.backdropEl).fromTo("opacity",.01,u),e(p).addAnimation([i,c])},o= n=>{let a,s;const o=t(n),i=n.width;n.isEndSide?(a=-i+"px",s=i+"px"):(a=i+"px",s=-i+"px");const c=r().addElement(n.menuInnerEl).fromTo("transform",`translateX(${s})`,"translateX(0px)"),p=r().addElement(n.contentEl).fromTo("transform","translateX(0px)",`translateX(${a})`),u=r().addElement(n.backdropEl).fromTo("opacity",.01,.32);return e("ios"===o).addAnimation([c,p,u])},i= n=>{const a=t(n),s=n.width*(n.isEndSide?-1:1)+"px",o=r().addElement(n.contentEl).fromTo("transform","translateX(0px)",`translateX(${s})`);return e("ios"===a).addAnimation(o)},c=(()=>{const t=new Map,r=[],e=async t=>{if(await f(),"start"===t||"end"===t){return w((n=>n.side===t&&!n.disabled))||w((n=>n.side===t))}if(null!=t)return w((n=>n.menuId===t));return w((t=>!t.disabled))||(r.length>0?r[0].el:void 0)},c=async()=>(await f(),m()),p=(n, r)=>{t.set(n,r)},u= t=>{const n=t.side;r.filter((r=>r.side===n&&r!==t)).forEach((t=>t.disabled=!0))},m=()=>w((t=>t._isOpen)),l=()=>r.some((t=>t.isAnimating)),w= t=>{const n=r.find(t);if(void 0!==n)return n.el},f=()=>Promise.all(Array.from(document.querySelectorAll("ion-menu")).map((t=>new Promise((r=>n(t,r))))));return p("reveal",i),p("push",o),p("overlay",s),"undefined"!=typeof document&&document.addEventListener("ionBackButton",(t=>{const n=m();n&&t.detail.register(a,(()=>n.close()))})),{registerAnimation:p,get:e,getMenus:async()=>(await f(),r.map((t=>t.el))),getOpen:c,isEnabled:async t=>{const n=await e(t);return!!n&&!n.disabled},swipeGesture:async(t, n)=>{const r=await e(n);return r&&(r.swipeGesture=t),r},isAnimating:async()=>(await f(),l()),isOpen:async t=>{if(null!=t){const n=await e(t);return void 0!==n&&n.isOpen()}return void 0!==await c()},enable:async(t, n)=>{const r=await e(n);return r&&(r.disabled=!t),r},toggle:async t=>{const n=await e(t);return!!n&&n.toggle()},close:async t=>{const n=await(void 0!==t?e(t):c());return void 0!==n&&n.close()},open:async t=>{const n=await e(t);return!!n&&n.open()},_getOpenSync:m,_createAnimation:(n, r)=>{const a=t.get(n);if(!a)throw new Error("animation not registered");return a(r)},_register: t=>{r.indexOf(t)<0&&(t.disabled||u(t),r.push(t))},_unregister: t=>{const n=r.indexOf(t);n>-1&&r.splice(n,1)},_setOpen:async(t, n, r)=>{if(l())return!1;if(n){const n=await c();n&&t.el!==n&&await n.setOpen(!1,!1)}return t._setOpen(n,r)},_setActiveMenu:u}})();export{c as m}