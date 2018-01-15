;(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})

(function ($) {
    'use strict';

    class LemNav {

        constructor(element, options) {

            let self = this;

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
                on_dropdown_shown: function () {
                },
                on_dropdown_hide: function () {
                }

            }, options);

            self.init();
        }

        init() {
            let self = this;

            self.$navbar.find('.menu-item-has-children').each(function () {
                let $this = $(this);

                self.nav.dropdowns.push({
                    trigger: $this,
                    menu: $this.find('>.sub-menu'),
                    menu_items: $this.find('>.sub-menu >li'),
                    open: false
                });
            })


            self.nav.dropdowns.forEach(function (dropdown) {

                dropdown.menu_items_tl = new TimelineMax({
                    paused: true
                });

            })


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
                            })
                        }
                        else {
                            self.close_all();
                            self.open({
                                dropdown: dropdown
                            })
                        }
                    })
                })
            }

            else if (self.settings.trigger == 'hover') {
                self.nav.dropdowns.forEach(function (dropdown) {
                    dropdown.trigger.hover(
                        function () {
                            self.open({
                                dropdown: dropdown
                            })
                        },
                        function () {
                            self.close({
                                dropdown: dropdown
                            })
                        }
                    )
                })
            }


            self.navbar_collapse();
        }

        close_all() {

            let self = this;

            self.nav.dropdowns.forEach(function (dropdown) {
                if (dropdown.open) {
                    self.close({
                        dropdown: dropdown
                    })
                }
            })
        }

        navbar_collapse() {
            let self = this;

            self.nav.navbar_trigger = $(self.settings.navbar_toggle);


            self.nav.navbar_trigger.on('click', function () {
                if (self.nav.navbar_open) {
                    TweenLite.to(self.$navbar, self.settings.navbar_collapse_duration, {height: 0})

                    self.nav.navbar_open = false;
                    self.nav.navbar_trigger.removeClass('open');
                }

                else {
                    TweenLite.set(self.$navbar, {height: "auto"})
                    TweenLite.from(self.$navbar, self.settings.navbar_collapse_duration, {height: 0})

                    self.nav.navbar_open = true;
                    self.nav.navbar_trigger.addClass('open');
                }
            })
        }

        extra_trigger() {
            let self = this;

            self.nav.dropdowns.forEach(function (dropdown) {

                let $button = $(self.settings.extra_trigger_button);

                dropdown.trigger.append($button);

                $button.on('click', function () {
                    if (dropdown.open) {
                        self.close({
                            dropdown: dropdown
                        })
                    }
                    else {
                        self.open({
                            dropdown: dropdown
                        })
                    }
                })
            })
        }

        open(options) {
            let self = this;
            let dropdown = options.dropdown;
            let current_menu_height = dropdown.menu.outerHeight();

            TweenLite.set(dropdown.menu, {height: "auto"})
            TweenLite.from(dropdown.menu, self.settings.collapse_duration, {
                height: current_menu_height,
                onComplete: dropdown_shown
            })

            dropdown.open = true;
            dropdown.trigger.addClass('open');

            function dropdown_shown() {
                self.settings.on_dropdown_shown()
            }
        }

        close(options) {
            let self = this;
            let dropdown = options.dropdown;

            self.settings.on_dropdown_hide()

            TweenLite.to(dropdown.menu, self.settings.collapse_duration, {height: 0})

            dropdown.open = false;
            dropdown.trigger.removeClass('open');
        }
    }


    $.fn.lemNav = function() {
        let $this = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            length = $this.length,
            i,
            ret;
        for (i = 0; i < length; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                $this[i].lem_nav = new LemNav($this[i], opt);
            else
                ret = $this[i].lem_nav[opt].apply($this[i].lem_nav, args);
            if (typeof ret != 'undefined') return ret;
        }
        return $this;
    };


});