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
                extra_trigger_button: "<button class='extra-trigger'><i class='icon icon-down-open-big'></i></button>",
                navbar_collapse_duration: 0.5

            }, options);

            self.init();
        }

        init() {
            let self = this;

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
                            })
                            console.log('111');
                        }
                        else {

                            self.close_other_branches(dropdown.branch_id);
                            self.open({
                                dropdown: dropdown
                            })
                        }
                    })
                })
            }

            else if (self.settings.trigger == 'hover' && !(self.is_touch_device())) {
                self.nav.dropdowns.forEach(function (dropdown) {
                    dropdown.trigger.hover(
                        function () {
                            self.open({
                                dropdown: dropdown
                            })
                        },
                        function () {
                            console.log('222')
                            self.close({
                                dropdown: dropdown
                            })
                        }
                    )
                })
            }

            self.navbar_collapse();
        }

        set_dropdowns_data() {
            let self = this;

            self.$navbar.find('.nav >.menu-item-has-children').each(function (index) {

                let sub_menu = get_submenu(
                    {
                        $nav_item: $(this),
                        menu_lv: 1,
                        branch_id: index
                    }
                );

                self.nav.dropdowns.push(sub_menu);

            });


            function get_submenu(options) {

                let nested_submenu = {
                    nav_item: options.$nav_item,
                    trigger: options.$nav_item,
                    menu: options.$nav_item.find('>.sub-menu'),
                    menu_items: options.$nav_item.find('>.sub-menu >li'),
                    menu_lv: options.menu_lv,
                    branch_id: options.branch_id
                }


                if (self.settings.trigger_linked) {
                    nested_submenu.extra_trigger = self.extra_trigger(options.$nav_item)
                }

                options.$nav_item.find('>.sub-menu >.menu-item-has-children').each(function () {
                    self.nav.dropdowns.push(get_submenu(
                        {
                            $nav_item: $(this),
                            menu_lv: options.menu_lv + 1,
                            branch_id: options.branch_id
                        })
                    )
                });

                return nested_submenu

            }

        }

        close_other_branches(current_branch_id) {
            let self = this;

            self.nav.dropdowns.forEach(function (dropdown) {
                if (dropdown.open && !dropdown.branch_id == current_branch_id) {
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

        extra_trigger($nav_item) {
            let self = this;


            let $trigger = $(self.settings.extra_trigger_button);

            $nav_item.append($trigger);

            return $trigger;
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

            dropdown.menu.trigger('show.lnav');

            dropdown.open = true;
            dropdown.nav_item.addClass('open');

            function dropdown_shown() {
                dropdown.menu.trigger('shown.lnav')
            }
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

        close(options) {
            let self = this;
            let dropdown = options.dropdown;

            TweenLite.to(dropdown.menu, self.settings.collapse_duration, {
                height: 0,
                onComplete: dropdown_hidden
            })

            dropdown.menu.trigger('hide.lnav');

            dropdown.open = false;
            dropdown.nav_item.removeClass('open');

            function dropdown_hidden(){
                dropdown.menu.trigger('hidden.lnav');
            }
        }

        is_touch_device() {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        };
    }


    $.fn.lemNav = function () {
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