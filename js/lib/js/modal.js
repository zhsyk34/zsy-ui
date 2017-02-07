"use strict";
+function ($) {
    const key = "modal";
    $.fn.modal = function (options, param) {
        if (typeof options === "string") {
            return $.fn.modal.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            let state = $.data(this, key);
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, key, {
                    options: $.extend({}, $.fn.modal.defaults, options)
                });
            }
            init(this);
        });
    };

    function init(target) {
        //exist
        let $wrapper = $(target).parents(".modal");
        if ($wrapper.length) {
            console.log("haven create");
            $wrapper.find(".modal-header, .modal-footer").remove();
        } else {
            $wrapper = $("<div class=\"modal\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-body\"></div></div></div></div>");
            $wrapper.appendTo($(document.body)).find(".modal-body").append(target);
        }

        const $body = $wrapper.find(".modal-body");

        // const $wrapper = $("<div class=\"modal\"><div class=\"modal-dialog\"><div class=\"modal-content\"></div></div></div>").appendTo($(document.body));
        // const $body = $("<div class=\"modal-body\"></div>").appendTo($wrapper.find(".modal-content"));
        // $(target).unwrap().appendTo($body);

        const options = $.data(target, key).options;

        //header
        if (options.header) {
            const $header = $("<div class=\"modal-header\"></div>").insertBefore($body);
            if (options.dismiss) {
                $header.append("<button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span>");
            }
            const $title = $("<h4 class=\"modal-title\"></h4>").appendTo($header);
            if (options.title) {
                $title.text(options.title);
            }
        }

        //footer
        if (options.footer) {
            const $footer = $("<div class=\"modal-footer\"></div>").insertAfter($body);
            if (options.buttons) {
                $.each(options.buttons, function (index, value) {
                    switch (value) {
                        case "sure":
                            $footer.append("<button type=\"button\" data-button=\"" + value + "\" class=\"btn btn-primary\">确定</button>");
                            break;
                        case "cancel":
                            $footer.append("<button type=\"button\" data-button=\"" + value + "\" class=\"btn btn-danger\">取消</button>");
                            break;
                    }
                });
            }
        }

        if (options.mask) {
            if ($(document.body).children(".modal-backdrop").length === 0) {
                //TODO:share the backdrop,if share it uuid isn't necessary
            }

            if (options.uuid) {
                console.log("haven generator uuid");
            } else {
                options.uuid = uuid();
                const $backdrop = $("<div class=\"modal-backdrop\"></div>").attr("data-uuid", options.uuid).appendTo($(document.body)).hide();
                //css
                if (options.fade) {
                    $backdrop.addClass("fade");
                }
            }
        }

        //css
        if (options.fade) {
            $wrapper.addClass("fade");
        }

        //offset
        const $content = $wrapper.find("div.modal-content");
        options.top && $content.css("top", options.top);
        options.left && $content.css("left", options.left);

        //event
        $wrapper.on("mousedown." + key, "button[data-dismiss]", function () {
            $(document).one("mouseup." + key, function () {
                options.show = false;
                view(target);
            });
        });

        $wrapper.on("click." + key, ".modal-footer button[data-button=cancel]", function () {
            options.show = false;
            view(target);
        });

        view(target);
    }

    function findBackdrop() {
        //TODO
    }

    function view(target) {
        const options = $.data(target, key).options;
        const $wrapper = $(target).parents(".modal");
        const $mask = $(document.body).children(".modal-backdrop[data-uuid=" + options.uuid + "]");

        const $modals = $(document.body).find(".modal:visible");//last modal

        console.log("length:", $modals.length);

        let $modal = $modals.last(), maxIndex = parseInt($modal.css("zIndex"));

        $modals.each(function (index, elem) {
            let curIndex = parseInt($(this).css("zIndex"));
            console.log(index, maxIndex, curIndex);
            if (curIndex > maxIndex) {
                $modal = $(elem);
            }
        });
        // $modals.hide();

        if (options.show) {
            $(document.body).addClass("modal-open");
            show($wrapper);
            // $mask.length && show($mask);
        } else {
            if ($(document.body).find(".modal:visible").length < 2) {
                $(document.body).removeClass("modal-open");
            }
            hide($wrapper);
            $mask.length && hide($mask);
        }

        function show(element) {
            element.show().scrollTop(0);
            //noinspection BadExpressionStatementJS
            element[0].offsetWidth;//force reflow
            element.addClass("in");
        }

        function hide(element) {
            element.hide().removeClass("in");
        }
    }

    $.fn.modal.defaults = {
        header: true,
        title: "title",
        dismiss: true,

        footer: true,
        buttons: ["cancel", "sure"],

        show: true,
        top: 0,
        left: 0,
        fade: true,
        mask: true,
        keyboard: false,
        backdrop: false
    };

    $.fn.modal.methods = {
        options: function (target) {
            return $.data(target[0], key).options;
        },
        select: function (target, number) {
            const options = this.options(target);
            options.number = Math.min(options.count, number);
            show(target);
            options.change.call(this, options.number, options.size);
        }
    };

    /*alert*/
    $.alert = function (param) {
        const options = {
            title: "alert",
            dismiss: false,
            show: true,
            zIndex: 9999,
            buttons: ["cancel"],
            content: null
        };

        const $wrapper = $(".modal-alert");
        if ($wrapper.length === 0) {

        }
        $wrapper.length > 0 && $wrapper.remove();

        let target = $(".modal-content-alert");
        if (target.length === 0) {
            target = $("<div class=\"modal-alert\"></div>").appendTo($(document.body));
            target.parents(".modal").addClass("");
        } else {
            target.parents(".modal").remove();
        }

        if (typeof param === "object") {
            target.modal($.extend(options, param));
        } else {
            target.modal(options);
        }

        if (typeof param === "string" || typeof param === "number") {
            return target.text(param.content || "");
        }
    };

    /* confirm */
    $.confirm = function (param) {
        var options = {
            header: null,
            zIndex: 9999,
            buttons: ["sure", "cancel"],
            width: 240,
            height: 80,
            top: 200
        };
        var target = $(".modal-confirm-info").length > 0 ? $(".modal-confirm-info") : $("<div class='modal-confirm-info'></div>").appendTo("body");

        var state = $.data(target[0], "modal");

        if (typeof param == "object") {
            $.extend(options, state ? state.options || {} : {}, param)
        } else {
            $.extend(options, state ? state.options || {} : {});
        }

        target.modal(options);

        target.parents(".modal").addClass("modal-confirm");

        if (typeof param == "string" || typeof param == "number") {
            return target.text(param).modal("open");
        }
    }

    function uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}(jQuery);


