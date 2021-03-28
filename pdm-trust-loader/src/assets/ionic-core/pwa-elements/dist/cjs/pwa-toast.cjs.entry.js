'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('./core-f4aa8a8b.js');

const PWAToast = class {
    constructor(hostRef) {
        core.registerInstance(this, hostRef);
        this.duration = 2000;
        this.closing = null;
    }
    hostData() {
        const classes = {
            out: !!this.closing
        };
        if (this.closing !== null) {
            classes['in'] = !this.closing;
        }
        return {
            class: classes
        };
    }
    componentDidLoad() {
        setTimeout(() => {
            this.closing = false;
        });
        setTimeout(() => {
            this.close();
        }, this.duration);
    }
    close() {
        this.closing = true;
        setTimeout(() => {
            this.el.parentNode.removeChild(this.el);
        }, 1000);
    }
    __stencil_render() {
        return (core.h("div", { class: "wrapper" }, core.h("div", { class: "toast" }, this.message)));
    }
    get el() { return core.getElement(this); }
    render() { return core.h(core.Host, this.hostData(), this.__stencil_render()); }
    static get style() { return ":host{position:fixed;bottom:20px;left:0;right:0;display:-ms-flexbox;display:flex;opacity:0}:host(.in){-webkit-transition:opacity .3s;transition:opacity .3s;opacity:1}:host(.out){-webkit-transition:opacity 1s;transition:opacity 1s;opacity:0}.wrapper{-ms-flex:1;flex:1;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.toast{font-family:-apple-system,system-ui,Helvetica Neue,Roboto,sans-serif;background-color:#eee;color:#000;border-radius:5px;padding:10px 15px;font-size:14px;font-weight:500;-webkit-box-shadow:0 1px 2px rgba(0,0,0,.2);box-shadow:0 1px 2px rgba(0,0,0,.2)}"; }
};

exports.pwa_toast = PWAToast;
