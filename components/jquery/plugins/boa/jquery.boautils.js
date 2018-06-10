jQuery.extend({
    boautils: function (params) {
        var options = {
            resourcesSlice: '/!/'
        };

        options = $.extend({}, options, params);

        var utils = {
            getFinalUri: function(resource) {
                var finaluri;
                if (resource.manifest.conexion_type == 'external') {
                    finaluri = resource.manifest.url;
                }
                else {
                    finaluri = resource.about + options.resourcesSlice;

                    if (resource.manifest.entrypoint) {
                        finaluri += resource.manifest.entrypoint;
                    }
                }

                return finaluri;
            }
        };

        return utils;
    }
});
