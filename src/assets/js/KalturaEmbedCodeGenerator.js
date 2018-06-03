/*! Kaltura Embed Code Generator - v1.2.0 - 2018-03-25
 * https://github.com/kaltura/EmbedCodeGenerator
 * Copyright (c) 2018 Ran Yefet; Licensed MIT */
// lib/handlebars/base.js

/*jshint eqnull:true*/
this.Handlebars = {};

(function(Handlebars) {

    Handlebars.VERSION = "1.0.rc.2";

    Handlebars.helpers  = {};
    Handlebars.partials = {};

    Handlebars.registerHelper = function(name, fn, inverse) {
        if(inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
    };

    Handlebars.registerPartial = function(name, str) {
        this.partials[name] = str;
    };

    Handlebars.registerHelper('helperMissing', function(arg) {
        if(arguments.length === 2) {
            return undefined;
        } else {
            throw new Error("Could not find property '" + arg + "'");
        }
    });

    var toString = Object.prototype.toString, functionType = "[object Function]";

    Handlebars.registerHelper('blockHelperMissing', function(context, options) {
        var inverse = options.inverse || function() {}, fn = options.fn;


        var ret = "";
        var type = toString.call(context);

        if(type === functionType) { context = context.call(this); }

        if(context === true) {
            return fn(this);
        } else if(context === false || context == null) {
            return inverse(this);
        } else if(type === "[object Array]") {
            if(context.length > 0) {
                return Handlebars.helpers.each(context, options);
            } else {
                return inverse(this);
            }
        } else {
            return fn(context);
        }
    });

    Handlebars.K = function() {};

    Handlebars.createFrame = Object.create || function(object) {
            Handlebars.K.prototype = object;
            var obj = new Handlebars.K();
            Handlebars.K.prototype = null;
            return obj;
        };

    Handlebars.logger = {
        DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

        methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

        // can be overridden in the host environment
        log: function(level, obj) {
            if (Handlebars.logger.level <= level) {
                var method = Handlebars.logger.methodMap[level];
                if (typeof console !== 'undefined' && console[method]) {
                    console[method].call(console, obj);
                }
            }
        }
    };

    Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

    Handlebars.registerHelper('each', function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        var i = 0, ret = "", data;

        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }

        if(context && typeof context === 'object') {
            if(context instanceof Array){
                for(var j = context.length; i<j; i++) {
                    if (data) { data.index = i; }
                    ret = ret + fn(context[i], { data: data });
                }
            } else {
                for(var key in context) {
                    if(context.hasOwnProperty(key)) {
                        if(data) { data.key = key; }
                        ret = ret + fn(context[key], {data: data});
                        i++;
                    }
                }
            }
        }

        if(i === 0){
            ret = inverse(this);
        }

        return ret;
    });

    Handlebars.registerHelper('if', function(context, options) {
        var type = toString.call(context);
        if(type === functionType) { context = context.call(this); }

        if(!context || Handlebars.Utils.isEmpty(context)) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('unless', function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        options.fn = inverse;
        options.inverse = fn;

        return Handlebars.helpers['if'].call(this, context, options);
    });

    Handlebars.registerHelper('with', function(context, options) {
        return options.fn(context);
    });

    Handlebars.registerHelper('log', function(context, options) {
        var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
        Handlebars.log(level, context);
    });

}(this.Handlebars));
;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
    var tmp = Error.prototype.constructor.apply(this, arguments);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
    }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
    this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
    return this.string.toString();
};

