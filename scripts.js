var editor;

function mediumEditorInit() {
    editor = new MediumEditor('.editable', {
        placeholder: false,
        extensions: {
            'multi_placeholder': new MediumEditorMultiPlaceholders({
                placeholders: [
                    {
                        tag: 'h1',
                        text: 'Title'
                    },
                    {
                        tag: 'p',
                        text: 'Tell your story...'
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

function textProcessing() {
    let el = document.createElement("DIV");
    el.innerHTML = editor.getContent();
    let title = el.querySelector('h1[data-placeholder]');
    el.removeChild(title);
    el.removeChild(el.querySelector('div.medium-insert-buttons'));

    let form = document.querySelector('form[name=add-post]');
    form.querySelector('input[name=post-title]').setAttribute('value', title.innerText.trim());
    form.querySelector('input[name=post-data]').setAttribute('value', el.innerHTML);

    if (title.innerText.trim() != '' && (el.innerText.trim() != '' || el.querySelector('img') != null))
        form.submit();

    return false;
}