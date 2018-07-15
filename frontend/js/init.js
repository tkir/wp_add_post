'use strict';
var editor;
var wp_post;
function mediumEditorInit() {
    editor = new MediumEditor('.editable', {
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

let fpeForm = new FPE_Form();