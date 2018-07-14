declare const ajax_config: any;
declare const $: any;
declare const editor: any;

class TagField {
    private form: HTMLFormElement;
    private div: Element;
    private ul: Element;
    private liTpl: HTMLElement;
    private btnTpl: HTMLTemplateElement;
    private input: HTMLInputElement;
    private btnPlus: HTMLButtonElement;
    private divAutocomplete: HTMLDivElement;

    private tags = [];

    public getTags() {
        return this.tags;
    }

    constructor() {
        this.form = document.querySelector('#wp_add_post ');
        this.div = this.form.querySelector('div[data-tags]');
        this.ul = this.div.querySelector('ul');
        this.input = <HTMLInputElement>this.div.querySelector('input[type=text]');
        this.btnPlus = <HTMLButtonElement>this.div.querySelector('[data-btn=btnPlus]');
        this.divAutocomplete = <HTMLDivElement>this.div.querySelector('div[data-autocomplete]');
        this.btnTpl = <HTMLTemplateElement>(<any>this.div.querySelector('template[data-template=btnAutocomplete]'));

        this.btnPlus.addEventListener('click', () => this.addTagClick());
        this.input.addEventListener('input', () => this.inputInput());
        this.input.addEventListener('keydown', (e) => this.inputKeyDown(<KeyboardEvent>e));
        this.ul.addEventListener('click', (e) => this.removeTag(e));
        this.form.querySelector('[data-btn=btnSubmit]').addEventListener('click', () => this.submitClick());
    }

    addTagClick() {
        this.input.value = this.input.value.trim();

        if (this.input.value.length > 2) {
            this.addTag(this.input.value);
        }

        this.removeTagsBtns();
    }

    private addTag(tag) {
        if (!this.tags.some(t => t == tag)) {
            this.liTpl = <HTMLElement>(<HTMLTemplateElement>this.div.querySelector('template[data-template=liTag]'))
                .content.cloneNode(true);
            this.liTpl.querySelector('span').innerText = tag;
            this.ul.appendChild(this.liTpl);
            this.tags.push(tag);
        }
        this.input.value='';
    }

    inputInput() {
        let val = this.input.value.trim();
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
                success: (data) => {
                    this.setDivAutocomplete(data.map(t => t.name));
                },
                error: (error) => {
                    console.error(error.statusText);
                }

            });
        }
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

    removeTag(e: Event) {
        if (!this.tags.length) return;

        let tag: string = (<HTMLElement>e.target).innerText;
        this.tags.splice(this.tags.indexOf(tag), 1);

        let target = <HTMLElement>e.target;
        while (target != document.body) {
            let t = target;
            target = target.parentElement;
            if (target == this.ul)
                this.ul.removeChild(t);
        }
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
        e.preventDefault();
    }

    //form submit
    submitClick() {
        let el = document.createElement("DIV");
        el.innerHTML = editor.getContent();
        let title = <HTMLElement>el.querySelector('h1[data-placeholder]');
        el.removeChild(title);
        el.removeChild(el.querySelector('div.medium-insert-buttons'));

        this.form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
        this.form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML);
        this.form.querySelector('input[name=post-tags]').setAttribute('value', this.tags.join(','));

        if (title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null))
            this.form.submit();
        else return false;
    }
}