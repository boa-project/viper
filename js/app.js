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

'use strict';

dhbgApp.start = function() {

    var boautils = $.boautils();

    $('.flexslider').flexslider({
        animation: "slide",
        animationLoop: true,
        itemWidth: 160,
        itemMargin: 10,
        slideshow: false
    });

    var showOneRecourse = function (data) {
        $('#search-result').removeClass('col-12').addClass('col-sm-4');
        $('#show-one').addClass('col-sm-8');
        $('#show-one').empty();
        $("html, body").animate({ scrollTop: 0 }, 500);

        data.finaluri = boautils.getFinalUri(data);

        var $tpl;
        if (data.metadata.technical.format.indexOf('audio') > -1) {
            $tpl = $('#tpl-audio-item-full');
        }
        else {
            $tpl = $('#tpl-video-item-full');
        }

        var $item = $tpl.tmpl(data);
        $('#show-one').append($item);
    };

    var $boasearch = $('#boa-search').boasearch({
//        apiuri: 'http://localhost/viper/test/data',
        apiuri: 'http://localhost/boaapi',
        catalogues: [
//            { name: 'Catalogo de casas', key: 'casas'},
//            { name: 'Vida en pareja', key: 'parejas'}
            { name: 'Banco principal', key: 'banco-principal'},
            //{ name: 'Cleo - UdeA', key: 'cleo'}
        ],
        filters: [
            { meta: 'metadata.technical.format', value: ['video', 'audio'] }
        ],
        options: { cacheLife: 0 },
        debug: true,
        results: {
            target: '#search-result',
            template: '#tpl-video-item'
        },
        events: {
            onstart: function(more) {
                $('#search-result').addClass('loading');
                $('#search-result').show();

                if (!more) {
                    $('#search-result > .content').empty();
                }
            },
            onfound: function(data) {

                dhbgApp.debug('Encontrados: ' + data.length + ' resultados');

                $('#search-result').removeClass('loading');
                var $target = $('#search-result > .content');

                var resultsSize = $('#boa-search').boasearch('option', 'resultsSize');

                if (data.length === 0 || data.length < resultsSize) {
                    $('#search-result > button').hide();
                }

                var $tpl = $('#tpl-video-item');

                $.each(data, function(k, item) {
                    if (item.manifest.conexion_type == 'external') {
                        item.finaluri = item.manifest.url;
                    }
                    else {
                        item.finaluri = item.about + '/!/';

                        if (item.manifest.entrypoint) {
                            item.finaluri += item.manifest.entrypoint;
                        }
                    }
                    var $item = $tpl.tmpl(item);
                    $item.appendTo($target);

                    $item.find('[boa-href]').on('click', function() {
                        var $this = $(this);

                        $.get($this.attr('boa-href'), function(data) {
                            showOneRecourse(data);
                        });
                    });
                });
            },
            onerror: function(error) {
                var $target = $('#errors-box');
                $target.empty();

                var $tpl = $('#tpl-error-item');
                var $node = $tpl.tmpl(error);
                $target.append($node);

                $node.find('button.close').on('click', function() {
                    $node.remove();
                });

                dhbgApp.debug(error);

                $target.removeClass('loading');
            }
        }
    });

    $('#boa-search-button').on('click', function(){
        $('#boa-search').boasearch('search');
    });

    $('#search-result > button').on('click', function(){
        $('#boa-search').boasearch('nextsearch');
    });

    $('#boa-search').boasearch('search');

//     $('#outstanding-video').boa({
//         apiuri: "https://permanenciaboa.udea.edu.co/api/",
//         query: "c/catedras-udea-diversa/resources?q=metadata.technical.format:video&(n)=1&(s)=1",
//         type: "detail"
//     });

};