(function() {
    var escape = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    };

    var badChars = /[&<>"'`]/g;
    var possible = /[&<>"'`]/;

    var escapeChar = function(chr) {
        return escape[chr] || "&amp;";
    };

    Handlebars.Utils = {
        escapeExpression: function(string) {
            // don't escape SafeStrings, since they're already safe
            if (string instanceof Handlebars.SafeString) {
                return string.toString();
            } else if (string == null || string === false) {
                return "";
            }

            if(!possible.test(string)) { return string; }
            return string.replace(badChars, escapeChar);
        },

        isEmpty: function(value) {
            if (!value && value !== 0) {
                return true;
            } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
                return true;
            } else {
                return false;
            }
        }
    };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
    template: function(templateSpec) {
        // Just add water
        var container = {
            escapeExpression: Handlebars.Utils.escapeExpression,
            invokePartial: Handlebars.VM.invokePartial,
            programs: [],
            program: function(i, fn, data) {
                var programWrapper = this.programs[i];
                if(data) {
                    return Handlebars.VM.program(fn, data);
                } else if(programWrapper) {
                    return programWrapper;
                } else {
                    programWrapper = this.programs[i] = Handlebars.VM.program(fn);
                    return programWrapper;
                }
            },
            programWithDepth: Handlebars.VM.programWithDepth,
            noop: Handlebars.VM.noop
        };

        return function(context, options) {
            options = options || {};
            return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
        };
    },

    programWithDepth: function(fn, data, $depth) {
        var args = Array.prototype.slice.call(arguments, 2);

        return function(context, options) {
            options = options || {};

            return fn.apply(this, [context, options.data || data].concat(args));
        };
    },
    program: function(fn, data) {
        return function(context, options) {
            options = options || {};

            return fn(context, options.data || data);
        };
    },
    noop: function() { return ""; },
    invokePartial: function(partial, name, context, helpers, partials, data) {
        var options = { helpers: helpers, partials: partials, data: data };

        if(partial === undefined) {
            throw new Handlebars.Exception("The partial " + name + " could not be found");
        } else if(partial instanceof Function) {
            return partial(context, options);
        } else if (!Handlebars.compile) {
            throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
        } else {
            partials[name] = Handlebars.compile(partial, {data: data !== undefined});
            return partials[name](context, options);
        }
    }
};

Handlebars.template = Handlebars.VM.template;
;

(function (window, Handlebars, undefined ) {
    /**
     * Transforms flashVars object into a string for Url or Flashvars string.
     *
     * @method flashVarsToUrl
     * @param {Object} flashVarsObject A flashvars object
     * @param {String} paramName The name parameter to add to url
     * @return {String} Returns flashVars string like: &foo=bar or &param[foo]=bar
     */
    var flashVarsToUrl = function( flashVarsObject, paramName ) {
        var params = '';

        var paramPrefix = (paramName) ? paramName + '[' : '';
        var paramSuffix = (paramName) ? ']' : '';

        for( var i in flashVarsObject ){
            // check for object representation of plugin config:
            if( typeof flashVarsObject[i] == 'object' ){
                for( var j in flashVarsObject[i] ){
                    params+= '&' + paramPrefix + encodeURIComponent( i ) +
                        '.' + encodeURIComponent( j ) + paramSuffix +
                        '=' + encodeURIComponent( flashVarsObject[i][j] );
                }
            } else {
                params+= '&' + paramPrefix + encodeURIComponent( i ) + paramSuffix + '=' + encodeURIComponent( flashVarsObject[i] );
            }
        }
        return params;
    };

// Setup handlebars helpers
    Handlebars.registerHelper('flashVarsUrl', function(flashVars) {
        return flashVarsToUrl(flashVars, 'flashvars');
    });
    Handlebars.registerHelper('flashVarsString', function(flashVars) {
        return flashVarsToUrl(flashVars);
    });
    Handlebars.registerHelper('elAttributes', function( attributes ) {
        var str = '';
        for( var i in attributes ) {
            str += ' ' + i + '="' + attributes[i] + '"';
        }
        return str;
    });

// Include kaltura links
    Handlebars.registerHelper('kalturaLinks', function() {
        if( ! this.includeKalturaLinks ) {
            return '';
        }
        var template = Handlebars.templates['templates/kaltura_links.hbs'];
        return template();
    });

    Handlebars.registerHelper('seoMetadata', function() {
        var template = Handlebars.templates['templates/seo_metadata.hbs'];
        return template(this);
    });

})(this, this.Handlebars);
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};

