import React, {FC} from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Event from '@ckeditor/ckeditor5-utils/src/eventinfo';
import configCKEditor from "./configCKEditor";


export interface ClassicCKeditorComponentProps {
    value: string,
    onChange: (data: string) => void,
    placeholder?: string,
}

const ClassicCKeditorComponent: FC<ClassicCKeditorComponentProps> = ({value, onChange, placeholder}) => {
    return (
        <CKEditor
            editor={ClassicEditor}
            config={Object.assign({}, configCKEditor, {placeholder: placeholder})}
            data={value}
            onChange={(event: Event, editor: ClassicEditor) => onChange(editor.getData())}
        />
    )
}

export default ClassicCKeditorComponent;