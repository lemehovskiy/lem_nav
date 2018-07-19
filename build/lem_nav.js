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
                extra_trigger_button: "<button class='extra-trigger'><i class='icon icon-down-open-big'></i></button>",
                navbar_collapse_duration: 0.5,
                navbar_animation: 'shift',
                submenu_animation: 'fade'

            }, options);

            self.init();
        }

        _createClass(LemNav, [{
            key: 'init',
            value: function init() {
                var self = this;

                this.set_dropdowns_data();

                if (self.is_touch_device()) {
                    $('body').addClass('is-touch');
                }

                if (self.settings.trigger == 'click') {
                    self.$navbar.addClass('trigger-click');

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
                                self.close_other_branches(dropdown.branch_id);
                                self.open({
                                    dropdown: dropdown
                                });
                            }
                        });
                    });
                } else if (self.settings.trigger == 'hover' && !self.is_touch_device()) {
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

                if (self.settings.trigger_linked) {
                    self.nav.dropdowns.forEach(function (dropdown) {
                        dropdown.extra_trigger.on('click', function (event) {

                            event.stopPropagation();
                            if (dropdown.open) {

                                self.close({
                                    dropdown: dropdown
                                });
                            } else {

                                self.close_other_branches(dropdown.branch_id);
                                self.open({
                                    dropdown: dropdown
                                });
                            }
                        });
                    });
                }

                self.initNavbarCollapse();
            }
        }, {
            key: 'set_dropdowns_data',
            value: function set_dropdowns_data() {
                var self = this;

                self.$navbar.find('.nav >.menu-item-has-children').each(function (index) {

                    var sub_menu = get_submenu({
                        $nav_item: $(this),
                        menu_lv: 1,
                        branch_id: index
                    });

                    self.nav.dropdowns.push(sub_menu);
                });

                function get_submenu(options) {

                    var nested_submenu = {
                        nav_item: options.$nav_item,
                        trigger: options.$nav_item,
                        menu: options.$nav_item.find('>.sub-menu'),
                        menu_items: options.$nav_item.find('>.sub-menu >li'),
                        menu_lv: options.menu_lv,
                        branch_id: options.branch_id
                    };

                    if (self.settings.trigger_linked) {
                        nested_submenu.extra_trigger = self.extra_trigger(options.$nav_item);
                    }

                    options.$nav_item.find('>.sub-menu >.menu-item-has-children').each(function () {
                        self.nav.dropdowns.push(get_submenu({
                            $nav_item: $(this),
                            menu_lv: options.menu_lv + 1,
                            branch_id: options.branch_id
                        }));
                    });

                    return nested_submenu;
                }
            }
        }, {
            key: 'close_other_branches',
            value: function close_other_branches(current_branch_id) {
                var self = this;

                self.nav.dropdowns.forEach(function (dropdown) {
                    if (dropdown.open && !dropdown.branch_id == current_branch_id) {
                        self.close({
                            dropdown: dropdown
                        });
                    }
                });
            }
        }, {
            key: 'initNavbarCollapse',
            value: function initNavbarCollapse() {
                var self = this;

                self.nav.navbar_trigger = $(self.settings.navbar_toggle);

                self.nav.navbar_trigger.on('click', function () {
                    if (self.nav.navbar_open) {

                        switch (self.settings.navbar_animation) {
                            case 'shift':
                                TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, { autoAlpha: 0, y: 20 });
                                break;

                            case 'collapse':
                                TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, { height: 0 });
                                break;
                        }

                        self.nav.navbar_open = false;
                        self.nav.navbar_trigger.removeClass('open');
                    } else {
                        switch (self.settings.navbar_animation) {
                            case 'shift':
                                TweenLite.fromTo(self.$navbar, self.settings.navbar_collapse_duration, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 });
                                break;

                            case 'collapse':
                                TweenLite.set(self.$navbar, { height: "auto" });
                                TweenLite.from(self.$navbar, self.settings.navbar_collapse_duration, { height: 0 });
                                break;
                        }

                        self.nav.navbar_open = true;
                        self.nav.navbar_trigger.addClass('open');
                    }
                });
            }
        }, {
            key: 'extra_trigger',
            value: function extra_trigger($nav_item) {
                var self = this;

                var $trigger = $(self.settings.extra_trigger_button);

                $nav_item.append($trigger);

                return $trigger;
            }
        }, {
            key: 'open',
            value: function open(options) {
                var self = this;
                var dropdown = options.dropdown;
                var current_menu_height = dropdown.menu.outerHeight();

                switch (self.settings.submenu_animation) {
                    case 'fade':

                        console.log('asdf');
                        break;

                    case 'collapse':
                        TweenLite.set(dropdown.menu, { height: "auto" });
                        TweenLite.from(dropdown.menu, self.settings.collapse_duration, {
                            height: current_menu_height,
                            onComplete: dropdown_shown
                        });
                        break;
                }

                dropdown.menu.trigger('show.lnav');

                dropdown.open = true;
                dropdown.nav_item.addClass('open');

                function dropdown_shown() {
                    dropdown.menu.trigger('shown.lnav');
                }
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
            key: 'close',
            value: function close(options) {
                var self = this;
                var dropdown = options.dropdown;

                // TweenLite.to(dropdown.menu, self.settings.collapse_duration, {
                //     height: 0,
                //     onComplete: dropdown_hidden
                // })

                dropdown.menu.trigger('hide.lnav');

                dropdown.open = false;
                dropdown.nav_item.removeClass('open');

                function dropdown_hidden() {
                    dropdown.menu.trigger('hidden.lnav');
                }
            }
        }, {
            key: 'is_touch_device',
            value: function is_touch_device() {
                try {
                    document.createEvent("TouchEvent");
                    return true;
                } catch (e) {
                    return false;
                }
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