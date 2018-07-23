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
                submenu_animation: 'fade',
                mobileBreakPoint: 800

            }, options);

            self.state = {
                isSubmenuOpen: false,
                currentOpenSubmenu: null,
                sizeMode: null
            };

            self.$submenuBackBtn = null;

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

                this.resize();
                this.resizeHandler();

                if (self.settings.submenu_animation == 'fade') {
                    self.initBackToParent();
                }

                if (self.settings.trigger == 'click') {
                    self.$navbar.addClass('trigger-click');

                    $(window).click(function () {
                        if (self.isDesktop()) {
                            self.close_all();
                        }
                    });

                    self.nav.dropdowns.forEach(function (dropdown) {

                        dropdown.trigger.on('click', function (event) {

                            event.stopPropagation();

                            if (self.isDesktop()) {
                                if (dropdown.open) {
                                    self.close({
                                        dropdown: dropdown
                                    });
                                } else {
                                    self.close_other_branches(dropdown.branch_id);
                                    self.openSubmenu({
                                        dropdown: dropdown
                                    });
                                }
                            } else {
                                self.switchFadeSubmenu({
                                    dropdown: dropdown
                                });
                            }
                        });
                    });
                } else if (self.settings.trigger == 'hover' && !self.is_touch_device()) {
                    self.nav.dropdowns.forEach(function (dropdown) {
                        dropdown.trigger.hover(function () {
                            self.openSubmenu({
                                dropdown: dropdown
                            });
                        }, function () {
                            self.openSubmenu({
                                dropdown: dropdown
                            });
                        });
                    });
                }

                if (self.settings.trigger_linked) {
                    self.nav.dropdowns.forEach(function (dropdown) {
                        dropdown.extra_trigger.on('click', function (event) {

                            event.stopPropagation();
                            if (dropdown.openSubmenu) {

                                self.close({
                                    dropdown: dropdown
                                });
                            } else {

                                self.close_other_branches(dropdown.branch_id);
                                self.openSubMenu({
                                    dropdown: dropdown
                                });
                            }
                        });
                    });
                }

                self.initNavbarCollapse();
            }
        }, {
            key: 'resizeHandler',
            value: function resizeHandler() {
                var self = this;
                $(window).resize(function () {
                    if (this.resizeTO) clearTimeout(this.resizeTO);

                    this.resizeTO = setTimeout(function () {
                        self.resize();
                    }, 500);
                });
            }
        }, {
            key: 'resize',
            value: function resize() {
                var ww = $(window).width();

                if (ww > this.settings.mobileBreakPoint) {
                    this.updateSizeMode('desktop');
                } else {
                    this.updateSizeMode('mobile');
                }
            }
        }, {
            key: 'updateSizeMode',
            value: function updateSizeMode(resizeMode) {
                if (resizeMode != this.state.sizeMode) {
                    this.state.sizeMode = resizeMode;
                    this.close_all();
                }
            }
        }, {
            key: 'isDesktop',
            value: function isDesktop() {
                return $(window).width() > this.settings.mobileBreakPoint;
            }
        }, {
            key: 'initBackToParent',
            value: function initBackToParent() {
                var self = this;

                self.$submenuBackBtn = $('<li class="sub-menu-back-btn">Back</li>');
                self.$navbar.find('.nav').prepend(self.$submenuBackBtn);

                self.$submenuBackBtn.on('click', function () {

                    var currentMenuLv = self.state.currentOpenSubmenu.menu_lv;
                    var currentMenuBranchID = self.state.currentOpenSubmenu.branch_id;

                    // console.log(currentMenuLv);
                    // console.log(currentMenuBranchID);

                    if (currentMenuLv > 1) {
                        // console.log(currentMenuLv);
                        // console.log(currentMenuBranchID);

                        self.nav.dropdowns.forEach(function (submenu) {
                            if (submenu.branch_id == currentMenuBranchID && submenu.menu_lv == currentMenuLv - 1) {
                                self.switchFadeSubmenu({
                                    dropdown: submenu
                                });
                            }
                        });
                    } else {
                        self.closeFadeSubmenu();
                    }
                });
            }
        }, {
            key: 'closeFadeSubmenu',
            value: function closeFadeSubmenu() {
                var self = this;

                var tl = new TimelineLite();
                tl.to(self.$navbar, 0.2, {
                    scale: 1.02, opacity: 0, onComplete: function onComplete() {

                        self.nav.dropdowns.forEach(function (submenu) {
                            if (submenu.open) {
                                submenu.open = false;
                                submenu.nav_item.removeClass('open');
                            }
                        });

                        self.$navbar.removeClass('submenu-open');
                    }
                });
                tl.to(self.$navbar, 0.2, {
                    scale: 1, opacity: 1
                });
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
                        branch_id: options.branch_id,
                        open: false
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
                        self.closeNavbar();
                    } else {
                        self.openNavbar();
                    }
                });
            }
        }, {
            key: 'openNavbar',
            value: function openNavbar() {
                var self = this;

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
        }, {
            key: 'closeNavbar',
            value: function closeNavbar() {
                var self = this;

                self.close_all();

                switch (self.settings.navbar_animation) {
                    case 'shift':
                        TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, {
                            autoAlpha: 0, y: 20, onComplete: function onComplete() {
                                self.$navbar.removeClass('submenu-open');
                            }
                        });
                        break;

                    case 'collapse':
                        TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, { height: 0 });
                        break;
                }

                self.nav.navbar_open = false;
                self.nav.navbar_trigger.removeClass('open');
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
            key: 'switchFadeSubmenu',
            value: function switchFadeSubmenu(options) {
                var self = this;
                var currentDropdown = options.dropdown;

                if (!self.state.isSubmenuOpen) {
                    self.state.isSubmenuOpen = true;
                }

                // if (currentDropdown.menu_lv > 1) {
                self.nav.dropdowns.forEach(function (dropdown) {
                    if (currentDropdown.branch_id == dropdown.branch_id && dropdown.menu_lv < currentDropdown.menu_lv) {
                        dropdown.nav_item.addClass('nested-menu-open');
                    } else {
                        dropdown.nav_item.removeClass('nested-menu-open');
                    }
                });
                // }

                var tl = new TimelineLite();
                tl.to(self.$navbar, 0.2, {
                    scale: 1.02, opacity: 0, onComplete: function onComplete() {

                        self.$navbar.addClass('submenu-open');
                        self.nav.dropdowns.forEach(function (submenu) {
                            submenu.nav_item.removeClass('open');
                            submenu.open = true;
                        });

                        dropdown_shown();
                    }
                });
                tl.to(self.$navbar, 0.2, {
                    scale: 1, opacity: 1
                });

                function dropdown_shown() {
                    currentDropdown.menu.trigger('shown.lnav');
                    currentDropdown.menu.trigger('show.lnav');

                    currentDropdown.open = true;
                    currentDropdown.nav_item.addClass('open');

                    self.state.currentOpenSubmenu = currentDropdown;
                }
            }
        }, {
            key: 'openSubmenu',
            value: function openSubmenu(options) {
                var self = this;
                var dropdown = options.dropdown;
                var current_menu_height = dropdown.menu.outerHeight();

                TweenLite.set(dropdown.menu, { height: "auto" });
                TweenLite.from(dropdown.menu, self.settings.collapse_duration, {
                    height: current_menu_height,
                    onComplete: dropdown_shown
                });

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

                self.nav.dropdowns.forEach(function (submenu) {
                    if (submenu.open) {
                        self.close({
                            dropdown: submenu
                        });
                        submenu.open = false;
                        submenu.nav_item.removeClass('open');
                    }
                });
                self.$navbar.removeClass('submenu-open');
            }
        }, {
            key: 'close',
            value: function close(options) {
                var self = this;
                var dropdown = options.dropdown;

                TweenLite.to(dropdown.menu, self.settings.collapse_duration, {
                    height: 0,
                    onComplete: dropdown_hidden
                });

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