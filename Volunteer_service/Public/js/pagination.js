(function ($) {
    function Pagination(opts) {
        this.itemsCount = opts.itemsCount;
        this.pageSize = opts.pageSize;
        this.displayPage = opts.displayPage < 5 ? 5 : opts.displayPage;
        this.pages = Math.ceil(opts.itemsCount / opts.pageSize);
        $.isNumeric(opts.pages) && (this.pages = opts.pages);
        this.currentPage = opts.currentPage;
        this.styleClass = opts.styleClass;
        this.onSelect = opts.onSelect;
        this.showCtrl = opts.showCtrl;
        this.remote = opts.remote;
    }

    /* jshint ignore:start */
    Pagination.prototype = {
        //generate the outer wrapper with the config of custom style
        _draw: function () {
            var tpl = '<div class="pagination';
            for (var i = 0; i < this.styleClass.length; i++) {
                tpl += ' ' + this.styleClass[i];
            }
            tpl += '"></div>'
            this.hookNode.html(tpl);
            this._drawInner();
        },
        //generate the true pagination
        _drawInner: function () {
        	if(this.pages <= 1) return;
        	
            var outer = this.hookNode.children('.pagination');
            var tpl = '<ul>' + '<li class="prev' + (this.currentPage - 1 <= 0 ? ' disabled' : ' ') + '"><a href="javascript:;" data="' + (this.currentPage - 1) + '">‹</a></li>';
            if (this.pages <= this.displayPage || this.pages == this.displayPage + 1) {
                for (var i = 1; i < this.pages + 1; i++) {
                    i == this.currentPage ? (tpl += '<li class="active"><a href="javascript:;" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="javascript:;" data="' + i + '">' + i + '</a></li>');
                }
            } else {
                if (this.currentPage < this.displayPage - 1) {
                    for (var i = 1; i < this.displayPage; i++) {
                        i == this.currentPage ? (tpl += '<li class="active"><a href="javascript:;" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="javascript:;" data="' + i + '">' + i + '</a></li>');
                    }
                    tpl += '<li class="dotted"><span>...</span></li>';
                    tpl += '<li><a href="javascript:;" data="' + this.pages + '">' + this.pages + '</a></li>';
                } else if (this.currentPage > this.pages - this.displayPage + 2 && this.currentPage <= this.pages) {
                    tpl += '<li><a href="javascript:;" data="1">1</a></li>';
                    tpl += '<li class="dotted"><span>...</span></li>';
                    for (var i = this.pages - this.displayPage + 2; i <= this.pages; i++) {
                        i == this.currentPage ? (tpl += '<li class="active"><a href="javascript:;" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="javascript:;" data="' + i + '">' + i + '</a></li>');
                    }
                } else {
                    tpl += '<li><a href="javascript:;" data="1">1</a></li>';
                    tpl += '<li class="dotted"><span>...</span></li>';
                    var frontPage,
                        backPage,
                        middle = (this.displayPage - 3) / 2;
                    if ( (this.displayPage - 3) % 2 == 0 ) {
                        frontPage = backPage = middle; 
                    } else {
                        frontPage = Math.floor(middle);
                        backPage = Math.ceil(middle);
                    }
                    for (var i = this.currentPage - frontPage; i <= this.currentPage + backPage; i++) {
                        i == this.currentPage ? (tpl += '<li class="active"><a href="javascript:;" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="javascript:;" data="' + i + '">' + i + '</a></li>');
                    }
                    tpl += '<li class="dotted"><span>...</span></li>';
                    tpl += '<li><a href="javascript:;" data="' + this.pages + '">' + this.pages + '</a></li>';
                }
            }
            tpl += '<li class="next' + (this.currentPage + 1 > this.pages ? ' disabled' : ' ') + '"><a href="javascript:;" data="' + (this.currentPage + 1) + '">›</a></li>' + '</ul>';
            
            if(this.pages > this.displayPage){
                this.showCtrl && (tpl += this._drawCtrl());
            }
            outer.html(tpl);
        },
        //值传递
        _drawCtrl: function () {
            var tpl = '<div>&nbsp;' + '<span>共' + this.pages + '页</span>&nbsp;' + '<span>' + '&nbsp;到&nbsp;' + '<input type="text" class="page-num"/><button class="page-confirm">确定</button>' + '&nbsp;页' + '</span>' + '</div>';
            return tpl;
        },

        _ctrl: function () {
            var self = this,
                pag = self.hookNode.children('.pagination');

            function doPagination() {
                var tmpNum = parseInt(pag.find('.page-num').val());
                if ($.isNumeric(tmpNum) && tmpNum <= self.pages && tmpNum > 0) {
                    if (!self.remote) {
                        self.currentPage = tmpNum;
                        self._drawInner();
                    }
                    if ($.isFunction(self.onSelect)) {
                        self.onSelect.call($(this), tmpNum);
                    }
                }
            }
            pag.on('click', '.page-confirm', function (e) {
                doPagination.call(this)
            })
            pag.on('keypress', '.page-num', function (e) {
                e.which == 13 && doPagination.call(this)
            })
        },

        _select: function () {
            var self = this;
            self.hookNode.children('.pagination').on('click', 'a', function (e) {
                e.preventDefault();
                var tmpNum = parseInt($(this).attr('data'));
                if (!$(this).parent().hasClass('disabled') && !$(this).parent().hasClass('active')) {
                    if (!self.remote) {
                        self.currentPage = tmpNum;
                        self._drawInner();
                    }
                    if ($.isFunction(self.onSelect)) {
                        self.onSelect.call($(this), tmpNum);
                    }
                }
            })
        },

        init: function (opts, hookNode) {
            this.hookNode = hookNode;
            this._draw();
            this._select();
            this.showCtrl && this._ctrl();
            return this;
        },

        updateItemsCount: function (itemsCount, pageToGo) {
            $.isNumeric(itemsCount) && (this.pages = Math.ceil(itemsCount / this.pageSize));
            //如果最后一页没有数据了，返回到剩余最大页数
            this.currentPage = this.currentPage > this.pages ? this.pages : this.currentPage;
            $.isNumeric(pageToGo) && (this.currentPage = pageToGo);
            this._drawInner();
        },

        updatePages: function (pages, pageToGo) {
            $.isNumeric(pages) && (this.pages = pages);
            this.currentPage = this.currentPage > this.pages ? this.pages : this.currentPage;
            $.isNumeric(pageToGo) && (this.currentPage = pageToGo);
            this._drawInner();
        },

        goToPage: function (page) {
            if ($.isNumeric(page) && page <= this.pages && page > 0) {
                this.currentPage = page;
                this._drawInner()
            }
        }
    }
    /* jshint ignore:end */

    var old = $.fn.pagination;
    
    $.fn.pagination = function (options) {
        var opts = $.extend({}, $.fn.pagination.defaults, typeof options == 'object' && options);
        if (typeof options == 'string') {
            args = $.makeArray(arguments);
            args.shift();
        }
        var $this = $(this),
        pag = $this.data('pagination');
        if (!pag) $this.data('pagination', (pag = new Pagination(opts).init(opts, $(this))))
            else if (typeof options == 'string') {
                pag[options].apply(pag, args)
            }
        return pag;
    };

    $.fn.pagination.Constructor = Pagination;

    $.fn.pagination.noConflict = function () {
        $.fn.pagination = old;
        return this
    }

    $.fn.pagination.defaults = {
        pageSize: 10,
        displayPage: 5,
        currentPage: 1,
        itemsCount: 100,
        styleClass: [],
        pages: null,
        showCtrl: false,
        onSelect: null,
        remote: false
    }

})(window.jQuery)
