import { EditorConfig } from '@ckeditor/ckeditor5-core/src/editor/editorconfig';

const configCKEditor: EditorConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'undo',
            'redo',
            'imageUpload',
            // 'CKFinder',
            'mediaEmbed',
            'blockQuote',
            'insertTable',
            'alignment',
            'code',
            'codeBlock',
            'fontBackgroundColor',
            'fontColor',
            'fontSize',
            'fontFamily',
            'horizontalLine'
        ]
    },
    language: 'ru',
    image: {  // configure image toolbar
        // CKeditor uses the new style buttons
        toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],

        styles: {
            options:[
                // this option is equal to the situation when style is not applied
                'full',

                // style to align-left image
                'alignLeft',

                // style to align-right image
                'alignRight'
            ]
        }
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    licenseKey: '',
    ckfinder: {
        // uploading images to the server using the CKFinder QuickUpload command
        uploadUrl: '/api/upload-image?command=QuickUpload&type=Files&responseType=json'
    },
    mediaEmbed: {
        previewsInData: true
    },
    fontSize: {
        options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
    },
};

export default configCKEditor;
