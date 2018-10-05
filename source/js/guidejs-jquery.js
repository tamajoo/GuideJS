(function ($) {

    $.widget("ui.guide", {

        version: "1",
        options: {
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
            delay: 300,
        },

        regional: {
            default: {
                next: "Next",
                prev: "Back",
                pause: "Pause",
                close: "Close",
                continue: "Continue",
            }
        },

        $overlay: null,
        $ghost: null,
        $btnWrap: null,
        $nextBtn: null,
        $prevBtn: null,
        $stepElem: null,
        $textElem: null,
       
        step: 0,

        _destroy: function () {
            var that = this;
            that._clear();
            that.$overlay.remove();
            that.options = null;
        },

        _create: function () {
            
        },

        _init: function () {

            this.options = $.extend(true, this.options, this.element.data());

            this._setLocale();

            this._initOverlay();
            this._initButtons();

            this._on($(document), {
                'keyup': function(event) {
                    switch(event.which) {
                        case 27: this.stop(); break;
                        case 13: this.next(); break;
                    }
                },
            });

            if(this.options.autostart) {
                this.start();
            }
            
        },

        _isDefined: function(something) {
            return typeof something != 'undefined';
        },

        _getText: function(key) {
            if(this._isDefined(this.regional[this.locale]) && this._isDefined(this.regional[this.locale][key])) {
                return this.regional[this.locale][key];
            } else {
                return this.regional.default[key];
            }
        },

        _setLocale: function() {
            if(!this.options.locale) {
                var htmlLang = $(document).attr("lang");
                if(this._isDefined(htmlLang)) {
                    this.options.locale = htmlLang;
                }
            }
        },

        _initOverlay: function() {
            this.$overlay = $('<div class="gjs-ov">');
            this._on(this.$overlay, {"click": this.stop});
            this.element.append(this.$overlay);
            
            this.$ghost = $('<div class="gjs-ghost">');
            this.$overlay.append(this.$ghost);
        },

        _initButtons: function() {
            this.$nextBtn = $('<button class="gjs-btn gjs-btn-n ' + this.options.classes.nextBtn + '">' + this._getText("next") + '</button>');
            this.$prevBtn = $('<button class="gjs-btn gjs-btn-p ' + this.options.classes.prevBtn + '">' + this._getText("prev") + '</button>');
            this._on(this.$nextBtn, {"click": this.next});
            this._on(this.$prevBtn, {"click": this.prev});

            this.$btnWrap = $('<div class="' + this.options.classes.btnContainer + ' gjs-btns">');
            this.$btnWrap.append(this.$prevBtn, this.$nextBtn);
        },

        _showOverlay: function() {
            this.$overlay.addClass("gjs-open");
        },

        _hideOverlay: function() {
            this.$overlay.removeClass("gjs-open");
        },

        _detachButtons: function() {
            this.$btnWrap.detach();
        },

        _clear: function() {
            if(this.$textElem) {
                this.$textElem.remove();
                this.$textElem = null;
            }
            this._detachButtons();
            this.element.find('.gjs-foc > [data-guidejs]').unwrap();
        },

        _wrapElem: function() {

            var $wrap = $('<div class="gjs-foc ' + this.options.classes.focusContainer + '"></div>');

            if(this.$stepElem.is("[data-guidejs-outline]")) {
                $wrap.addClass("gjs-ol");
            }

            if(this.$stepElem.data("guidejs-background")) {
                $wrap.css({
                    backgroundColor: this.$stepElem.data("guidejs-background"),
                    outlineColor: this.$stepElem.data("guidejs-background"),
                });
            }

            this.$stepElem.wrap($wrap);             

            this._showButtons();
            this._showText();

        },

        _showStep: function() {

            this._clear();

            this.$stepElem = this.element.find('[data-guidejs="' + this.step + '"]').first();
            
            if(!this.$stepElem.length) {
                return this.stop();
            }

            this._updateGhost();
            
            var that = this
            setTimeout(function() {
                that._wrapElem();
            }, this.options.delay);   

        },

        _updateGhost: function() {

            var css = this.$stepElem.offset(),
                scrollTop = $(window).scrollTop();

            css.top = css.top - scrollTop;
            css.width = this.$stepElem.width();
            css.height = this.$stepElem.height();

            this.$ghost.css(css);

        },

        _showButtons: function() {

            $wrap = this.$stepElem.parent();
            $wrap.append(this.$btnWrap);

        },

        _showText: function() {
           
            $wrap = this.$stepElem.parent();
            if(this.$stepElem.data("guidejs-text")) {
                this.$textElem = $('<div class="gjs-txt ' + this.options.classes.stepText + '"></div>');
                this.$textElem.html(this.$stepElem.data("guidejs-text"));
                $wrap.append(this.$textElem);
            }

        },

        _prevent: function(event) {
            if(this._isDefined(event) && typeof event.preventDefault === "function") {
                event.preventDefault();
            }
        },

        start: function (event) {
            this._prevent(event);
            this.step = 0;
            this.next();
            this._showOverlay();
        },

        stop: function (event) {
            this._prevent(event);
            this._clear();
            this._hideOverlay();
        },

        continue: function (event) {
            this._prevent(event);
            this._showOverlay();
        },

        next: function (event) {
            this._prevent(event);
            this.step++;
            this._showStep();            
        },

        prev: function (event) {
            this._prevent(event);
            this.step--;
            this._showStep();            
        }

    });

})(jQuery);