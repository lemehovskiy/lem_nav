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

    class WpNav {

        constructor(element, options) {

            let self = this;
            
            self.settings = $.extend({
               
            }, options);

            let $element = $(element);
            
        }
    }


    $.fn.wpNav = function() {
        let $this = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            length = $this.length,
            i,
            ret;
        for (i = 0; i < length; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                $this[i].wp_nav = new WpNav($this[i], opt);
            else
                ret = $this[i].wp_nav[opt].apply($this[i].wp_nav, args);
            if (typeof ret != 'undefined') return ret;
        }
        return $this;
    };


});