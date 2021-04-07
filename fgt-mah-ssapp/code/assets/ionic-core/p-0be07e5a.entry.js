import{r as o,e as i,h as e,H as t,i as r}from"./p-3df3e749.js";import{b as p}from"./p-125156f2.js";import{a as s,d as n}from"./p-8a0d5290.js";import{B as a,e as c,d,f as v,g as h}from"./p-ca7c704e.js";import{g as l}from"./p-11181cdf.js";import{e as m}from"./p-d3682733.js";import{c as x}from"./p-613c0939.js";import"./p-f4d641a6.js";import"./p-94c70170.js";const b=(o,i)=>{let e="top",t="left";const r=o.querySelector(".popover-content"),p=r.getBoundingClientRect(),s=p.width,n=p.height,a=o.ownerDocument.defaultView.innerWidth,c=o.ownerDocument.defaultView.innerHeight,d=i&&i.target&&i.target.getBoundingClientRect(),v=null!=d&&"top"in d?d.top:c/2-n/2,h=null!=d&&"left"in d?d.left:a/2,l=d&&d.width||0,m=d&&d.height||0,b=o.querySelector(".popover-arrow"),w=b.getBoundingClientRect(),u=w.width,g=w.height;null==d&&(b.style.display="none");const k={top:v+m,left:h+l/2-u/2},y={top:v+m+(g-1),left:h+l/2-s/2};let D=!1,P=!1;y.left<f+25?(D=!0,y.left=f):s+f+y.left+25>a&&(P=!0,y.left=a-s-f,t="right"),v+m+n>c&&v-n>0?(k.top=v-(g+1),y.top=v-n-(g-1),o.className=o.className+" popover-bottom",e="bottom"):v+m+n>c&&(r.style.bottom=f+"%"),b.style.top=k.top+"px",b.style.left=k.left+"px",r.style.top=y.top+"px",r.style.left=y.left+"px",D&&(r.style.left=`calc(${y.left}px + var(--ion-safe-area-left, 0px))`),P&&(r.style.left=`calc(${y.left}px - var(--ion-safe-area-right, 0px))`),r.style.transformOrigin=e+" "+t;const j=x(),W=x(),z=x();return W.addElement(o.querySelector("ion-backdrop")).fromTo("opacity",.01,"var(--backdrop-opacity)").beforeStyles({"pointer-events":"none"}).afterClearStyles(["pointer-events"]),z.addElement(o.querySelector(".popover-wrapper")).fromTo("opacity",.01,1),j.addElement(o).easing("ease").duration(100).addAnimation([W,z])},f=5,w=o=>{const i=x(),e=x(),t=x();return e.addElement(o.querySelector("ion-backdrop")).fromTo("opacity","var(--backdrop-opacity)",0),t.addElement(o.querySelector(".popover-wrapper")).fromTo("opacity",.99,0),i.addElement(o).easing("ease").duration(500).addAnimation([e,t])},u=(o,i)=>{const e=o.ownerDocument,t="rtl"===e.dir;let r="top",p=t?"right":"left";const s=o.querySelector(".popover-content"),n=s.getBoundingClientRect(),a=n.width,c=n.height,d=e.defaultView.innerWidth,v=e.defaultView.innerHeight,h=i&&i.target&&i.target.getBoundingClientRect(),l=null!=h&&"bottom"in h?h.bottom:v/2-c/2,m=h&&h.height||0,b={top:l,left:null!=h&&"left"in h?t?h.left-a+h.width:h.left:d/2-a/2};b.left<12?(b.left=12,p="left"):a+12+b.left>d&&(b.left=d-a-12,p="right"),l+m+c>v&&l-c>0?(b.top=l-c-m,o.className=o.className+" popover-bottom",r="bottom"):l+m+c>v&&(s.style.bottom="12px");const f=x(),w=x(),u=x(),g=x(),k=x();return w.addElement(o.querySelector("ion-backdrop")).fromTo("opacity",.01,"var(--backdrop-opacity)").beforeStyles({"pointer-events":"none"}).afterClearStyles(["pointer-events"]),u.addElement(o.querySelector(".popover-wrapper")).fromTo("opacity",.01,1),g.addElement(s).beforeStyles({top:`${b.top}px`,left:`${b.left}px`,"transform-origin":`${r} ${p}`}).fromTo("transform","scale(0.001)","scale(1)"),k.addElement(o.querySelector(".popover-viewport")).fromTo("opacity",.01,1),f.addElement(o).easing("cubic-bezier(0.36,0.66,0.04,1)").duration(300).addAnimation([w,u,g,k])},g=o=>{const i=x(),e=x(),t=x();return e.addElement(o.querySelector("ion-backdrop")).fromTo("opacity","var(--backdrop-opacity)",0),t.addElement(o.querySelector(".popover-wrapper")).fromTo("opacity",.99,0),i.addElement(o).easing("ease").duration(500).addAnimation([e,t])},k=class{constructor(e){o(this,e),this.didPresent=i(this,"ionPopoverDidPresent",7),this.willPresent=i(this,"ionPopoverWillPresent",7),this.willDismiss=i(this,"ionPopoverWillDismiss",7),this.didDismiss=i(this,"ionPopoverDidDismiss",7),this.presented=!1,this.keyboardClose=!0,this.backdropDismiss=!0,this.showBackdrop=!0,this.translucent=!1,this.animated=!0,this.onDismiss=o=>{o.stopPropagation(),o.preventDefault(),this.dismiss()},this.onBackdropTap=()=>{this.dismiss(void 0,a)},this.onLifecycle=o=>{const i=this.usersElement,e=y[o.type];if(i&&e){const t=new CustomEvent(e,{bubbles:!1,cancelable:!1,detail:o.detail});i.dispatchEvent(t)}}}connectedCallback(){c(this.el)}async present(){if(this.presented)return;const o=this.el.querySelector(".popover-content");if(!o)throw new Error("container is undefined");const i=Object.assign(Object.assign({},this.componentProps),{popover:this.el});return this.usersElement=await s(this.delegate,o,this.component,["popover-viewport",this.el["s-sc"]],i),await m(this.usersElement),d(this,"popoverEnter",b,u,this.event)}async dismiss(o,i){const e=await v(this,o,i,"popoverLeave",w,g,this.event);return e&&await n(this.delegate,this.usersElement),e}onDidDismiss(){return h(this.el,"ionPopoverDidDismiss")}onWillDismiss(){return h(this.el,"ionPopoverWillDismiss")}render(){const o=p(this),{onLifecycle:i}=this;return e(t,{"aria-modal":"true","no-router":!0,tabindex:"-1",style:{zIndex:`${2e4+this.overlayIndex}`},class:Object.assign(Object.assign({},l(this.cssClass)),{[o]:!0,"popover-translucent":this.translucent}),onIonPopoverDidPresent:i,onIonPopoverWillPresent:i,onIonPopoverWillDismiss:i,onIonPopoverDidDismiss:i,onIonDismiss:this.onDismiss,onIonBackdropTap:this.onBackdropTap},e("ion-backdrop",{tappable:this.backdropDismiss,visible:this.showBackdrop}),e("div",{tabindex:"0"}),e("div",{class:"popover-wrapper ion-overlay-wrapper"},e("div",{class:"popover-arrow"}),e("div",{class:"popover-content"})),e("div",{tabindex:"0"}))}get el(){return r(this)}},y={ionPopoverDidPresent:"ionViewDidEnter",ionPopoverWillPresent:"ionViewWillEnter",ionPopoverWillDismiss:"ionViewWillLeave",ionPopoverDidDismiss:"ionViewDidLeave"};k.style={ios:'.sc-ion-popover-ios-h{--background:var(--ion-background-color, #fff);--min-width:0;--min-height:0;--max-width:auto;--height:auto;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:fixed;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;color:var(--ion-text-color, #000);z-index:1001}.overlay-hidden.sc-ion-popover-ios-h{display:none}.popover-wrapper.sc-ion-popover-ios{opacity:0;z-index:10}.popover-content.sc-ion-popover-ios{display:-ms-flexbox;display:flex;position:absolute;-ms-flex-direction:column;flex-direction:column;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);overflow:auto;z-index:10}.popover-viewport.sc-ion-popover-ios{--ion-safe-area-top:0px;--ion-safe-area-right:0px;--ion-safe-area-bottom:0px;--ion-safe-area-left:0px}.sc-ion-popover-ios-h{--width:200px;--max-height:90%;--box-shadow:none;--backdrop-opacity:var(--ion-backdrop-opacity, 0.08)}.popover-content.sc-ion-popover-ios{border-radius:10px}.popover-arrow.sc-ion-popover-ios{display:block;position:absolute;width:20px;height:10px;overflow:hidden}.popover-arrow.sc-ion-popover-ios::after{left:3px;top:3px;border-radius:3px;position:absolute;width:14px;height:14px;-webkit-transform:rotate(45deg);transform:rotate(45deg);background:var(--background);content:"";z-index:10}[dir=rtl].sc-ion-popover-ios .popover-arrow.sc-ion-popover-ios::after,[dir=rtl].sc-ion-popover-ios-h .popover-arrow.sc-ion-popover-ios::after,[dir=rtl] .sc-ion-popover-ios-h .popover-arrow.sc-ion-popover-ios::after{left:unset;right:unset;right:3px}.popover-bottom.sc-ion-popover-ios-h .popover-arrow.sc-ion-popover-ios{top:auto;bottom:-10px}.popover-bottom.sc-ion-popover-ios-h .popover-arrow.sc-ion-popover-ios::after{top:-6px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.popover-translucent.sc-ion-popover-ios-h .popover-content.sc-ion-popover-ios,.popover-translucent.sc-ion-popover-ios-h .popover-arrow.sc-ion-popover-ios::after{background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}}',md:".sc-ion-popover-md-h{--background:var(--ion-background-color, #fff);--min-width:0;--min-height:0;--max-width:auto;--height:auto;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:fixed;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;color:var(--ion-text-color, #000);z-index:1001}.overlay-hidden.sc-ion-popover-md-h{display:none}.popover-wrapper.sc-ion-popover-md{opacity:0;z-index:10}.popover-content.sc-ion-popover-md{display:-ms-flexbox;display:flex;position:absolute;-ms-flex-direction:column;flex-direction:column;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);overflow:auto;z-index:10}.popover-viewport.sc-ion-popover-md{--ion-safe-area-top:0px;--ion-safe-area-right:0px;--ion-safe-area-bottom:0px;--ion-safe-area-left:0px}.sc-ion-popover-md-h{--width:250px;--max-height:90%;--box-shadow:0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);--backdrop-opacity:var(--ion-backdrop-opacity, 0.32)}.popover-content.sc-ion-popover-md{border-radius:4px;-webkit-transform-origin:left top;transform-origin:left top}[dir=rtl].sc-ion-popover-md .popover-content.sc-ion-popover-md,[dir=rtl].sc-ion-popover-md-h .popover-content.sc-ion-popover-md,[dir=rtl] .sc-ion-popover-md-h .popover-content.sc-ion-popover-md{-webkit-transform-origin:right top;transform-origin:right top}.popover-viewport.sc-ion-popover-md{-webkit-transition-delay:100ms;transition-delay:100ms}"};export{k as ion_popover}