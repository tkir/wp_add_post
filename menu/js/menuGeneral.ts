declare const fpeMenuConfig: any;
declare const jQuery: any;

class MenuGeneral {
    private divArr: [{ name: string, input: HTMLInputElement, button: HTMLButtonElement }];

    constructor() {
        let arr = document.querySelectorAll('#fpe-menuGeneral div[data-update]');
        this.divArr = [].map.call(arr, (div) => {
            let btn = div.querySelector('button');
            btn.addEventListener('click', (e) => this.btnUpdateClick(e));
            return {
                name: div.getAttribute('data-update'),
                input: div.querySelector('input[type=text]'),
                button: btn
            }
        });

    }

    public btnUpdateClick(e) {
        this.divArr.forEach(div => {
            if (e.target == div.button)
                this.ajaxUpdate({name: div.name, data: div.input.value.trim()});
        });
    }

    private ajaxUpdate(obj: { name: string, data: string }) {
        jQuery.ajax({
            type: "POST",
            url: fpeMenuConfig['ajaxPath'],
            data: {
                action: 'fpe_menuGeneral',
                nonce: fpeMenuConfig['nonce'],
                body: obj
            },
            success: (res) => {
                this.divArr.forEach(div => {
                    if (div.name == res.name)
                        div.input.value = res.data;
                })
            },
            error: (error) => {
                console.error(error.statusText);
            }
        });

    }
}

if (document.querySelector('#fpe-menuGeneral'))
    var menuGeneral = new MenuGeneral();