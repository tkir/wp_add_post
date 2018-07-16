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