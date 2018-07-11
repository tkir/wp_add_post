declare const ajax_config: any;
declare const $: any;

class TagField {
    private div: Element;
    private ul: Element;
    private liTpl: HTMLElement;
    private btnTpl: HTMLButtonElement;
    private input: HTMLInputElement;
    private btnPlus: HTMLButtonElement;
    private divAutocomplete: HTMLDivElement;

    private tags = [];
    private tagsAutocomplete = [];

    public getTags() {
        return this.tags;
    }

    constructor() {
        this.div = document.querySelector('#wp_add_post div[data-tags]');
        this.ul = this.div.querySelector('ul');
        this.input = <HTMLInputElement>this.div.querySelector('input[type=text]');
        this.btnPlus = <HTMLButtonElement>this.div.querySelector('input[type=button]');
        this.divAutocomplete = <HTMLDivElement>this.div.querySelector('div[data-autocomplete]');
        this.btnTpl = <HTMLButtonElement>(<any>this.div.querySelector('template[data-template=btnAutocomplete]')).content;

        this.btnPlus.addEventListener('click', () => this.addTagClick());
        this.input.addEventListener('input', () => this.inputInput());
        this.input.addEventListener('keydown', (e) => this.inputKeyDown(<KeyboardEvent>e));
        this.ul.addEventListener('click', (e) => this.removeTag(e));
    }

    addTagClick() {
        this.input.value = this.input.value.trim();

        if (this.input.value.length > 2){
            this.addTag(this.input.value);
            this.input.value = '';
        }
    }

    private addTag(tag){
        if (!this.tags.some(t => t == tag)) {
            this.liTpl = <HTMLElement>(<HTMLTemplateElement>this.div.querySelector('template[data-template=liTag]'))
                .content.cloneNode(true);
            this.liTpl.querySelector('span').innerText = tag;
            this.ul.appendChild(this.liTpl);
            this.tags.push(tag);
        }
    }

    inputInput() {
        let val = this.input.value.trim();

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
        if (e.keyCode == 13) {
            this.btnPlus.click();
            e.preventDefault();
        }
        else if (e.keyCode == 8 && this.input.value.trim() == '' && this.tags.length) {
            this.tags.pop();
            this.ul.removeChild(this.ul.lastElementChild);
        }
    }

    removeTag(e: Event) {
        if (!this.tags.length)return;

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

    private setDivAutocomplete(tagsAutocomplete) {
        this.tagsAutocomplete = tagsAutocomplete;
        tagsAutocomplete.forEach(t => {
            let btnAuto = <Element>this.btnTpl.cloneNode(true);
            btnAuto.querySelector('span').innerText = t;
            btnAuto.addEventListener('click', (e) => this.btnAutoClick(e));
            this.divAutocomplete.appendChild(btnAuto);
        });

        this.divAutocomplete.classList.add('active');
    }

    btnAutoClick(e) {
        this.addTag(e.target.innerText);
    }
}