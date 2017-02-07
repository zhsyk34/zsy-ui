+function ($) {
    const key = "page";
    $.fn.page = function (options, param) {
        if (typeof options === "string") {
            return $.fn.page.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            let state = $.data(this, key);
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, key, {
                    options: $.extend({}, $.fn.page.defaults, options)
                });
            }
            init(this);
        });
    };

    function init(target) {
        $(target).html("<nav><ul class=\"pagination\"></ul></nav>");
        //show
        show(target);
        //listen
        event(target);
    }

    function show(target) {
        const options = $(target).page("options");

        const $ul = $(target).find("nav > ul.pagination").empty();

        const
            number = options.number,
            count = options.count = Math.ceil(options.total / options.size),
            least = options.least;

        //
        $ul.append("<li data-index=\"first\"><a href=\"#\">&lt;&lt;</a></li>");
        $ul.append("<li data-index=\"back\"><a href=\"#\">&lt;</a></li>");

        if (count <= least) {
            for (let i = 0; i < count; i++) {
                $ul.append("<li data-index=\"" + (i + 1) + "\"><a href=\"#\">" + (i + 1) + "</a></li>");
            }
        } else {
            const left = number - Math.ceil(least / 2);
            const right = number + Math.ceil(least / 2);
            //because:number >= 1 && number <= count;
            let start = left < 1 ? 1 : right > count ? count - least + 1 : left;
            // console.log("number", number, "left:", left, "right:", right, "==>start:", start);
            if (start > 1) {
                $ul.append("<li data-index=\"apostrophe\"><a href=\"#\">...</a></li>");
            }
            for (let i = 0; i < least; i++) {
                $ul.append("<li data-index=\"" + (start + i) + "\"><a href=\"#\">" + (start + i) + "</a></li>");
            }
            if (count > start + least - 1) {
                $ul.append("<li data-index=\"apostrophe\"><a href=\"#\">...</a></li>");
            }
        }

        //
        $ul.append("<li data-index=\"forward\"><a href=\"#\">&gt;</a></li>");
        $ul.append("<li data-index=\"last\"><a href=\"#\">&gt;&gt;</a></li>");
        //
        $ul.append("<li data-index=\"jump\"><input class=\"form-control\" value=\"" + number + "\"></li>");

        /*-------------------css-------------------*/
        if (options.style) {
            $ul.addClass("pagination-" + options.style);
        }
        //input
        $ul.find("li[data-index=jump] > input").outerHeight($ul.find("li[data-index] > a:first").outerHeight());
        //reset
        $ul.find("li[data-index]").removeClass("active disabled");
        //disabled
        $ul.find("li[data-index=apostrophe]").addClass("disabled");

        if (number === 1) {
            $ul.find("li[data-index=first], li[data-index=back]").addClass("disabled");
        }
        if (number === count) {
            $ul.find("li[data-index=last], li[data-index=forward]").addClass("disabled");
        }
        //active
        $ul.find("li[data-index=" + number + "]").addClass("active");
    }

    function event(target) {
        $(target).on("click", "li[data-index] > a", function (e) {
            e.preventDefault();
        });

        const options = $(target).page("options");
        $(target).on("click." + key, "li[data-index]:not(.disabled)", function () {
            let index = $(this).attr("data-index");
            switch (index) {
                case "first":
                    options.number = 1;
                    break;
                case "back":
                    options.number = Math.max(1, options.number - 1);
                    break;
                case "forward":
                    options.number = Math.min(options.count, options.number + 1);
                    break;
                case "last":
                    options.number = options.count;
                    break;
                case "jump":
                    return false;
                default:
                    options.number = parseInt(index) || 1;
                    break;
            }

            show(target);
            options.change.call(this, options.number, options.size);
        });

        $(target).on("keydown", "li[data-index=jump] input", function (e) {
            if (e.keyCode === 13) {
                const number = parseInt($(this).val());
                if (number && number > 0 && number <= options.count) {
                    options.number = number;
                    show(target);
                }
            }
        });
    }

    $.fn.page.defaults = {
        style: "lg",//lg sm null
        least: 7,
        number: 1,
        size: 5,
        total: 80,
        change: function (number, size) {
            console.log(number, size);
        }
    };

    $.fn.page.methods = {
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
}(jQuery);

$("#data").page();

/*
 var i = 1;
 setInterval(function () {
 $("#data").page("select", i++ % 16 + 1);
 }, 800);
 */
