'use strict';
var editor;
var wp_post;
function mediumEditorInit() {
    editor = new MediumEditor('.editable', {
        placeholder: false,
        extensions: {
            'multi_placeholder': new MediumEditorMultiPlaceholders({
                placeholders: [
                    {
                        tag: 'h1',
                        text: 'Title'
                    },
                    {
                        tag: 'p',
                        text: 'Tell your story...'
                    }
                ]
            })
        }
    });
    $(function () {
        $('.editable').mediumInsert({
            editor: editor
        });
    });
}

var AddPostForm = /** @class */ (function () {
    function AddPostForm() {
        var _this = this;
        this.tags = [];
        this.form = document.querySelector('#wp_add_post ');
        this.div = this.form.querySelector('div[data-tags]');
        this.ul = this.div.querySelector('ul');
        this.input = this.div.querySelector('input[type=text]');
        this.btnPlus = this.div.querySelector('[data-btn=btnPlus]');
        this.divAutocomplete = this.div.querySelector('div[data-autocomplete]');
        this.btnTpl = this.div.querySelector('template[data-template=btnAutocomplete]');
        this.btnPlus.addEventListener('click', function () { return _this.addTagClick(); });
        this.input.addEventListener('input', function () { return _this.inputInput(); });
        this.input.addEventListener('keydown', function (e) { return _this.inputKeyDown(e); });
        this.ul.addEventListener('click', function (e) { return _this.removeTag(e); });
        this.form.querySelector('[data-btn=btnSubmit]').addEventListener('click', function () { return _this.submitClick(); });
        this.form.querySelector('[data-btn=btnCancel]').addEventListener('click', function () { return _this.cancelClick(); });
        this.form.querySelector('[data-btn=btnDraft]').addEventListener('click', function () { return _this.draftClick(); });
        if (wp_post)
            setTimeout(function () { return _this.setPost(); }, 1000);
    }
    AddPostForm.prototype.getTags = function () {
        return this.tags;
    };
    AddPostForm.prototype.addTagClick = function () {
        this.input.value = this.input.value.trim();
        if (this.input.value.length > 2) {
            this.addTag(this.input.value);
        }
        this.removeTagsBtns();
    };
    AddPostForm.prototype.addTag = function (tags) {
        var _this = this;
        var tagArr = tags.split(',');
        tagArr.forEach(function (tag) {
            tag = tag.trim();
            if (!_this.tags.some(function (t) { return t == tag; })) {
                _this.liTpl = _this.div.querySelector('template[data-template=liTag]')
                    .content.cloneNode(true);
                _this.liTpl.querySelector('span').innerText = tag;
                _this.ul.appendChild(_this.liTpl);
                _this.tags.push(tag);
            }
        });
        this.input.value = '';
    };
    AddPostForm.prototype.inputInput = function () {
        var _this = this;
        var val = this.input.value.trim();
        this.removeTagsBtns();
        if (val.length > 2) {
            $.ajax({
                type: "POST",
                url: ajax_config['path'],
                data: {
                    action: 'tag_autocomplete',
                    nonce: ajax_config['nonce'],
                    tag: val
                },
                success: function (data) {
                    _this.setDivAutocomplete(data.map(function (t) { return t.name; }));
                },
                error: function (error) {
                    console.error(error.statusText);
                }
            });
        }
    };
    AddPostForm.prototype.inputKeyDown = function (e) {
        if (e.keyCode == 13 || e.keyCode == 188 || e.keyCode == 191) {
            this.btnPlus.click();
            this.input.focus();
            e.preventDefault();
        }
        else if (e.keyCode == 8 && this.input.value == '' && this.tags.length) {
            this.tags.pop();
            this.ul.removeChild(this.ul.lastElementChild);
        }
    };
    AddPostForm.prototype.removeTag = function (e) {
        if (!this.tags.length)
            return;
        var tag = e.target.innerText;
        this.tags.splice(this.tags.indexOf(tag), 1);
        var target = e.target;
        while (target != document.body) {
            var t = target;
            target = target.parentElement;
            if (target == this.ul)
                this.ul.removeChild(t);
        }
    };
    //добавляем кнопки тегов
    AddPostForm.prototype.setDivAutocomplete = function (tagsAutocomplete) {
        var _this = this;
        tagsAutocomplete.forEach(function (t) {
            var btnAuto = _this.btnTpl.content.cloneNode(true);
            btnAuto.querySelector('span').innerText = t;
            _this.divAutocomplete.appendChild(btnAuto);
        });
        [].forEach.call(this.divAutocomplete.children, function (el) {
            if (el != _this.btnTpl)
                el.addEventListener('click', function (e) { return _this.btnAutoClick(e); });
        });
    };
    //удаляем кнопки предыдущих тегов
    AddPostForm.prototype.removeTagsBtns = function () {
        this.divAutocomplete.innerHTML = '';
        this.divAutocomplete.appendChild(this.btnTpl);
    };
    AddPostForm.prototype.btnAutoClick = function (e) {
        this.addTag(e.target.innerText);
        e.preventDefault();
    };
    //form submit
    AddPostForm.prototype.submitClick = function () {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'publish');
        this.formSubmit();
    };
    AddPostForm.prototype.cancelClick = function () {
        window.history.back();
    };
    AddPostForm.prototype.draftClick = function () {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'draft');
        this.formSubmit();
    };
    AddPostForm.prototype.setPost = function () {
        editor.setContent("\n        <h1 data-placeholder>" + wp_post['post_name'] + "</h1>\n        " + wp_post['post_content'] + "\n        ");
        this.addTag(wp_post['tags_input'].join(','));
    };
    AddPostForm.prototype.formSubmit = function () {
        var el = document.createElement("DIV");
        el.innerHTML = editor.getContent();
        var title = el.querySelector('h1[data-placeholder]');
        el.removeChild(title);
        var divBtns = el.querySelector('div.medium-insert-buttons');
        if (divBtns)
            el.removeChild(divBtns);
        this.form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
        this.form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML);
        this.form.querySelector('input[name=post-tags]').setAttribute('value', this.tags.join(','));
        if (wp_post) {
            this.form.querySelector('input[name=post-id').setAttribute('value', wp_post['ID']);
        }
        if (title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null))
            this.form.submit();
        else
            return false;
    };
    return AddPostForm;
}());


let addPostForm = new AddPostForm();