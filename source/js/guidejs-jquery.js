(function ($) {

    $.widget("ui.guidejs", {

        version: "1",
        options: {
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

            regional: {},

            // Callbacks
            beforeStart: function() {},
            afterStart: function() {},

            beforeNext: function($current, $next) {},
            afterNext: function() {},

            beforePrev: function($current, $prev) {},
            afterPrev: function() {},

            beforeShowStep: function() {},
            afterShowStep: function() {},

            beforeStop: function() {},
            afterStop: function() {},

            beforeContinue: function() {},
            afterContinue: function() {},

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
        $focusElem: null,

        step: -1,
        _showStepDelay: 0,

        _destroy: function () {
            var that = this;
            that._clear();
            that.$overlay.remove();
            that.options = null;
        },

        _create: function () {

        },

        _init: function () {

            this.element.trigger("guidejs.initialize", [this]);

            this.options = $.extend(true, this.options, this.element.data());
            this.regional = $.extend(true, this.regional, this.options.regional);
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

            this.element.trigger("guidejs.initialized", [this]);

            if(this.options.autostart) {
                this.start();
            }

        },

        _isDefined: function(something) {
            return typeof something != 'undefined';
        },

        _getText: function(key) {
            if(this._isDefined(this.regional[this.options.locale]) && this._isDefined(this.regional[this.options.locale][key])) {
                return this.regional[this.options.locale][key];
            } else {
                return this.regional.default[key];
            }
        },

        _setLocale: function() {
            if(!this.options.locale) {
                var htmlLang = $("html").attr("lang");
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

            if(this.options.delay === null) {
                // Use the ghost's css transition duration as delay, if nothing else was defined
				this.$ghost.addClass("gjs-show-ghost");
                this.options.delay = parseFloat( getComputedStyle(this.$ghost.get(0))['transitionDuration'] ) * 1000;
				this.$ghost.removeClass("gjs-show-ghost");
            }
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
            if(this.$stepElem) {

                if(this.$textElem) {
                    this.$textElem.remove();
                    this.$textElem = null;
                }

                this._detachButtons();

                if(this.$focusElem != this.$stepElem) {
                    this.$stepElem.unwrap();
                } else {
                    this.$focusElem
                        .removeClass('gjs-foc gjs-ol ' + this.options.classes.focusContainer)
                        .css({backgroundColor: "", outlineColor: ""});
                }

            }
        },

        _focusElem: function() {

            var focusMode = this.$stepElem.data("guidejs-focus-mode") || this.options.focusMode;

            switch(focusMode) {
                case "wrapped":
                    $wrap = $('<div class="gjs-foc ' + this.options.classes.focusContainer + '"></div>');
                    this.$stepElem.wrap($wrap);
                    this.$focusElem = this.$stepElem.parent();
                break;
                default:
                    this.$focusElem = this.$stepElem;
                    this.$focusElem.addClass('gjs-foc ' + this.options.classes.focusContainer);
                break;
            }

            if(this.$stepElem.is("[data-guidejs-outline]")) {
                this.$focusElem.addClass("gjs-ol");
            }

            if(this.$stepElem.data("guidejs-background")) {
                this.$focusElem.css({
                    backgroundColor: this.$stepElem.data("guidejs-background"),
                    outlineColor: this.$stepElem.data("guidejs-background"),
                });
            }

            this._showButtons();
            this._showText();

        },

        _showStep: function() {

            var that = this;

            setTimeout(function() {

                that._showStepDelay = 0; // Reset the delay if it was changed

                if(that.options.beforeShowStep() === false) {
                    that.element.off("guidejs.step.shown", that.options.afterNext);
                    that.element.off("guidejs.step.shown", that.options.afterPrev);
                    return;
                }

                that._clear();
                that.$stepElem = that.element.find('[data-guidejs="' + that.step + '"]').first();

				console.log(that.$stepElem, that.step); debugger;

                if(!that.$stepElem.length) {
                    return that.stop();
                } else if(!that.$stepElem.is(":visible")) {
					return that.next();
				}

                that.element.trigger("guidejs.step.show", [that, that.$stepElem]);

                that._updateGhost();

                setTimeout(function() {
                    that._focusElem();
                    that.element.trigger("guidejs.step.shown", [that, that.$stepElem]);
                    that.options.afterShowStep();

					// scroll to new step
					$("html, body").stop().animate({scrollTop: ( Math.floor(that.$focusElem.offset().top - ($(window).height() / 2)) ) }, 300);
                }, that.options.delay);

            }, this._showStepDelay);

        },

        _updateGhost: function() {
            var css = this.$stepElem.offset(),
                scrollTop = $(window).scrollTop();

            css.top = css.top - scrollTop;
            css.width = this.$stepElem.outerWidth();
            css.height = this.$stepElem.outerHeight();

            // If user scrolled since last update, make sure ghost position is adjusted accordingly
           if(this._isDefined(this.$ghost.data("lastScrollTop")) && this.$ghost.data("lastScrollTop") != scrollTop) {
                var tmpTop = "+=" + (this.$ghost.data("lastScrollTop") - scrollTop);
                this.$ghost.addClass("gjs-no-anim")
                    .css({ top: tmpTop })
                    .removeClass("gjs-no-anim");
            }

            this.$ghost.data("lastScrollTop", scrollTop).addClass("gjs-show-ghost").removeClass("gjs-ol");
            if(this.$stepElem.is("[data-guidejs-outline]")) {
                this.$ghost.addClass("gjs-ol");
            }

            this.$ghost.css(css);

            var that = this
            setTimeout(function() {
                that.$ghost.removeClass("gjs-show-ghost");
            }, this.options.delay);
        },

        _showButtons: function() {
            this.$focusElem.append(this.$btnWrap);
        },

        _showText: function() {

            if(this.$stepElem.data("guidejs-text")) {
                this.$textElem = $('<div class="gjs-txt ' + this.options.classes.stepText + '"></div>');
                this.$textElem.html(this.$stepElem.data("guidejs-text"));
                this.$focusElem.append(this.$textElem);
            }

            this._checkTextPosition();
        },

        _checkTextPosition: function() {
            this.$textElem.removeClass("gjs-txt-left");
            var textX = this.$textElem.offset().left,
                textW = this.$textElem.outerWidth(),
                containerX = this.element.offset().left,
                containerW = this.element.width();

            if(textX + textW > containerX + containerW) {
                this.$textElem.addClass("gjs-txt-left");
            }
        },

        _prevent: function(event) {
            if(this._isDefined(event) && typeof event.preventDefault === "function") {
                event.preventDefault();
            }
        },

        start: function (event) {

			var ret = this.options.beforeStart();
            if(ret === false) {
                return;
            } else {
				this._showStepDelay = parseInt(ret) || this._showStepDelay;
			}

            this._prevent(event);
            this.step = -1;
            this.next();
            this._showOverlay();

            this.options.afterStart();
        },

        stop: function (event) {

            if(this.options.beforeStop() === false) {
                return;
            }

            this._prevent(event);
            this._clear();
            this._hideOverlay();

            this.options.afterStop();
        },

        continue: function (event) {

            if(this.options.beforeContinue() === false) {
                return;
            }

            this._prevent(event);
            this._showOverlay();
            this._showStep();
            this.options.afterContinue();
        },

        next: function (event) {

			var ret = this.options.beforeNext( this.$stepElem, this.element.find('[data-guidejs="' + (this.step+1) + '"]').first() );
            if(ret === false) {
                return;
            } else {
		        this._showStepDelay = parseInt(ret) || this._showStepDelay;
			}

            this.element.one("guidejs.step.shown", this.options.afterNext);

            this._prevent(event);
            this.step++;

            this._showStep();

        },

        prev: function (event) {

			var ret = this.options.beforePrev( this.$stepElem, this.element.find('[data-guidejs="' + (this.step-1) + '"]').first() );
            if(ret === false) {
                return;
            } else {
		        this._showStepDelay = parseInt(ret) || this._showStepDelay;
			}

            this.element.one("guidejs.step.shown", this.options.afterPrev);

            this._prevent(event);
            this.step--;

            this._showStep();

        },

    });

})(jQuery);
