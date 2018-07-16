'use strict';
var editor;
function mediumEditorInit() {
    editor = new MediumEditor('#fpeForm [data-editor]', {
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
    $(function () {
        $('.editable').mediumInsert({
            editor: editor
        });
    });
}