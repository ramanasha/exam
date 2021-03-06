$(document).ready(function () {

    var qlist = $('#qlist').DataTable({
        "processing": false,
        "ajax": {
            "url": "/qlist/qlist",
            "type": "POST"
        },
        columns: [
            { data: 'id', title: "编号", width: "6%" },
            { data: 'item', title: "题目", width: "70%" },
            { data: 'type', title: "题型", width: "6%" },
            { data: 'rank', title: "难度", width: "6%" },
            { data: 'tags', title: "难度", width: "1%", "visible":false  }
        ],
        paging: true,
        searching: true,
        autoWidth: false,
        searchHighlight: true,
        lengthChange: true,
        //"dom": '<"top"i>rt<"bottom"lp><"clear">',
        columnDefs: [{
            targets: 5,
            render: function (data, type, row, meta) {
                var html = '<button type="button" class="btn btn-sm btn-outline-primary btn_update" data-toggle="modal" data-target="#qadd">修改</button>';
                html += ' <button type="button" class="btn btn-sm btn-outline-danger btn_del" data-toggle="modal" data-target="#confirmdel">删除</button>';
                return html;
            }
        },
        { "orderable": false, "targets": 5 },
        ]
    });

    marked.setOptions({
		gfm: true,
		breaks: true,
		latexRender: katex.renderToString.bind(katex)
	});

    

    var qtype = $("#qtype");
    var qrank = $("#qrank");
    var qid = $("#qid");
    var qsave = $("#qsave");
    var qadd = $("#qadd");
    var btn_qadd = $("#btn_qadd");
    var qdel = $("#qdel");
    var question = $("#question");
    var answer = $("#answer");
    var solution = $("#solution");



    btn_qadd.click(function () {
        qid.val("");
    });

    qlist.on('click', '.btn_del', function (e) {
        var data = qlist.row($(this).closest('tr')).data();
        $("#qid").val(data.id);
    });

    qlist.on('click', '.btn_update', function (e) {
        var data = qlist.row($(this).closest('tr')).data();
        $("#qid").val(data.id);
    });

    qadd.on('show.bs.modal', function () {
        if (qid.val() == "") {
            qtype.val(1);
            qrank.val(1);
            question.val("");
            answer.val("");
            solution.val("");
        } else {
            var post_url = "/qlist/qinfo";

            $.ajax({
                url: post_url,
                data: {
                    qid: qid.val()
                },
                type: "POST",
                timeout: 36000,
                dataType: "text",
                success: function (data, textStatus) {
                    var dataJson = eval("(" + data + ")");
                    if (dataJson.code == 200) {
                        qtype.val(dataJson.qtype);
                        qrank.val(dataJson.qrank);
                        question.val(dataJson.item);
                        answer.val(dataJson.answer);
                        solution.val(dataJson.solution);
                        var ret_tags = dataJson.tags;
                        tag_select.val(null).trigger('change');
                        for(var i=0;i<ret_tags.tags.length;i++){
                            var option = new Option(ret_tags.tags[i].tag, ret_tags.tags[i].id, true, true);
                            tag_select.append(option);
                        }
                        tag_select.trigger('change');
                    } else if (dataJson.code == 400) {
                        alert("查询失败！" + dataJson.msg);
                    } else {
                        alert("查询出错！未知错误！");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("error:" + textStatus);
                }
            });
        }
    });

    qsave.click(function () {
        if (qtype.val() == null || qrank.val() == "" || question.val() == "" || answer.val() == "") {
            alert("有*字段不能为空！");
        } else {
            var post_url = "/qlist/qadd";
            if (qid.val() != "") {
                post_url = "/qlist/qupdate";
            }
            var selected_tags = $(".tags").select2('data');
            var tags = "";
            for (var i = 0; i < selected_tags.length; i++) {
                tags = tags + "," + selected_tags[i]["text"];
            }

            $.ajax({
                url: post_url,
                data: {
                    qtype: qtype.val(),
                    qrank: qrank.val(),
                    qid: qid.val(),
                    question: question.val(),
                    answer: answer.val(),
                    solution: solution.val(),
                    tags: tags.substring(1, tags.length)
                },
                type: "POST",
                timeout: 36000,
                dataType: "text",
                success: function (data, textStatus) {
                    var dataJson = eval("(" + data + ")");
                    if (dataJson.code == 200) {
                        alert("保存成功");
                        $("#qadd").modal('hide');
                        qlist.ajax.reload();
                    } else if (dataJson.code == 400) {
                        alert("保存失败！" + dataJson.msg);
                    } else {
                        alert("保存出错！未知错误！");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("error:" + textStatus);
                }
            });
        }
    });

    qdel.click(function () {
        if (qid.val() == "") {
            alert("删除失败！");
        } else {
            var post_url = "/qlist/qdel";

            $.ajax({
                url: post_url,
                data: {
                    qid: qid.val()
                },
                type: "POST",
                timeout: 36000,
                dataType: "text",
                success: function (data, textStatus) {
                    var dataJson = eval("(" + data + ")");
                    if (dataJson.code == 200) {
                        alert("删除成功");
                        $("#confirmdel").modal('hide');
                        qlist.ajax.reload();
                    } else if (dataJson.code == 400) {
                        alert("删除失败！" + dataJson.msg);
                    } else {
                        alert("删除出错！未知错误！");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("error:" + textStatus);
                }
            });
        }
    });

    var tag_select = $(".tags").select2({
        tags: true,
        width: "100%",
        ajax: {
            url: '/qlist/tags',
            delay: 250,
            dataType: 'json'
        }
    });


});
