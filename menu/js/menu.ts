declare const fpeMenuConfig: any;
declare const jQuery: any;

class MenuGeneral {
    private divArr: [{ name: string, input: HTMLInputElement, button: HTMLButtonElement }];
    private selectAccess: HTMLSelectElement;
    private radioTrust: any;

    constructor() {
        this.selectAccess = document.querySelector('#fpe-menuGeneral div[data-update=frontendPostEditor_user_access] select');
        this.selectAccess.addEventListener('change', (e) => this.selectAccessChange(e));

        this.radioTrust = document.querySelectorAll('#fpe-menuGeneral div[data-update=frontendPostEditor_trust_policy] input');
        [].forEach.call(this.radioTrust, (redio) => redio.addEventListener('click', (e) => this.radioTrustClick(e)));

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

    public selectAccessChange(e) {
        this.ajaxUpdate({
            name: this.selectAccess.getAttribute('data-update'),
            data: this.selectAccess.value
        });
    }

    public radioTrustClick(e) {
        this.ajaxUpdate({name:'frontendPostEditor_trust_policy', data:e.target.value});
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