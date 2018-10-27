class Guidejs {

    constructor(element = document.body, options = {}, translations = {}) {

        // options
        this.options = {};
        Object.assign(this.options, {
            focusMode: 'self', // self|wrapped
            autostart: false,
            locale: "",
            classes: {
                btnContainer: "",
                nextBtn: "",
                prevBtn: "",
                focusContainer: "",
                infoContainer: "",
                stepText: "",
            },
            delay: null,

            // callbacks
            beforeStart: function() {},
            afterStart: function() {},
            beforeNext: function() {},
            afterNext: function() {},
            beforePrev: function() {},
            afterPrev: function() {},
            beforeShowStep: function() {},
            afterShowStep: function() {},
            beforeStop: function() {},
            afterStop: function() {},
            beforeContinue: function() {},
            afterContinue: function() {},
        }, options, element.dataset);

        // translations
        this.translations = {};
        Object.assign(this.translations, {
            default: {
                next: "Next",
                prev: "Back",
                pause: "Pause",
                close: "Close",
                continue: "Continue",
            }
        }, translations);

        // dom elements
        this.elements = {
            main: element,
        };

        // current step of guide
        this.step = 0;
        this._showStepDelay = 0;

        // trigger initialize event
        this.elements.main.dispatchEvent(this._createEvent("guidejs.initialize"));

        // set locale
        this._setLocale();

        // initialize elements
        this._initOverlay();
        this._initButtons();

        // listen for enter and escape keypress
        document.addEventListener("keyup", (event) => {
            switch(event.which) {
                case 27: this.stop(); break;
                case 13: this.next(); break;
            }
        });

        // trigger initialized event
        this.elements.main.dispatchEvent(this._createEvent("guidejs.initialized"));

        console.log("initialized", this);

        if(this.options.autostart) {
            this.start();
        }

    }

    _createEvent (name) {
        return new CustomEvent(
            name,
            {
                bubbles: true,
                guidejs: this
            }
        );
    }

    _isDefined (value) {
        return typeof value != 'undefined';
    }

    _getText (key) {
        let translations = this.translations[this.options.locale];
        if(this._isDefined(translations) && this._isDefined(translations[key])) {
            return translations[key];
        } else {
            return this.translations.default[key];
        }
    }

    _setLocale () {
        if(!this.options.locale) {
            let htmlLang = document.documentElement.lang;
            if(this._isDefined(htmlLang)) {
                this.options.locale = htmlLang;
            }
        }
    }

    _initOverlay () {
        // create elements
        let overlay = document.createElement("div");
        let ghost = document.createElement("div");
        // add attributes to elements
        overlay.classList.add("gjs-ov");
        ghost.classList.add("gjs-ghost");
        // add elements to the DOM
        document.body.appendChild(overlay);
        overlay.appendChild(ghost);
        // add event listeners
        overlay.addEventListener("click", this.stop, this);
        // set options.delay, if not defined by user
        if(this.options.delay === null) {
            // use ghost's css transition duration as delay
            this.options.delay = parseFloat( window.getComputedStyle(ghost)['transitionDuration'] ) * 1000;
        }
        // remember pointers
        this.elements.overlay = overlay;
        this.elements.ghost = ghost;
    }

    _initButtons () {
        // create elements
        let nextBtn = document.createElement("button");
        let prevBtn = document.createElement("button");
        let btnWrap = document.createElement("div");
        // add attributes to elements
        nextBtn.classList.add.apply(nextBtn.classList, ["gjs-btn", "gjs-btn-n"].concat((this.options.classes.nextBtn || "").split(" ")).filter(Boolean));
        prevBtn.classList.add.apply(prevBtn.classList, ["gjs-btn", "gjs-btn-p"].concat((this.options.classes.prevBtn || "").split(" ")).filter(Boolean));
        btnWrap.classList.add.apply(btnWrap.classList, ["gjs-btns"].concat((this.options.classes.btnContainer || "").split()).filter(Boolean));
        // add button texts
        nextBtn.appendChild(document.createTextNode(this._getText("next")));
        prevBtn.appendChild(document.createTextNode(this._getText("prev")));
        // add event listeners
        nextBtn.addEventListener("click", this.next.bind(this));
        prevBtn.addEventListener("click", this.prev.bind(this));
        // add buttons to container
        btnWrap.appendChild(prevBtn);
        btnWrap.appendChild(nextBtn);
        // remember pointers
        this.elements.nextBtn = nextBtn;
        this.elements.prevBtn = prevBtn;
        this.elements.btnWrap = btnWrap;
    }

    _showOverlay () {
        this.elements.overlay.classList.add("gjs-open");
    }

    _hideOverlay () {
        this.elements.overlay.classList.remove("gjs-open");
    }

    _removeButtons () {
      this.elements.btnWrap.remove();
    }

    _clear () {
        if(this.elements.stepElem && this.elements.focusElem) {
            // remove text elements if exists
            if(this.elements.textElem) {
                this.elements.textElem.remove();
                this.elements.textElem = null;
            }
            // remove buttons from dom
            this._removeButtons();
            // unwrap/unfocus focus element
            let focusElem = this.elements.focusElem;
            if(this.elements.focusElem != this.elements.stepElem) {
                let focusParent = focusElem.parentNode;
                while (focusElem.firstChild) {
                  parent.insertBefore(focusElem.firstChild, focusElem);
                }
                focusElem.remove()
                this.elements.focusElem = null;
            } else {
                focusElem.classList.remove("gjs-foc", "gjs-ol", this.options.classes.focusContainer);
                focusElem.style.backgroundColor = "";
                focusElem.style.outlineColor = "";
            }
        }
    }

    _focusElem () {
        let focusMode = this.elements.stepElem.dataset.guidejsFocusMode || this.options.focusMode;

        switch(focusMode) {
            case "wrapped":
                let wrap = document.createElement("div");
                wrap.classList.add.apply(["gjs-foc"].concat((this.options.classes.focusContainer || "").split(" ")).filter(Boolean));
                // this.elements.stepElem.wrap($wrap);
                // this.$focusElem = this.$stepElem.parent();
                Throw("focusMode 'wrapped' not implemented, yet.");
            break;
            default:
                this.elements.focusElem = this.elements.stepElem;
                this.elements.focusElem.classList.add.apply(this.elements.focusElem.classList, ["gjs-foc"].concat((this.options.classes.focusContainer || "").split(" ")).filter(Boolean));
            break;
        }

        if(this.elements.stepElem.matches("[data-guidejs-outline]")) {
            this.elements.focusElem.classList.add("gjs-ol");
        }

        if(this.elements.stepElem.dataset.guidejsBackground) {
            this.elements.focusElem.style.backgroundColor = this.elements.stepElem.dataset.guidejsBackground;
            this.elements.focusElem.style.outlineColor = this.elements.stepElem.dataset.guidejsBackground;
        }

        this._showButtons();
        this._showText();
    }

    _showStep () {

        var that = this;

        setTimeout(function() {

            // reset delay
            that._showStepDelay = 0;

            if(that.options.beforeShowStep() === false) {
                that.elements.main.removeEventListener("guidejs.step.shown", that.options.afterNext);
                that.elements.main.removeEventListener("guidejs.step.shown", that.options.afterPrev);
                return;
            }

            that._clear();
            that.elements.stepElem = that.elements.main.querySelector('[data-guidejs="' + that.step + '"]');

            if(!that.elements.stepElem) {
                return that.stop();
            }

            that.elements.main.dispatchEvent(that._createEvent("guidejs.step.show"));

            that._updateGhost();

            setTimeout(function() {
                that._focusElem();
                that.elements.main.dispatchEvent(that._createEvent("guidejs.step.shown"));
                that.options.afterShowStep();
            }, that.options.delay);

        }, this._showStepDelay);

    }

    _updateGhost () {
        let computedStyle = window.getComputedStyle(this.elements.stepElem);
        let css = {top: computedStyle.top};
        let scrollTop  = window.pageYOffset || document.documentElement.scrollTop;

        css.top = css.top - scrollTop;
        css.width = this.elements.stepElem.offsetWidth;
        css.height = this.elements.stepElem.offsetHeight;

        Object.apply(this.elements.ghost.css, css);

        let that = this;
        setTimeout(function() {
            that.elements.ghost.classList.remove("gjs-show-ghost");
        }, this.options.delay);
    }

    _showButtons () {
        this.elements.focusElem.appendChild(this.elements.btnWrap);
    }

    _showText () {
        if(this.elements.stepElem.dataset.guidejsText) {
            this.elements.textElem = document.createElement("div");
            this.elements.textElem.classList.add.apply(this.elements.textElem.classList, ["gjs-txt"].concat((this.options.classes.stepText || "").split()).filter(Boolean));
            this.elements.textElem.innerHTML = this.elements.stepElem.dataset.guidejsText;
            this.elements.focusElem.appendChild(this.elements.textElem);
        }
    }

    _checkTextPosition () {

    }

    _prevent (event) {
        if(this._isDefined(event) && typeof event.preventDefault === "function") {
            event.preventDefault();
        }
    }

    start (event) {
        if(this.options.beforeStart() === false) {
            return;
        }

        this._prevent(event);
        this.step = 0;
        this.next();
        this._showOverlay();
    }

    stop (event) {
        if(this.options.beforeStop() === false) {
            return;
        }

        this._prevent(event);
        this._clear();
        this._hideOverlay();

        this.options.afterStop();
    }

    continue (event) {
        if(this.options.beforeContinue() === false) {
            return;
        }

        this._prevent(event);
        this._showOverlay();
        this._showStep();
        this.options.afterContinue();
    }

    next (event) {

        this._prevent(event);

        if(this.options.beforeNext() === false) {
            return;
        }

        // @todo implement single listener
        // this.element.one("guidejs.step.shown", this.options.afterNext);

        this.step++;

        this._showStep();
    }

    prev (event) {
        if(this.options.beforePrev() === false) {
            return;
        }

        // @todo implement single listener
        // this.element.one("guidejs.step.shown", this.options.afterPrev);

        this._prevent(event);
        this.step--;

        this._showStep();
    }

    delayShowStep  (delay) {
        this._showStepDelay = delay;
    }

}
