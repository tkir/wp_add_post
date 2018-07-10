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
        var _this = this;
        this.input.value = this.input.value.trim();
        if (this.input.value.length > 2 &&
            !this.tags.some(function (tag) { return tag == _this.input.value; })) {
            this.liTpl = this.div.querySelector('template[data-template=liTag]')
                .content.cloneNode(true);
            this.liTpl.querySelector('span').innerText = this.input.value;
            this.ul.appendChild(this.liTpl);
            this.tags.push(this.input.value);
            this.input.value = '';
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
        console.log(e.innerText);
    };
    return TagField;
}());
