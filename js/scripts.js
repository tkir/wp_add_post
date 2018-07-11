'use strict';
let editor;

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

function tagHandlerInit() {
    $("#array_tag_handler").tagHandler({
        assignedTags: ['C', 'Perl', 'PHP'],
        availableTags: ['C', 'C++', 'C#', 'Java', 'Perl', 'PHP', 'Python'],
        autocomplete: true
    });
}

function submitClick() {
    let el = document.createElement("DIV");
    el.innerHTML = editor.getContent();
    let title = el.querySelector('h1[data-placeholder]');
    el.removeChild(title);
    el.removeChild(el.querySelector('div.medium-insert-buttons'));

    let form = document.querySelector('form[name=add-post]');
    form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
    form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML);

    if (title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null))
        form.submit();
    else return false;
}

var TagField = (function () {
    function TagField() {
        var _this = this;
        this.tags = [];
        this.tagsAutocomplete = [];
        this.div = document.querySelector('#wp_add_post div[data-tags]');
        this.ul = this.div.querySelector('ul');
        this.input = this.div.querySelector('input[type=text]');
        this.btnPlus = this.div.querySelector('input[type=button]');
        this.divAutocomplete = this.div.querySelector('div[data-autocomplete]');
        this.btnTpl = this.div.querySelector('template[data-template=btnAutocomplete]').content;
        this.btnPlus.addEventListener('click', function () { return _this.addTagClick(); });
        this.input.addEventListener('input', function () { return _this.inputInput(); });
        this.input.addEventListener('keydown', function (e) { return _this.inputKeyDown(e); });
        this.ul.addEventListener('click', function (e) { return _this.removeTag(e); });
    }
    TagField.prototype.getTags = function () {
        return this.tags;
    };
    TagField.prototype.addTagClick = function () {
        this.input.value = this.input.value.trim();
        if (this.input.value.length > 2) {
            this.addTag(this.input.value);
            this.input.value = '';
        }
    };
    TagField.prototype.addTag = function (tag) {
        if (!this.tags.some(function (t) { return t == tag; })) {
            this.liTpl = this.div.querySelector('template[data-template=liTag]')
                .content.cloneNode(true);
            this.liTpl.querySelector('span').innerText = tag;
            this.ul.appendChild(this.liTpl);
            this.tags.push(tag);
        }
    };
    TagField.prototype.inputInput = function () {
        var _this = this;
        var val = this.input.value.trim();
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
    TagField.prototype.inputKeyDown = function (e) {
        if (e.keyCode == 13) {
            this.btnPlus.click();
            e.preventDefault();
        }
        else if (e.keyCode == 8 && this.input.value.trim() == '' && this.tags.length) {
            this.tags.pop();
            this.ul.removeChild(this.ul.lastElementChild);
        }
    };
    TagField.prototype.removeTag = function (e) {
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
    TagField.prototype.setDivAutocomplete = function (tagsAutocomplete) {
        var _this = this;
        this.tagsAutocomplete = tagsAutocomplete;
        tagsAutocomplete.forEach(function (t) {
            var btnAuto = _this.btnTpl.cloneNode(true);
            btnAuto.querySelector('span').innerText = t;
            btnAuto.addEventListener('click', function (e) { return _this.btnAutoClick(e); });
            _this.divAutocomplete.appendChild(btnAuto);
        });
        this.divAutocomplete.classList.add('active');
    };
    TagField.prototype.btnAutoClick = function (e) {
        this.addTag(e.target.innerText);
    };
    return TagField;
}());


let tagField = new TagField();