'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var LemNav = function () {
        function LemNav(element, options) {
            _classCallCheck(this, LemNav);

            var self = this;

            self.nav = {};

            self.nav.dropdowns = [];

            self.nav.navbar_open = false;

            self.$navbar = $(element);

            self.settings = $.extend({
                navbar_toggle: '.lem-navbar-toggle',
                collapse_duration: 0.2,
                trigger: 'click',
                trigger_linked: false,
                extra_trigger_button: "<button class='extra-trigger'>+</button>",
                navbar_collapse_duration: 0.5,
                on_dropdown_shown: function on_dropdown_shown() {},
                on_dropdown_hide: function on_dropdown_hide() {}

            }, options);

            self.init();
        }

        _createClass(LemNav, [{
            key: 'init',
            value: function init() {
                var self = this;

                self.$navbar.find('.menu-item-has-children').each(function () {
                    var $this = $(this);

                    self.nav.dropdowns.push({
                        nav_item: $this,
                        trigger: $this.find('a'),
                        menu: $this.find('>.sub-menu'),
                        menu_items: $this.find('>.sub-menu >li'),
                        open: false
                    });
                });

                self.nav.dropdowns.forEach(function (dropdown) {

                    dropdown.menu_items_tl = new TimelineMax({
                        paused: true
                    });
                });

                if (self.settings.trigger_linked) {
                    self.extra_trigger();
                }

                if (self.settings.trigger == 'click') {
                    $(window).click(function () {
                        self.close_all();
                    });
                    self.nav.dropdowns.forEach(function (dropdown) {
                        dropdown.trigger.on('click', function (event) {
                            event.stopPropagation();
                            if (dropdown.open) {
                                self.close({
                                    dropdown: dropdown
                                });
                            } else {
                                self.close_all();
                                self.open({
                                    dropdown: dropdown
                                });
                            }
                        });
                    });
                } else if (self.settings.trigger == 'hover' && !self.is_touch_device) {
                    self.nav.dropdowns.forEach(function (dropdown) {
                        dropdown.trigger.hover(function () {
                            self.open({
                                dropdown: dropdown
                            });
                        }, function () {
                            self.close({
                                dropdown: dropdown
                            });
                        });
                    });
                }

                self.navbar_collapse();
            }
        }, {
            key: 'close_all',
            value: function close_all() {

                var self = this;

                self.nav.dropdowns.forEach(function (dropdown) {
                    if (dropdown.open) {
                        self.close({
                            dropdown: dropdown
                        });
                    }
                });
            }
        }, {
            key: 'navbar_collapse',
            value: function navbar_collapse() {
                var self = this;

                self.nav.navbar_trigger = $(self.settings.navbar_toggle);

                self.nav.navbar_trigger.on('click', function () {
                    if (self.nav.navbar_open) {
                        TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, { height: 0 });

                        self.nav.navbar_open = false;
                        self.nav.navbar_trigger.removeClass('open');
                    } else {
                        TweenLite.set(self.$navbar, { height: "auto" });
                        TweenLite.from(self.$navbar, self.settings.navbar_collapse_duration, { height: 0 });

                        self.nav.navbar_open = true;
                        self.nav.navbar_trigger.addClass('open');
                    }
                });
            }
        }, {
            key: 'extra_trigger',
            value: function extra_trigger() {
                var self = this;

                self.nav.dropdowns.forEach(function (dropdown) {

                    var $button = $(self.settings.extra_trigger_button);

                    dropdown.nav_item.append($button);

                    $button.on('click', function () {

                        if (dropdown.open) {
                            self.close({
                                dropdown: dropdown
                            });
                        } else {
                            self.open({
                                dropdown: dropdown
                            });
                        }
                    });
                });
            }
        }, {
            key: 'open',
            value: function open(options) {
                var self = this;
                var dropdown = options.dropdown;
                var current_menu_height = dropdown.menu.outerHeight();

                TweenLite.set(dropdown.menu, { height: "auto" });
                TweenLite.from(dropdown.menu, self.settings.collapse_duration, {
                    height: current_menu_height,
                    onComplete: dropdown_shown
                });

                dropdown.open = true;
                dropdown.nav_item.addClass('open');

                function dropdown_shown() {
                    self.settings.on_dropdown_shown();
                }
            }
        }, {
            key: 'close',
            value: function close(options) {
                var self = this;
                var dropdown = options.dropdown;

                self.settings.on_dropdown_hide();

                TweenLite.to(dropdown.menu, self.settings.collapse_duration, { height: 0 });

                dropdown.open = false;
                dropdown.nav_item.removeClass('open');
            }
        }, {
            key: 'is_touch_device',
            value: function is_touch_device() {
                return 'ontouchstart' in window || navigator.maxTouchPoints;
            }
        }]);

        return LemNav;
    }();

    $.fn.lemNav = function () {
        var $this = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            length = $this.length,
            i = void 0,
            ret = void 0;
        for (i = 0; i < length; i++) {
            if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined') $this[i].lem_nav = new LemNav($this[i], opt);else ret = $this[i].lem_nav[opt].apply($this[i].lem_nav, args);
            if (typeof ret != 'undefined') return ret;
        }
        return $this;
    };
});