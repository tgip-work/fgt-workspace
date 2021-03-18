var sanitizeDOMString=function(e){try{if(e instanceof IonicSafeString){return e.value}if(!isSanitizerEnabled()||typeof e!=="string"||e===""){return e}var r=document.createDocumentFragment();var n=document.createElement("div");r.appendChild(n);n.innerHTML=e;blockedTags.forEach((function(e){var n=r.querySelectorAll(e);for(var t=n.length-1;t>=0;t--){var i=n[t];if(i.parentNode){i.parentNode.removeChild(i)}else{r.removeChild(i)}var a=getElementChildren(i);for(var l=0;l<a.length;l++){sanitizeElement(a[l])}}}));var t=getElementChildren(r);for(var i=0;i<t.length;i++){sanitizeElement(t[i])}var a=document.createElement("div");a.appendChild(r);var l=a.querySelector("div");return l!==null?l.innerHTML:a.innerHTML}catch(o){console.error(o);return""}};var sanitizeElement=function(e){if(e.nodeType&&e.nodeType!==1){return}for(var r=e.attributes.length-1;r>=0;r--){var n=e.attributes.item(r);var t=n.name;if(!allowedAttributes.includes(t.toLowerCase())){e.removeAttribute(t);continue}var i=n.value;if(i!=null&&i.toLowerCase().includes("javascript:")){e.removeAttribute(t)}}var a=getElementChildren(e);for(var r=0;r<a.length;r++){sanitizeElement(a[r])}};var getElementChildren=function(e){return e.children!=null?e.children:e.childNodes};var isSanitizerEnabled=function(){var e=window;var r=e&&e.Ionic&&e.Ionic.config;if(r){if(r.get){return r.get("sanitizerEnabled",true)}else{return r.sanitizerEnabled===true||r.sanitizerEnabled===undefined}}return true};var allowedAttributes=["class","id","href","src","name","slot"];var blockedTags=["script","style","iframe","meta","link","object","embed"];var IonicSafeString=function(){function e(e){this.value=e}return e}();export{IonicSafeString as I,sanitizeDOMString as s};