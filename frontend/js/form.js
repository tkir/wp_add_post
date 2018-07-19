var FPE_Form = /** @class */ (function () {
    function FPE_Form() {
        var _this = this;
        this.tags = [];
        this.form = document.querySelector('#fpeForm ');
        this.div = this.form.querySelector('div[data-tags]');
        this.ul = this.div.querySelector('ul');
        this.input = this.div.querySelector('input[type=text]');
        this.btnPlus = this.div.querySelector('[data-btn=btnPlus]');
        this.divAutocomplete = this.div.querySelector('div[data-autocomplete]');
        this.btnTpl = this.div.querySelector('template[data-template=btnAutocomplete]');
        this.divThumbnail = this.form.querySelector('div[data-thumbnail]');
        this.btnPlus.addEventListener('click', function () { return _this.addTagClick(); });
        this.input.addEventListener('input', function () { return _this.inputInput(); });
        this.input.addEventListener('keydown', function (e) { return _this.inputKeyDown(e); });
        this.ul.addEventListener('click', function (e) { return _this.removeTagClick(e); });
        this.form.querySelector('[data-btn=btnSubmit]').addEventListener('click', function () { return _this.submitClick(); });
        this.form.querySelector('[data-btn=btnCancel]').addEventListener('click', function () { return _this.cancelClick(); });
        this.form.querySelector('[data-btn=btnDraft]').addEventListener('click', function () { return _this.draftClick(); });
        this.form.querySelector('[data-btn=btnClear]').addEventListener('click', function () { return _this.clearClick(); });
        this.divThumbnail.querySelector('input[type=file]').addEventListener('change', function (e) { return _this.thumbnailLoaded(e); });
        this.formStr = $('#fpeForm').serialize();
        if (typeof fpe_post !== 'undefined')
            setTimeout(function () { return _this.setPost(); }, 1000);
        // setInterval(() => this.autosave(), fpeConfig['asInterval']);
        setTimeout(function () { return _this.autosave(); }, fpeConfig['asInterval']);
    }
    FPE_Form.prototype.getTags = function () {
        return this.tags;
    };
    FPE_Form.prototype.addTagClick = function () {
        this.input.value = this.input.value.trim();
        if (this.input.value.length > 2) {
            this.addTag(this.input.value);
        }
        this.removeTagsBtns();
    };
    FPE_Form.prototype.addTag = function (tags) {
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
    FPE_Form.prototype.inputInput = function () {
        var _this = this;
        var val = this.input.value.trim();
        this.removeTagsBtns();
        if (val.length > 1) {
            $.ajax({
                type: "POST",
                url: fpeConfig['ajaxPath'],
                data: {
                    action: 'tag_autofill',
                    nonce: fpeConfig['nonce'],
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
    FPE_Form.prototype.inputKeyDown = function (e) {
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
    FPE_Form.prototype.removeTagClick = function (e) {
        if (!this.tags.length)
            return;
        var tag = e.target.innerText;
        this.removeTag(tag);
    };
    FPE_Form.prototype.removeTag = function (tag) {
        this.tags.splice(this.tags.indexOf(tag), 1);
        this.ul.removeChild([].find.call(this.ul.children, function (li) { return li.innerText == tag; }));
    };
    //добавляем кнопки тегов
    FPE_Form.prototype.setDivAutocomplete = function (tagsAutocomplete) {
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
    FPE_Form.prototype.removeTagsBtns = function () {
        this.divAutocomplete.innerHTML = '';
        this.divAutocomplete.appendChild(this.btnTpl);
    };
    FPE_Form.prototype.btnAutoClick = function (e) {
        this.addTag(e.target.innerText);
        this.removeTagsBtns();
        e.preventDefault();
    };
    //preview loaded image
    FPE_Form.prototype.thumbnailLoaded = function (e) {
        var _this = this;
        if (!e.target.files || !e.target.files[0])
            return;
        var reader = new FileReader();
        reader.onload = function () {
            return _this.divThumbnail.querySelector('img').src = reader.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    //form submit
    FPE_Form.prototype.submitClick = function () {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'pending');
        if (this.setHiddenInput()) {
            this.form.submit();
            this.deleteAutosave();
        }
    };
    FPE_Form.prototype.cancelClick = function () {
        this.deleteAutosave();
        window.history.back();
    };
    FPE_Form.prototype.draftClick = function () {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'draft');
        if (this.setHiddenInput()) {
            this.form.submit();
            this.deleteAutosave();
        }
    };
    FPE_Form.prototype.clearClick = function () {
        var _this = this;
        editor.setContent("\n        <" + fpeConfig['fpe_tag_title'] + " data-placeholder=\"" + fpeConfig['fpe_ph_title'] + "\" class=\"medium-editor-placeholder\"><br></" + fpeConfig['fpe_tag_title'] + ">        \n        <" + fpeConfig['tag_body'] + " data-placeholder=\"" + fpeConfig['ph_body'] + "\" class=\"medium-editor-placeholder\"><br></" + fpeConfig['tag_body'] + ">\n        ");
        this.divThumbnail.querySelector('img').src = '';
        var tplTagsArr = JSON.parse(JSON.stringify(this.tags));
        tplTagsArr.forEach(function (tag) { return _this.removeTag(tag); });
        //reset category selection
        var catOptions = this.form.querySelector('select[name=post-category]').children;
        [].forEach.call(catOptions, function (opt) { return opt.removeAttribute('selected'); });
        this.form.reset();
        this.deleteAutosave();
    };
    //Редактирование поста
    FPE_Form.prototype.setPost = function () {
        editor.setContent("\n        <" + fpeConfig['fpe_tag_title'] + " data-placeholder=\"" + fpeConfig['fpe_ph_title'] + "\">" + fpe_post['post_name'] + "</" + fpeConfig['fpe_tag_title'] + ">\n        " + fpe_post['post_content'] + "\n        ");
        if (fpe_post['tags_input'] != undefined && fpe_post['tags_input'] != '')
            this.addTag(fpe_post['tags_input'].join(','));
        if (fpe_post['post-thumb'])
            this.divThumbnail.querySelector('img').src = fpe_post['post-thumb'];
    };
    FPE_Form.prototype.setHiddenInput = function () {
        var el = document.createElement("DIV");
        el.innerHTML = editor.getContent();
        var title = el.querySelector('h1[data-placeholder]');
        el.removeChild(title);
        var divBtns = el.querySelector('div.medium-insert-buttons');
        if (divBtns)
            el.removeChild(divBtns);
        this.form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
        this.form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML.trim());
        this.form.querySelector('input[name=post-tags]').setAttribute('value', this.tags.join(','));
        if (typeof fpe_post !== 'undefined') {
            this.form.querySelector('input[name=post-id').setAttribute('value', fpe_post['ID']);
        }
        return title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null);
    };
    FPE_Form.prototype.autosave = function () {
        if (this.setHiddenInput()) {
            this.form.querySelector('input[name=post-status]').setAttribute('value', 'autosave');
            if (typeof fpe_post !== 'undefined')
                this.form.querySelector('input[name=post-parent').setAttribute('value', fpe_post['ID']);
            if (this.formStr !== $('#fpeForm').serialize()) {
                this.formStr = $('#fpeForm').serialize();
                var formData = new FormData(this.form);
                console.log('auto');
                $.ajax({
                    type: "POST",
                    url: this.form.getAttribute('action'),
                    data: formData,
                    contentType: false,
                    cache: false,
                    processData: false,
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (error) {
                        console.error(error.statusText);
                    }
                });
            }
        }
    };
    FPE_Form.prototype.deleteAutosave = function () {
        $.ajax({
            type: "POST",
            url: fpeConfig['ajaxPath'],
            data: {
                action: 'del_autosave',
                nonce: fpeConfig['nonce'],
                id: (typeof fpe_post !== 'undefined') ? fpe_post['ID'] : ''
            },
            success: function (result) {
                console.log(result);
            },
            error: function (error) {
                console.error(error.statusText);
            }
        });
    };
    return FPE_Form;
}());
var fpeForm = new FPE_Form();
