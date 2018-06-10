// This file is part of BoA
//
// BoA is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// BoA is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with BoA.  If not, see <http://www.gnu.org/licenses/>.

/*
 * jQuery BoA v1.0.0
 * Copyright 2018 David Herney
 */
(function ($) {

    var focused = true;

    //BoA: Object Instance
    $.boa = function(el, options) {
        var $boa = $(el);

        $boa.vars = $.extend({}, $.boa.defaults, options);

        // Store a reference to the slider object
        $.data(el, "boa", $boa);

        // Private slider methods
        methods = {
            init: function() {
                if (options.query == "") {
                    return;
                }

                $.get(options.apiuri + options.query, function(data){
                    console.log(data);
                    $boa.html(data);
                })
                .fail(function(e) {
                    console.log(e);
                    console.log( "error" );
                })
                .always(function() {
                    console.log( "finished" );
                });
            },
        };

        // public methods
        $boa.flexAnimate = function(target, pause, override, withSync, fromNav) {
        };

        //BoA: Initialize
        methods.init();
    };

    //BoA: Default Settings
    $.boa.defaults = {
        query: "",
        apiuri: "",
        type: "shortlist" //shortlist, fulllist, detail
    };

    //BoA: Plugin Function
    $.fn.boa = function(options) {
        if (options === undefined) { options = {}; }
        if (typeof options === "object") {
            return this.each(function() {
                new $.boa(this, options);
            });
        }
    };
})(jQuery);
