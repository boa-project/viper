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

    var showOneRecourse = function(data) {
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

        loadComments(data.about);

        var $submitcomments = $('#show-one .comments-form [type="submit"]');
        var $namecomments = $('#show-one .comments-form [name="name"]');
        var $contentcomments = $('#show-one .comments-form [name="content"]');

        $submitcomments.attr('disabled', true);

        var onchangevalid = function() {
            if ($.trim($namecomments) == '' || $.trim($contentcomments.val()) == '') {
                $submitcomments.attr('disabled', true);
            }
            else {
                $submitcomments.attr('disabled', false);
            }
        };

        $namecomments.on('input propertychange paste', onchangevalid);
        $contentcomments.on('input propertychange paste', onchangevalid);

        $submitcomments.on('click', function() {
            var commentdata = {
                "name": $.trim($namecomments.val()),
                "content": $.trim($contentcomments.val())
            };

            $.post(data.about + '/comments', commentdata, function() {
                $namecomments.val('');
                $contentcomments.val('');
                loadComments(data.about);
            });

            return false;
        });

        $item.find('[boa-action]').on('click', function() {
            var $this = $(this);
            var $parent = $($this.parents('.item-full')[0]);
            var action = $this.attr('boa-action');

            if (action == 'like' || action == 'dislike') {

                var params = action == 'like' ? {} : { value: 0 };

                $parent.find('.likegroup .active').removeClass('active');

                $.post($parent.attr('boa-about') + '/scores', params, function(data) {})
                .done(function() {
                    $this.addClass('active');
                });

            }
            else if (action == 'open') {
                window.open(data.finaluri, '_blank');
            }
        });
    };

    var loadComments = function(baseuri) {
        $.get(baseuri + '/comments', function(comments) {
            showComments(comments);
        });
    };

    var showComments = function(comments) {
        var $box = $('#show-one .comments-box');
        var $list = $box.find('.comments-list');
        var $msg = $box.find('.alert');
        $list.empty();

        if (comments.length == 0) {
            $msg.show().html('Aún no hay comentarios.');
            $list.hide();
        }
        else {
            $msg.hide();
            $list.show();
            $.each(comments, function(i, comment) {
                var $tplcomment = $('#tpl-comments-item');
                var ago = Math.floor(Date.now() / 1000) - Number(comment.updated_at);

                if (ago <= 60) {
                    ago = ago + ' segundos';
                }
                else if (ago <= 60 * 60) {
                    ago = Math.floor(ago / 60) + ' minutos';
                }
                else if (ago <= 60 * 60 * 24) {
                    ago = Math.floor(ago / (60 * 60)) + ' horas';
                }
                else {
                    ago = Math.floor(ago / (60 * 60 * 24)) + ' dias';
                }

                var datacomment = {
                    "name": comment.owner,
                    "ago": 'Hace ' + ago,
                    "content": comment.content
                };

                var $item = $tplcomment.tmpl(datacomment);
                $list.append($item);
            });
        }
    };

    var $boasearch = $('#boa-search').boasearch({
//        apiuri: 'http://localhost/viper/test/data',
        apiuri: 'http://localhost/boaapi',
        catalogues: [
            { name: 'Banco principal', key: 'banco-principal'}
        ],
        filters: [
            { meta: 'metadata.technical.format', value: ['video', 'audio'] }
        ],
        options: { cacheLife: 0 },
        debug: true,
        results: {
            target: '#search-result',
            template: '#tpl-item'
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

                var $tpl = $('#tpl-item');

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
