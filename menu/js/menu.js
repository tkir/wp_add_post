var MenuGeneral = /** @class */ (function () {
    function MenuGeneral() {
        var _this = this;
        var arr = document.querySelectorAll('#fpe-menuGeneral div[data-update]');
        this.divArr = [].map.call(arr, function (div) {
            var btn = div.querySelector('button');
            btn.addEventListener('click', function (e) { return _this.btnUpdateClick(e); });
            return {
                name: div.getAttribute('data-update'),
                input: div.querySelector('input[type=text]'),
                button: btn
            };
        });
    }
    MenuGeneral.prototype.btnUpdateClick = function (e) {
        var _this = this;
        this.divArr.forEach(function (div) {
            if (e.target == div.button)
                _this.ajaxUpdate({ name: div.name, data: div.input.value.trim() });
        });
    };
    MenuGeneral.prototype.ajaxUpdate = function (obj) {
        var _this = this;
        jQuery.ajax({
            type: "POST",
            url: fpeMenuConfig['ajaxPath'],
            data: {
                action: 'fpe_menuGeneral',
                nonce: fpeMenuConfig['nonce'],
                body: obj
            },
            success: function (res) {
                _this.divArr.forEach(function (div) {
                    if (div.name == res.name)
                        div.input.value = res.data;
                });
            },
            error: function (error) {
                console.error(error.statusText);
            }
        });
    };
    return MenuGeneral;
}());
if (document.querySelector('#fpe-menuGeneral'))
    var menuGeneral = new MenuGeneral();
var UserTrust = /** @class */ (function () {
    function UserTrust() {
        var _this = this;
        this.checkBxs = document.querySelectorAll('input[data-user]');
        [].forEach.call(this.checkBxs, function (cBox) { return cBox.addEventListener('change', function (e) { return _this.cBoxChange(e); }); });
    }
    UserTrust.prototype.cBoxChange = function (e) {
        this.ajaxTrustUpdate({ userId: e.target.dataset.user, userTrust: e.target.checked });
    };
    UserTrust.prototype.ajaxTrustUpdate = function (obj) {
        jQuery.ajax({
            type: "POST",
            url: fpeMenuConfig['ajaxPath'],
            data: {
                action: 'fpe_userTrust',
                nonce: fpeMenuConfig['nonce'],
                body: obj
            },
            success: function (res) {
            },
            error: function (error) {
                console.error(error.statusText);
            }
        });
    };
    return UserTrust;
}());
if (document.querySelector('[data-user]'))
    var userTrust = new UserTrust();
