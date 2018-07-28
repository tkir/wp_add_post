declare const fpeConfig: any;
declare const $: any;
declare var fpe_post: any;
declare const MediumEditor: any;
declare const MediumEditorMultiPlaceholders: any;

interface Array<T> {
    find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T | undefined;
}

class FPE_Form {
    private form: HTMLFormElement;
    private editor: any;
    private divEditorWrapper: HTMLTemplateElement;
    private divTags: Element;
    private ul: Element;
    private liTpl: HTMLElement;
    private btnTpl: HTMLTemplateElement;
    private input: HTMLInputElement;
    private btnPlus: HTMLButtonElement;
    private divAutocomplete: HTMLDivElement;
    private divThumbnail: HTMLDivElement;

    private tags = [];
    private formStr: string;
    private tagTimer: any = null;

    constructor() {
        this.form = document.querySelector('#fpeForm ');
        this.divEditorWrapper = this.form.querySelector('[data-editor-wrapper]');
        this.divTags = this.form.querySelector('div[data-tags]');
        this.ul = this.divTags.querySelector('ul');
        this.input = <HTMLInputElement>this.divTags.querySelector('input[type=text]');
        this.btnPlus = <HTMLButtonElement>this.divTags.querySelector('[data-btn=btnPlus]');
        this.divAutocomplete = <HTMLDivElement>this.divTags.querySelector('div[data-autocomplete]');
        this.btnTpl = <HTMLTemplateElement>(<any>this.divTags.querySelector('template[data-template=btnAutocomplete]'));
        this.divThumbnail = <HTMLDivElement>this.form.querySelector('div[data-thumbnail]');

        this.btnPlus.addEventListener('click', () => this.addTagClick());
        this.input.addEventListener('input', () => this.inputInput());
        this.input.addEventListener('keydown', (e) => this.inputKeyDown(<KeyboardEvent>e));
        this.ul.addEventListener('click', (e) => this.removeTagClick(e));
        this.form.querySelector('[data-btn=btnSubmit]').addEventListener('click', () => this.submitClick());
        this.form.querySelector('[data-btn=btnCancel]').addEventListener('click', () => this.cancelClick());
        this.form.querySelector('[data-btn=btnDraft]').addEventListener('click', () => this.draftClick());
        this.form.querySelector('[data-btn=btnClear]').addEventListener('click', () => this.clearClick());
        this.divThumbnail.querySelector('input[type=file]').addEventListener('change', (e) => this.thumbnailLoaded(e));

        this.formStr = $('#fpeForm').serialize();

        this.checkMediumEditor((err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            this.mediumEditorInit();
            if (typeof fpe_post !== 'undefined') this.setPost();
        });

        setInterval(() => this.autosave(), fpeConfig['asInterval']);
    }

    checkMediumEditor(cb) {
        if (typeof MediumEditor === 'undefined') {
            setTimeout(() => this.checkMediumEditor(cb), 500);
            return;
        }
        cb(null, true);
    }

    mediumEditorInit() {
        let oldEditor = this.form.querySelector('[data-editor-wrapper] > div');
        if (oldEditor) this.divEditorWrapper.removeChild(oldEditor);

        let divEditor = this.divEditorWrapper.querySelector('template').content.cloneNode(true);
        this.divEditorWrapper.appendChild(divEditor);

        this.editor = new MediumEditor('#fpeForm [data-editor]', {
            placeholder: false,
            extensions: {
                'multi_placeholder': new MediumEditorMultiPlaceholders({
                    placeholders: [
                        {
                            tag: fpeConfig['tagTitle'],
                            text: fpeConfig['phTitle']
                        },
                        {
                            tag: fpeConfig['tagBody'],
                            text: fpeConfig['phBody']
                        }
                    ]
                })
            }
        });
        $(() =>
            $('#fpeForm [data-editor]').mediumInsert({editor: this.editor})
        );
    }

    addTagClick() {
        this.input.value = this.input.value.trim();

        if (this.input.value.length > 2) {
            this.addTag(this.input.value);
        }

        this.removeTagsBtns();
    }

    private addTag(tags: string) {
        let tagArr = tags.split(',');
        tagArr.forEach(tag => {
            tag = tag.trim();
            if (!this.tags.some(t => t == tag)) {
                this.liTpl = <HTMLElement>(<HTMLTemplateElement>this.divTags.querySelector('template[data-template=liTag]'))
                    .content.cloneNode(true);
                this.liTpl.querySelector('span').innerText = tag;
                this.ul.appendChild(this.liTpl);
                this.tags.push(tag);
            }
        });

        this.input.value = '';
    }

    inputInput() {
        this.removeTagsBtns();
        this.tagInputDelay(() => this.tagAjax());
    }

    private tagAjax() {
        if (this.input.value.trim() != '') {
            $.ajax({
                type: "POST",
                url: fpeConfig['ajaxPath'],
                data: {
                    action: 'tag_autofill',
                    nonce: fpeConfig['nonce'],
                    tag: this.input.value.trim()
                },
                success: (data) => {
                    this.setDivAutocomplete(data);
                },
                error: (error) => {
                    console.error(error.statusText);
                }

            });
        }
    }

    /**
     * Задержка перед начадом поиска тегов 1с
     */
    private tagInputDelay(cb) {
        if (this.tagTimer) {
            clearTimeout(this.tagTimer);
            this.tagTimer = null;
        }
        this.tagTimer = setTimeout(cb, 1000);
    }

