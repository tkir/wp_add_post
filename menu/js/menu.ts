declare const fpeMenuConfig: any;
declare const jQuery: any;

class MenuGeneral {
    private divArr: [{ name: string, input: HTMLInputElement, button: HTMLButtonElement }];
    private selects: any;
    private radioTrust: any;

    constructor() {
        this.selects = document.querySelectorAll('#fpe-menuGeneral select');
        [].forEach.call(this.selects, (select) => select.addEventListener('change', (e) => this.selectChange(e)));

        this.radioTrust = document.querySelectorAll('#fpe-menuGeneral div[data-update=frontendPostEditor_trust_policy] input');
        [].forEach.call(this.radioTrust, (radio) => radio.addEventListener('click', (e) => this.radioTrustClick(e)));

        let arr = document.querySelectorAll('#fpe-menuGeneral div[data-update]');
        this.divArr = [].map.call(arr, (div) => {
            let btn = div.querySelector('button');
            if (!btn) return;
            btn.addEventListener('click', (e) => this.btnUpdateClick(e));
            return {
                name: div.getAttribute('data-update'),
                input: div.querySelector('input[type=text]'),
                button: btn
            }
        });

    }

    public selectChange(e) {
        this.ajaxUpdate({
            name: e.target.getAttribute('data-update'),
            data: e.target.value
        })
    }

    public radioTrustClick(e) {
        this.ajaxUpdate({name: 'frontendPostEditor_trust_policy', data: e.target.value});
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
            },
            error: (error) => {
                console.error(error.statusText);
            }
        });

    }
}

if (document.querySelector('#fpe-menuGeneral'))
    var menuGeneral = new MenuGeneral();

class UserTrust {
    private checkBxs;

    constructor() {
        this.checkBxs = document.querySelectorAll('input[data-user]');
        [].forEach.call(this.checkBxs, (cBox) => cBox.addEventListener('change', (e) => this.cBoxChange(e)));
    }

    cBoxChange(e) {
        this.ajaxTrustUpdate({userId: e.target.dataset.user, userTrust: +e.target.checked});
    }

    private ajaxTrustUpdate(obj: { userId: number, userTrust: number }) {
        jQuery.ajax({
            type: "POST",
            url: fpeMenuConfig['ajaxPath'],
            data: {
                action: 'fpe_userTrust',
                nonce: fpeMenuConfig['nonce'],
                body: obj
            },
            success: (res) => {
            },
            error: (error) => {
                console.error(error.statusText);
            }
        });

    }
}

if (document.querySelector('[data-user]'))
    var userTrust = new UserTrust();