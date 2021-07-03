function buildFormData(formData : FormData, data : any, parentKey: string = ''): void {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach(key => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = data == null ? '' : data;

        formData.append(parentKey, value);
    }
}

function jsonToFormData(data: object): FormData {
    const formData = new FormData();

    buildFormData(formData, data);

    return formData;
}

export {jsonToFormData};