    inputKeyDown(e: KeyboardEvent) {
        if (e.keyCode == 13 || e.keyCode == 188 || e.keyCode == 191) {
            this.btnPlus.click();
            this.input.focus();
            e.preventDefault();
        }
        else if (e.keyCode == 8 && this.input.value == '' && this.tags.length) {
            this.tags.pop();
            this.ul.removeChild(this.ul.lastElementChild);
        }
    }

    removeTagClick(e: Event) {
        if (!this.tags.length) return;

        let tag: string = (<HTMLElement>e.target).innerText;
        this.removeTag(tag);
    }

    private removeTag(tag: string) {
        this.tags.splice(this.tags.indexOf(tag), 1);
        this.ul.removeChild([].find.call(this.ul.children, (li) => li.innerText == tag));
    }

//добавляем кнопки тегов
    private setDivAutocomplete(tagsAutocomplete) {
        tagsAutocomplete.forEach(t => {
            let btnAuto = <Element>this.btnTpl.content.cloneNode(true);
            btnAuto.querySelector('span').innerText = t;
            this.divAutocomplete.appendChild(btnAuto);
        });
        [].forEach.call(this.divAutocomplete.children, el => {
            if (el != this.btnTpl)
                el.addEventListener('click', (e) => this.btnAutoClick(e));
        })
    }

//удаляем кнопки предыдущих тегов
    private removeTagsBtns() {
        this.divAutocomplete.innerHTML = '';
        this.divAutocomplete.appendChild(this.btnTpl);
    }

    btnAutoClick(e) {
        this.addTag(e.target.innerText);
        this.removeTagsBtns();
        e.preventDefault();
    }

    //preview loaded image
    thumbnailLoaded(e) {
        if (!e.target.files || !e.target.files[0]) return;

        let reader = new FileReader();
        reader.onload = () =>
            this.divThumbnail.querySelector('img').src = reader.result;
        reader.readAsDataURL(e.target.files[0]);
    }

    //form submit
    submitClick() {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'pending');
        if (this.setHiddenInput()) {
            this.form.submit();
            this.deleteAutosave();
        }
    }

    cancelClick() {
        this.deleteAutosave();
        window.history.back();
    }

    draftClick() {
        this.form.querySelector('input[name=post-status]').setAttribute('value', 'draft');
        if (this.setHiddenInput()) {
            this.form.submit();
            this.deleteAutosave();
        }
    }

    clearClick() {
        this.mediumEditorInit();
        this.divThumbnail.querySelector('img').src = '';

        let tplTagsArr: string[] = JSON.parse(JSON.stringify(this.tags));
        tplTagsArr.forEach(tag => this.removeTag(tag));

        //reset category selection
        let catOptions = this.form.querySelector('select[name=post-category]').children;
        [].forEach.call(catOptions, (opt) => opt.removeAttribute('selected'));

        this.form.reset();

        this.deleteAutosave();
    }

    //Редактирование поста
    private setPost() {
        this.editor.setContent(`
        <${fpeConfig['fpe_tag_title']} data-placeholder="${fpeConfig['fpe_ph_title']}">${fpe_post['post_title']}</${fpeConfig['fpe_tag_title']}>
        ${fpe_post['post_content']}
        `);

        if (fpe_post['tags_input'] != undefined && fpe_post['tags_input'] != '') this.addTag(fpe_post['tags_input'].join(','));
        if (fpe_post['post-thumb']) this.divThumbnail.querySelector('img').src = fpe_post['post-thumb'];
    }

    private setHiddenInput() {
        let el = document.createElement("DIV");
        el.innerHTML = this.editor.getContent();
        let title = <HTMLElement>el.querySelector('h1[data-placeholder]');
        el.removeChild(title);

        let divBtns = el.querySelector('div.medium-insert-buttons');
        if (divBtns) el.removeChild(divBtns);

        this.form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
        this.form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML.trim());
        this.form.querySelector('input[name=post-tags]').setAttribute('value', this.tags.join(','));

        if (typeof fpe_post !== 'undefined') {
            this.form.querySelector('input[name=post-id').setAttribute('value', fpe_post['ID']);
        }

        return title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null);
    }

    public autosave() {
        if (this.setHiddenInput()) {
            this.form.querySelector('input[name=post-status]').setAttribute('value', 'autosave');

            if (typeof fpe_post !== 'undefined' && fpe_post['post_status'] != 'autosave') {
                this.form.querySelector('input[name=post-parent').setAttribute('value', fpe_post['ID']);
                this.form.querySelector('input[name=post-id').setAttribute('value', '');
            }

            if (this.formStr !== $('#fpeForm').serialize()) {
                this.formStr = $('#fpeForm').serialize();

                let formData = new FormData(this.form);
                console.log('auto');
                $.ajax({
                    type: "POST",
                    url: this.form.getAttribute('action'),
                    data: formData,
                    contentType: false,
                    cache: false,
                    processData: false,
                    success: (res) => {
                        fpe_post = JSON.parse(res)['result'];
                        console.log(fpe_post['ID']);
                    },
                    error: (error) => {
                        console.error(error.statusText);
                    }
                });
            }

        }

    }

    private deleteAutosave() {
        $.ajax({
            type: "POST",
            url: fpeConfig['ajaxPath'],
            data: {
                action: 'del_autosave',
                nonce: fpeConfig['nonce'],
                id: (typeof fpe_post !== 'undefined') ? fpe_post['ID'] : ''
            },
            success: (result) => {
                console.log(result);
            },
            error: (error) => {
                console.error(error.statusText);
            }

        });
    }
}

var fpeForm = new FPE_Form();