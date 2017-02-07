"use strict";
+function ($) {
    const key = "grid", checked = "checked", selected = "selected";
    const dField = "data-field", dIndex = key + "-index", dCheck = key + "-check";

    // const checkSelected = "td[" + dField + "=" + dCheck + "]";

    $.fn.grid = function (options, param) {
        if (typeof options === "string") {
            return $.fn.grid.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            let state = $.data(this, key);
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, key, {
                    options: $.extend({}, $.fn.grid.defaults, options)
                });
            }
            init(this);
        });
    };

    function init(target) {
        const table = $("<table class=\"table\"><thead></thead><tbody></tbody></tbody></table>");

        $(target).html(table);

        const options = $.data(target, key).options;

        //init style
        $.each(options.tableStyle || [], function (i, value) {
            table.addClass(value);
        });

        //fill head
        head(table.children("thead"), options);
        //fill body
        body(table.children("tbody"), options);

        //event
        event(table, options);
    }

    function cell(options, head = false) {
        const $tr = $("<tr></tr>").data(selected, false);

        const tag = head ? "<th></th>" : "<td></td>";
        if (options.rowIndex) {
            $tr.append($(tag).attr(dField, dIndex));
        }
        if (options.rowCheckbox) {
            $tr.append($(tag).html("<input type=\"checkbox\">").attr(dField, dCheck));
        }
        $.each(options.columns, function (i, map) {
            $tr.append($(tag).attr(dField, map.field));
        });
        return $tr;
    }

    function head(wrapper, options) {
        const $tr = cell(options, true);
        $.each(options.columns, function (index, map) {
            $tr.find("th[" + dField + " ^= " + map.field + "]").text(map.title);
        });
        if (options.singleSelect) {
            $tr.find("th[" + dField + " = " + dCheck + "]").empty();
        }
        wrapper.html($tr);
    }

    function body(wrapper, options) {
        wrapper.empty();//for reload
        if (options.url) {
            $.ajax({
                url: options.url,
                data: options.params,
                type: options.method,
                async: options.async,
                dataType: options.type,
                success: function (data) {
                    load(data);
                }
            });
        } else {
            load(options.data || []);
        }

        function load(data) {
            $.each(data, function (i, row) {
                const $tr = cell(options);

                $tr.find("td[" + dField + "]").each(function () {
                    const field = $(this).attr(dField);
                    $(this).text(dIndex === field ? ++i : row[field]);
                });
                wrapper.append($tr);
            });
        }
    }

    function event(table, options) {
        //clean
        table.off("." + key);

        //1.checkbox
        const single = options.singleSelect;
        //1-1.parent
        table.on("change." + key, "thead th[" + dField + "=" + dCheck + "] :checkbox", function () {
            const flag = $(this).parents("tr").data(selected);
            $(table).find("tr").each(function () {
                $(this).data(selected, !flag);
            });
            checkCss();
        });

        //1-2.children
        table.on("change." + key, "tbody td[" + dField + "=" + dCheck + "] :checkbox", function () {
            if (single) {
                $(table).find("tr").each(function () {
                    $(this).data(selected, false);
                });
            }
            const $tr = $(this).parents("tr");
            $tr.data(selected, !$tr.data(selected));

            checkCss();
        });

        // 2.row
        if (options.clickSelect) {
            table.on("click." + key, "tbody > tr", function (e) {
                if (!$(e.target).is("td[" + dField + "=" + dCheck + "] :checkbox")) {
                    $(this).find("td[" + dField + "=" + dCheck + "] :checkbox").trigger("click");
                    checkCss();
                }
            });
        }

        function checkCss() {
            let parent = true;
            table.find("tbody > tr").each(function () {
                const flag = $(this).data(selected);
                console.log(flag);
                $(this).find("td[" + dField + "=" + dCheck + "] :checkbox").prop(checked, flag);
                if (flag) {
                    $(this).addClass(options.selectedStyle);
                } else {
                    $(this).removeClass(options.selectedStyle);
                }

                parent = parent && flag;
            });

            console.log(parent);
            const head = table.find("thead > tr");
            head.data(selected, parent);
            head.find("th[" + dField + "=" + dCheck + "] :checkbox").prop(checked, parent);
            /*if (parent) {
             head.addClass(options.selectedStyle);
             } else {
             head.removeClass(options.selectedStyle);
             }*/
        }
    }

    $.fn.grid.defaults = {
        tableStyle: ["table-striped", "table-bordered", "table-hover"],
        selectedStyle: "success",
        data: null,

        url: null,
        params: null,
        method: "GET",
        async: true,
        type: "JSON",

        rowIndex: true,
        rowCheckbox: true,

        singleSelect: false,
        clickSelect: true,

    };

    $.fn.grid.methods = {
        options: function (target) {
            return $.data(target[0], key).options;
        },
        reload: function (target, params) {
            const options = this.options(target);
            if (params) {
                options.params = params;
            }
            body(target.find("tbody"), options, cell(options));
        }
    };
}(jQuery);