this["Handlebars"]["templates"]["templates/auto.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};
    var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

    function program1(depth0,data) {

        var buffer = "", stack1, stack2, options;
        buffer += "<div id=\"";
        if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
        else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
        buffer += escapeExpression(stack1)
            + "\"";
        options = {hash:{},data:data};
        stack2 = ((stack1 = helpers.elAttributes),stack1 ? stack1.call(depth0, depth0.attributes, options) : helperMissing.call(depth0, "elAttributes", depth0.attributes, options));
        if(stack2 || stack2 === 0) { buffer += stack2; }
        buffer += ">";
        if (stack2 = helpers.seoMetadata) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.seoMetadata; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        if(stack2 || stack2 === 0) { buffer += stack2; }
        if (stack2 = helpers.kalturaLinks) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.kalturaLinks; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        if(stack2 || stack2 === 0) { buffer += stack2; }
        buffer += "</div>\n";
        return buffer;
    }

    function program3(depth0,data) {

        var buffer = "", stack1;
        buffer += "&entry_id=";
        if (stack1 = helpers.entryId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
        else { stack1 = depth0.entryId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
        buffer += escapeExpression(stack1);
        return buffer;
    }

    function program5(depth0,data) {

        var buffer = "", stack1;
        buffer += "&cache_st=";
        if (stack1 = helpers.cacheSt) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
        else { stack1 = depth0.cacheSt; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
        buffer += escapeExpression(stack1);
        return buffer;
    }

    stack1 = helpers['if'].call(depth0, depth0.includeSeoMetadata, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "<script src=\"";
    if (stack1 = helpers.scriptUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.scriptUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "?autoembed=true";
    stack1 = helpers['if'].call(depth0, depth0.entryId, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "&playerId=";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1);
    stack1 = helpers['if'].call(depth0, depth0.cacheSt, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "&width=";
    if (stack1 = helpers.width) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.width; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "&height=";
    if (stack1 = helpers.height) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.height; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1);
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.flashVarsUrl),stack1 ? stack1.call(depth0, depth0.flashVars, options) : helperMissing.call(depth0, "flashVarsUrl", depth0.flashVars, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "\"></script>";
    return buffer;
});

this["Handlebars"]["templates"]["templates/dynamic.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};
    var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


    buffer += "<script src=\"";
    if (stack1 = helpers.scriptUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.scriptUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\"></script>\n<div id=\"";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\"";
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.elAttributes),stack1 ? stack1.call(depth0, depth0.attributes, options) : helperMissing.call(depth0, "elAttributes", depth0.attributes, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += ">";
    if (stack2 = helpers.seoMetadata) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.seoMetadata; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    if (stack2 = helpers.kalturaLinks) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.kalturaLinks; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "</div>\n<script>\nkWidget.";
    if (stack2 = helpers.embedMethod) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.embedMethod; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    buffer += escapeExpression(stack2)
        + "(";
    if (stack2 = helpers.kWidgetObject) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.kWidgetObject; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += ");\n</script>";
    return buffer;
});

this["Handlebars"]["templates"]["templates/iframe.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};
    var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {

        var buffer = "", stack1;
        buffer += "&entry_id=";
        if (stack1 = helpers.entryId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
        else { stack1 = depth0.entryId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
        buffer += escapeExpression(stack1);
        return buffer;
    }

    buffer += "<iframe id=\"";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\" src=\"";
    if (stack1 = helpers.protocol) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.protocol; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "://";
    if (stack1 = helpers.host) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.host; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "/p/";
    if (stack1 = helpers.partnerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.partnerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "/sp/";
    if (stack1 = helpers.partnerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.partnerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "00/embedIframeJs/uiconf_id/";
    if (stack1 = helpers.uiConfId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.uiConfId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "/partner_id/";
    if (stack1 = helpers.partnerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.partnerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "?iframeembed=true&playerId=";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1);
    stack1 = helpers['if'].call(depth0, depth0.entryId, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.flashVarsUrl),stack1 ? stack1.call(depth0, depth0.flashVars, options) : helperMissing.call(depth0, "flashVarsUrl", depth0.flashVars, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "\" width=\"";
    if (stack2 = helpers.width) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.width; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    buffer += escapeExpression(stack2)
        + "\" height=\"";
    if (stack2 = helpers.height) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.height; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    buffer += escapeExpression(stack2)
        + "\" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow=\"autoplay; fullscreen; encrypted-media\" frameborder=\"0\"";
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.elAttributes),stack1 ? stack1.call(depth0, depth0.attributes, options) : helperMissing.call(depth0, "elAttributes", depth0.attributes, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += ">";
    if (stack2 = helpers.seoMetadata) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.seoMetadata; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    if (stack2 = helpers.kalturaLinks) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.kalturaLinks; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "</iframe>";
    return buffer;
});

this["Handlebars"]["templates"]["templates/kaltura_links.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};



    return "<a href=\"http://corp.kaltura.com/products/video-platform-features\">Video Platform</a>\n<a href=\"http://corp.kaltura.com/Products/Features/Video-Management\">Video Management</a> \n<a href=\"http://corp.kaltura.com/Video-Solutions\">Video Solutions</a>\n<a href=\"http://corp.kaltura.com/Products/Features/Video-Player\">Video Player</a>";
});

this["Handlebars"]["templates"]["templates/legacy.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};
    var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {

        var buffer = "", stack1;
        buffer += "<script src=\"";
        if (stack1 = helpers.scriptUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
        else { stack1 = depth0.scriptUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
        buffer += escapeExpression(stack1)
            + "\"></script>\n";
        return buffer;
    }

    function program3(depth0,data) {

        var buffer = "", stack1, stack2;
        buffer += "\n	<a rel=\"media:thumbnail\" href=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.thumbnailUrl)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></a>\n	<span property=\"dc:description\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n	<span property=\"media:title\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n    <span property=\"media:uploadDate\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.uploadDate)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n	<span property=\"media:width\" content=\"";
        if (stack2 = helpers.width) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.width; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        buffer += escapeExpression(stack2)
            + "\"></span>\n	<span property=\"media:height\" content=\"";
        if (stack2 = helpers.height) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.height; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        buffer += escapeExpression(stack2)
            + "\"></span>\n	<span property=\"media:type\" content=\"application/x-shockwave-flash\"></span>	\n	";
        return buffer;
    }

    stack1 = helpers['if'].call(depth0, depth0.includeHtml5Library, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "<object id=\"";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\" name=\"";
    if (stack1 = helpers.playerId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.playerId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\" type=\"application/x-shockwave-flash\" allowFullScreen=\"true\" allowNetworking=\"all\" allowScriptAccess=\"always\" height=\"";
    if (stack1 = helpers.height) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.height; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\" width=\"";
    if (stack1 = helpers.width) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
    else { stack1 = depth0.width; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
    buffer += escapeExpression(stack1)
        + "\" bgcolor=\"#000000\"";
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.elAttributes),stack1 ? stack1.call(depth0, depth0.attributes, options) : helperMissing.call(depth0, "elAttributes", depth0.attributes, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += " data=\"";
    if (stack2 = helpers.swfUrl) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.swfUrl; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    buffer += escapeExpression(stack2)
        + "\">\n	<param name=\"allowFullScreen\" value=\"true\" />\n	<param name=\"allowNetworking\" value=\"all\" />\n	<param name=\"allowScriptAccess\" value=\"always\" />\n	<param name=\"bgcolor\" value=\"#000000\" />\n	<param name=\"flashVars\" value=\"";
    options = {hash:{},data:data};
    stack2 = ((stack1 = helpers.flashVarsString),stack1 ? stack1.call(depth0, depth0.flashVars, options) : helperMissing.call(depth0, "flashVarsString", depth0.flashVars, options));
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "\" />\n	<param name=\"movie\" value=\"";
    if (stack2 = helpers.swfUrl) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.swfUrl; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    buffer += escapeExpression(stack2)
        + "\" />\n	";
    stack2 = helpers['if'].call(depth0, depth0.includeSeoMetadata, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
    if(stack2 || stack2 === 0) { buffer += stack2; }
    if (stack2 = helpers.kalturaLinks) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
    else { stack2 = depth0.kalturaLinks; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
    if(stack2 || stack2 === 0) { buffer += stack2; }
    buffer += "\n</object>";
    return buffer;
});

this["Handlebars"]["templates"]["templates/seo_metadata.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [2,'>= 1.0.0-rc.3'];
    helpers = helpers || Handlebars.helpers; data = data || {};
    var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {

        var buffer = "", stack1, stack2;
        buffer += "\n<span itemprop=\"name\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n<span itemprop=\"description\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n<span itemprop=\"duration\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.duration)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n<span itemprop=\"thumbnailUrl\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.thumbnailUrl)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n<span itemprop=\"uploadDate\" content=\""
            + escapeExpression(((stack1 = ((stack1 = depth0.entryMeta),stack1 == null || stack1 === false ? stack1 : stack1.uploadDate)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"></span>\n<span itemprop=\"width\" content=\"";
        if (stack2 = helpers.width) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.width; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        buffer += escapeExpression(stack2)
            + "\"></span>\n<span itemprop=\"height\" content=\"";
        if (stack2 = helpers.height) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
        else { stack2 = depth0.height; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
        buffer += escapeExpression(stack2)
            + "\"></span>\n";
        return buffer;
    }

    stack1 = helpers['if'].call(depth0, depth0.includeSeoMetadata, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
    if(stack1 || stack1 === 0) { return stack1; }
    else { return ''; }
});
// Add indexOf to array object
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}
// Add keys for Object
if (!Object.keys) {
    Object.keys = (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [];

            for (var prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (var i=0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    })();
}
(function( window, undefined ) {
    /**
     * Kaltura Embed Code Generator
     * Used to generate different type of embed codes
     * Depended on Handlebars ( http://handlebarsjs.com/ )
     *
     * @class EmbedCodeGenerator
     * @constructor
     */
    var EmbedCodeGenerator = function( options ) {
        this.init( options );
    };

    EmbedCodeGenerator.prototype = {

        types: ['auto', 'dynamic', 'thumb', 'iframe', 'legacy'],
        required: ['widgetId', 'partnerId', 'uiConfId'],

        defaults: {
            /**
             * Embed code type to generate
             * Can we one of: ['auto', 'dynamic', 'thumb', 'iframe', 'legacy']
             *
             * @property embedType
             * @type {String}
             * @default "auto"
             */
            embedType: 'auto',
            /**
             * The Player element Id / Name that will be used for embed code
             *
             * @property playerId
             * @type {String}
             * @default "kaltura_player"
             */
            playerId: 'kaltura_player',
            /**
             * Embed HTTP protocol to use
             * Can we one of: ['http', 'https']
             *
             * @property protocol
             * @type {String}
             * @default "http"
             */
            protocol: 'http',
            /**
             * Host for loading html5 library & kdp swf
             *
             * @property host
             * @type {String}
             * @default "www.kaltura.com"
             */
            host: 'www.kaltura.com',
            /**
             * Secured host for loading html5 library & kdp swf
             * Used if protocol is: 'https'
             *
             * @property securedHost
             * @type {String}
             * @default "www.kaltura.com"
             */
            securedHost: 'www.kaltura.com',
            /**
             * Kaltura Widget Id
             *
             * @property widgetId
             * @type {String}
             * @default "_{partnerId}"
             */
            widgetId: null,
            /**
             * Kaltura Partner Id
             *
             * @property partnerId
             * @type {Number}
             * @default null,
             */
            partnerId: null,
            /**
             * Add cacheSt parameter to bust cache
             * Should be unix timestamp of future time
             *
             * @property cacheSt
             * @type {Number}
             * @default null,
             */
            cacheSt: null,
            /**
             * Kaltura UiConf Id
             *
             * @property uiConfId
             * @type {Number}
             * @default null,
             */
            uiConfId: null,
            /**
             * Kaltura Entry Id
             *
             * @property entryId
             * @type {String}
             * @default null,
             */
            entryId: null,
            /**
             * Entry Object similar to:
             * {
		*	name: 'Foo',
		*	description: 'Bar',
		*	thumbUrl: 'http://cdnbakmi.kaltura.com/thumbnail/...'
		* }
             *
             * @property entryMeta
             * @type {Object}
             * @default {},
             */
            entryMeta: {},
            /**
             * Sets Player Width
             *
             * @property width
             * @type {Number}
             * @default 400,
             */
            width: 400,
            /**
             * Sets Player Height
             *
             * @property height
             * @type {Number}
             * @default 330,
             */
            height: 330,
            /**
             * Adds additonal attributes to embed code.
             * Example:
             * {
		*	"class": "player"
		* }
             *
             * @property attributes
             * @type {Object}
             * @default {},
             */
            attributes: {},
            /**
             * Adds flashVars to player
             * Example:
             * {
		*	"autoPlay": "true"
		* }
             *
             * @property flashVars
             * @type {Object}
             * @default {},
             */
            flashVars: {},
            /**
             * Include Kaltura SEO links to embed code
             *
             * @property includeKalturaLinks
             * @type {Boolean}
             * @default true,
             */
            includeKalturaLinks: true,
            /**
             * Include Entry Seo Metadata
             * Metadata is taken from {entryMeta} object
             *
             * @property includeSeoMetadata
             * @type {Boolean}
             * @default false,
             */
            includeSeoMetadata: false,
            /**
             * Include HTML5 library script
             *
             * @property includeHtml5Library
             * @type {Boolean}
             * @default true,
             */
            includeHtml5Library: true
        },
        /**
         * Merge two object together
         *
         * @method extend
         * @param {Object} destination object to merge into
         * @param {Object} sourece object to merge from
         * @return {Object} Merged object
         */
        extend: function(destination, source) {
            for (var property in source) {
                if (source.hasOwnProperty(property) && !destination.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            return destination;
        },
        /**
         * Check if property is null
         *
         * @method isNull
         * @param {Any} property some var
         * @return {Boolean}
         */
        isNull: function( property ) {

            // Null ?
            if (property === null) {
                return true;
            }

            if (property.length && property.length > 0) {
                return false;
            }
            if (property.length && property.length === 0) {
                return true;
            }
            if( typeof property === 'object' ) {
                return (Object.keys(property).length > 0) ? false : true;
            }
            return !property;
        },
        /**
         * Set default options to EmbedCodeGenerator instance
         *
         * @method init
         * @param {Object} options Configuration object based on defaults object
         * @return {Object} Returns the current instance
         */
        init: function( options ) {

            options = options || {};

            var defaults = this.defaults;

            // Make sure Handlebars is available
            if( typeof Handlebars === undefined ) {
                throw 'Handlebars is not defined, please include Handlebars.js before this script';
            }

            // Merge options with defaults
            if( typeof options === 'object' ) {
                this.options = this.extend(options, this.defaults);
            }
            // Set widgetId to partnerId if not defined
            if( ! this.config('widgetId') && this.config('partnerId') ) {
                this.config('widgetId', '_' + this.config('partnerId'));
            }

            return this;
        },
        /**
         * Get or Set default configuration
         *
         * @method config
         * @param {String} key configuration property name
         * @param {Any} value to set
         * @return {Mixed} Return the value for the key, configuration object or null
         */
        config: function( key, val ) {
            // Used as getter
            if( val === undefined && typeof key === 'string' && this.options.hasOwnProperty(key) ) {
                return this.options[ key ];
            }
            // Get all options
            if( key === undefined && val === undefined ) {
                return this.options;
            }
            // Used as setter
            if( typeof key === 'string' && val !== undefined ) {
                this.options[ key ] = val;
            }
            return null;
        },
        /**
         * Check if required parameters are missing
         *
         * @method checkRequiredParams
         * @param {Object} Configuration object
         * @return throws exception if missing parameters
         */
        checkRequiredParams: function( params ) {
            var requiredLength = this.required.length,
                i = 0;
            // Check for required configuration
            for(i; i<requiredLength; i++) {
                if( this.isNull(params[this.required[i]]) ) {
                    throw 'Missing required parameter: ' + this.required[i];
                }
            }
        },
        /**
         * Check if embed type is part of types array
         *
         * @method checkValidType
         * @param {String} type - One of config embed types
         * @return throws exception if not valid
         */
        checkValidType: function( type ) {
            var valid = (this.types.indexOf(type) !== -1) ? true : false;;
            if( !valid ) {
                throw 'Embed type: ' + type + ' is not valid. Available types: ' + this.types.join(",");
            }
        },
        /**
         * Get Handlebars template based on embed type
         *
         * @method getTemplate
         * @param {String} type - One of config embed types
         * @return {Mixed} If found returns Handlebars template function, else null
         */
        getTemplate: function( type ) {
            // Dynamic embed and Thumb embed has the same template
            type = (type == 'thumb') ? 'dynamic' : type;
            var templateName = 'templates/' + type + '.hbs';
            return ( type && Handlebars.templates && Handlebars.templates[ templateName ] ) ? Handlebars.templates[ templateName ] : null;
        },
        /**
         * Check if embed type is using kWidget embed
         *
         * @method isKWidgetEmbed
         * @param {String} type - One of config embed types
         * @return {Boolean} true / false
         */
        isKWidgetEmbed: function( type ) {
            return ( type == 'dynamic' || type == 'thumb' ) ? true : false;
        },
        /**
         * Get embed host based on protocol
         *
         * @method getHost
         * @param {Object} params Configuration object
         * @return {String} Embed host
         */
        getHost: function( params ) {
            return (params.protocol === 'http') ? params.host : params.securedHost;
        },
        /**
         * Generate HTML5 library script url
         *
         * @method getScriptUrl
         * @param {Object} params Configuration object
         * @return {String} HTML5 library script Url
         */
        getScriptUrl: function( params ) {
            return params.protocol + '://' + this.getHost(params) + '/p/' + params.partnerId + '/sp/' + params.partnerId + '00/embedIframeJs/uiconf_id/' + params.uiConfId + '/partner_id/' + params.partnerId;
        },
        /**
         * Generate Flash SWF url
         *
         * @method getSwfUrl
         * @param {Object} params Configuration object
         * @return {String} Flash player SWF url
         */
        getSwfUrl: function( params ) {
            var cacheSt = (params.cacheSt) ? '/cache_st/' + params.cacheSt : '';
            var entryId = (params.entryId) ? '/entry_id/' + params.entryId : '';
            return params.protocol + '://' + this.getHost(params) + '/index.php/kwidget' + cacheSt +
                '/wid/' + params.widgetId + '/uiconf_id/' + params.uiConfId + entryId;
        },
        /**
         * Generate attributes object based on configuration
         *
         * @method getAttributes
         * @param {Object} params Configuration object
         * @return {Object} Attributes object
         */
        getAttributes: function( params ) {
            var attrs = {};

            // Add style attribute for dynamic / thumb embeds
            // Or if includeSeoMetadata is true
            if( this.isKWidgetEmbed( params.embedType ) || params.includeSeoMetadata ) {
                attrs['style'] = 'width: ' + params.width + 'px; height: ' + params.height + 'px;';
            }

            // Add Seo attributes
            if( params.includeSeoMetadata ) {
                if( params.embedType == 'legacy' ) {
                    attrs["xmlns:dc"] = "http://purl.org/dc/terms/";
                    attrs["xmlns:media"] = "http://search.yahoo.com/searchmonkey/media/";
                    attrs["rel"] = "media:video";
                    attrs["resource"] = this.getSwfUrl( params );
                } else {
                    attrs['itemprop'] = 'video';
                    attrs['itemscope itemtype'] = 'http://schema.org/VideoObject';
                }
            }

            return attrs;
        },
        /**
         * Generate kWidget object for HTML5 library
         *
         * @method getEmbedObject
         * @param {Object} params Configuration object
         * @return {Object} kWidget object
         */
        getEmbedObject: function( params ) {
            // Used by kWidget.embed
            var embedObject = {
                targetId: params.playerId,
                wid: params.widgetId,
                uiconf_id: params.uiConfId,
                flashvars: params.flashVars
            };
            // Add cacheSt
            if( params.cacheSt ) {
                embedObject['cache_st'] = params.cacheSt;
            }
            // Add entryId
            if( params.entryId ) {
                embedObject['entry_id'] = params.entryId;
            }
            // Transform object into a string
            return JSON.stringify(embedObject, null, 2);
        },
        /**
         * Generate Final Embed Code
         *
         * @method getCode
         * @param {Object} params Configuration object
         * @return {String} HTML embed code
         */
        getCode: function( localParams ) {
            // Set default for params
            var params = (localParams === undefined) ? {} : this.extend({}, localParams);
            // Merge with options
            params = this.extend( params, this.config() );
            // Set widgetId to partnerId if undefined
            if( ! params.widgetId && params.partnerId ) {
                params.widgetId = '_' + params.partnerId;
            }

            this.checkRequiredParams(params); // Check for missing params
            this.checkValidType(params.embedType); // Check if embed type is valid

            // Check if we have a template
            var template = this.getTemplate(params.embedType);
            if( ! template ) {
                throw 'Template: ' + params.embedType + ' is not defined as Handlebars template';
            }

            // Add basic attributes for all embed codes
            var data = {
                host: this.getHost( params ),
                scriptUrl: this.getScriptUrl( params ),
                attributes: this.getAttributes( params )
            };
            // Add SWF Url for flash embeds
            if( params.embedType === 'legacy' ) {
                data['swfUrl'] = this.getSwfUrl( params );
            }
            // Add embed method and embed object for dynamic embeds
            if( this.isKWidgetEmbed( params.embedType ) ) {
                data['embedMethod'] = (params.embedType == 'dynamic') ? 'embed' : 'thumbEmbed';
                data['kWidgetObject'] = this.getEmbedObject( params );
            }
            data = this.extend( data, params );
            return template( data );
        }
    };

// Export module to window object
    window.kEmbedCodeGenerator = EmbedCodeGenerator;

})(this);
