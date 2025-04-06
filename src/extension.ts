import * as vscode from 'vscode';
import * as ws from 'ws';
import * as yaml from 'js-yaml';

type FieldType = keyof typeof fieldProperties;
type FieldProperty = {
    properties: string[];
    fieldType: string;
    defaultDataType?: string;
    displayType: string;
};

const displayTypes = [
    'tab_break', 'section_break', 'column_break', 'textbox', 
    'textbox.row-4', 'textbox.row-8', 'fileoption', 'display_field',
    'hidden', 'dropdown', 'checkbox', 'radiobutton', 'info_pane',
    'groupbox', 'card', 'imgcapture', 'vidcapture', 'liveness.readout',
    'geoloc', 'datebox'
];

const dataTypes = [
    'PHONE', 'EMAIL', 'int', 'float', 'str', 'FILE', 
    'datetime.date', 'list:str'
];

const baseProperties = [
    'name',
    'alias',
    'displayType',
    'dataType',
    'defaultValue',
    'required',
    'description',
    'title',
    'notation',
    'internalOnly',
    'sequence',
    'hidden',
    'editable',
    'parameters',
    'meta',
    'verifyHandler',
    'fileName'
];

const fieldProperties: Record<string, FieldProperty> = {
    'textbox': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'str',
        displayType: 'textbox'
    },
    'textarea_small': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'str',
        displayType: 'textbox.row-4'
    },
    'textarea_big': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'str',
        displayType: 'textbox.row-8'
    },
    'file_upload': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'FILE',
        displayType: 'fileoption'
    },
    'text': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'str',
        displayType: 'display_field'
    },
    'date': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'datetime.date',
        displayType: 'datebox'
    },
    'dropdown': {
        properties: baseProperties,
        fieldType: 'simple',
        displayType: 'dropdown'
    },
    'checkbox': {
        properties: baseProperties,
        fieldType: 'simple',
        displayType: 'checkbox'
    },
    'radio': {
        properties: baseProperties,
        fieldType: 'simple',
        displayType: 'radiobutton'
    },
    'info_pane': {
        properties: [...baseProperties, 'fields'],
        fieldType: 'compound',
        displayType: 'info_pane'
    },
    'group': {
        properties: [...baseProperties, 'fields'],
        fieldType: 'group',
        displayType: 'groupbox'
    },
    'card': {
        properties: [...baseProperties, 'fields'],
        fieldType: 'compound',
        displayType: 'card'
    },
    'photo_capture': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'FILE',
        displayType: 'imgcapture'
    },
    'video_capture': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'FILE',
        displayType: 'vidcapture'
    },
    'captcha': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'list:str',
        displayType: 'liveness.readout'
    },
    'geolocation': {
        properties: [...baseProperties, 'fields'],
        fieldType: 'compound',
        defaultDataType: 'str',
        displayType: 'geoloc'
    },
    'digilocker': {
        properties: baseProperties,
        fieldType: 'simple',
        defaultDataType: 'str',
        displayType: 'text'
    },
    'section_break': {
        properties: baseProperties,
        fieldType: 'layout',
        defaultDataType: 'str',
        displayType: 'section_break'
    },
    'tab_break': {
        properties: baseProperties,
        fieldType: 'layout',
        defaultDataType: 'str',
        displayType: 'tab_break'
    },
    'column': {
        properties: [...baseProperties, 'fields'],
        fieldType: 'layout',
        defaultDataType: 'str',
        displayType: 'column_break'
    }
};

export function activate(context: vscode.ExtensionContext) {
    const completionProvider = vscode.languages.registerCompletionItemProvider('lyik', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            const match = linePrefix.match(/^\s*/);
            const indentation = match ? match[0].length : 0;
            const completions = new vscode.CompletionList();

            // Root level - only show form snippet
            if (indentation === 0) {
                const formSnippet = {
                    label: 'form',
                    insertText: new vscode.SnippetString('form:\n  name: "${1:formName}"\n  fields:'),
                    documentation: 'Create a new form'
                };
                const item = new vscode.CompletionItem(formSnippet.label, vscode.CompletionItemKind.Snippet);
                item.insertText = formSnippet.insertText;
                item.documentation = formSnippet.documentation;
                completions.items.push(item);
            }

            // Property completions for nested fields
            if (indentation >= 4) {
                const prevLines = document.getText(new vscode.Range(0, 0, position.line, 0)).split('\n');
                const fieldTypeLine = prevLines.reverse().find(line => line.match(/\s*-\s*(\w+):/));

                if (fieldTypeLine) {
                    const typeMatch = fieldTypeLine.match(/\s*-\s*(\w+):/);
                    if (typeMatch) {
                        const type = typeMatch[1];
                        const fieldDef = fieldProperties[type];
                        if (fieldDef) {
                            const props = fieldDef.properties;
                            props.forEach((prop: string) => {
                                const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
                                if (prop === 'displayType') {
                                    item.insertText = new vscode.SnippetString(`${prop}: \${1|${displayTypes.join(',')}|}`);
                                } else if (prop === 'dataType') {
                                    item.insertText = new vscode.SnippetString(`${prop}: \${1|${dataTypes.join(',')}|}`);
                                } else if (prop === 'required' || prop === 'internalOnly' || prop === 'hidden' || prop === 'editable') {
                                    item.insertText = new vscode.SnippetString(`${prop}: \${1|true,false|}`);
                                } else {
                                    item.insertText = new vscode.SnippetString(`${prop}: \${1}`);
                                }
                                completions.items.push(item);
                            });
                        }
                    }
                }
            }

            // ...existing code for field snippets...

            if (linePrefix.match(/\s*fields:\s*$/) || linePrefix.match(/\s*-\s*$/)) {
                const fieldSnippets = [
                    {
                        label: 'textbox',
                        insertText: new vscode.SnippetString('- textbox:\n    name: "${1:fieldName}"\n    displayType: "textbox"\n    dataType: "str"\n    label: "${2:label}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'textarea',
                        insertText: new vscode.SnippetString('- textarea:\n    name: "${1:fieldName}"\n    displayType: "textbox.row-4"\n    dataType: "str"\n    label: "${2:label}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'date',
                        insertText: new vscode.SnippetString('- date:\n    name: "${1:fieldName}"\n    displayType: "datebox"\n    dataType: "datetime.date"\n    label: "${2:label}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'file',
                        insertText: new vscode.SnippetString('- file:\n    name: "${1:fieldName}"\n    displayType: "fileoption"\n    dataType: "FILE"\n    label: "${2:label}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'dropdown',
                        insertText: new vscode.SnippetString('- dropdown:\n    name: "${1:fieldName}"\n    displayType: "dropdown"\n    dataType: "${2|str,int,float|}"\n    label: "${3:label}"\n    required: ${4|true,false|}'),
                    },
                    {
                        label: 'checkbox',
                        insertText: new vscode.SnippetString('- checkbox:\n    name: "${1:fieldName}"\n    displayType: "checkbox"\n    dataType: "${2|str,int,bool|}"\n    label: "${3:label}"\n    required: ${4|true,false|}'),
                    },
                    {
                        label: 'radio',
                        insertText: new vscode.SnippetString('- radio:\n    name: "${1:fieldName}"\n    displayType: "radiobutton"\n    dataType: "${2|str,int|}"\n    label: "${3:label}"\n    required: ${4|true,false|}'),
                    },
                    {
                        label: 'section',
                        insertText: new vscode.SnippetString('- section_break:\n    name: "${1:sectionName}"\n    displayType: "section_break"\n    title: "${2:Section Title}"'),
                    },
                    {
                        label: 'tab',
                        insertText: new vscode.SnippetString('- tab_break:\n    name: "${1:tabName}"\n    displayType: "tab_break"\n    title: "${2:Tab Title}"'),
                    },
                    {
                        label: 'column',
                        insertText: new vscode.SnippetString('- column:\n    name: "${1:columnName}"\n    displayType: "column_break"\n    fields:\n      - '),
                    },
                    {
                        label: 'card',
                        insertText: new vscode.SnippetString('- card:\n    name: "${1:cardName}"\n    displayType: "card"\n    title: "${2:Card Title}"\n    fields:\n      - '),
                    },
                    {
                        label: 'group',
                        insertText: new vscode.SnippetString('- group:\n    name: "${1:groupName}"\n    displayType: "groupbox"\n    title: "${2:Group Title}"\n    fields:\n      - '),
                    },
                    {
                        label: 'photo',
                        insertText: new vscode.SnippetString('- photo_capture:\n    name: "${1:photoField}"\n    displayType: "imgcapture"\n    dataType: "FILE"\n    label: "${2:Take Photo}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'video',
                        insertText: new vscode.SnippetString('- video_capture:\n    name: "${1:videoField}"\n    displayType: "vidcapture"\n    dataType: "FILE"\n    label: "${2:Record Video}"\n    required: ${3|true,false|}'),
                    },
                    {
                        label: 'captcha',
                        insertText: new vscode.SnippetString('- captcha:\n    name: "${1:captchaField}"\n    displayType: "liveness.readout"\n    dataType: "list:str"\n    label: "${2:Verify Captcha}"\n    required: true'),
                    },
                    {
                        label: 'geolocation',
                        insertText: new vscode.SnippetString('- geolocation:\n    name: "${1:locationField}"\n    displayType: "geoloc"\n    dataType: "str"\n    label: "${2:Location}"\n    fields:\n      - text:\n          name: "lat"\n      - text:\n          name: "long"'),
                    }
                ];

                fieldSnippets.forEach(snippet => {
                    const item = new vscode.CompletionItem(snippet.label, vscode.CompletionItemKind.Snippet);
                    item.insertText = snippet.insertText;
                    completions.items.push(item);
                });
            }

            return completions;
        }
    });

    // Register trigger character provider
    const triggerProvider = vscode.languages.registerCompletionItemProvider('lyik', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const completions = new vscode.CompletionList();
            const linePrefix = document.lineAt(position).text.substr(0, position.character);

            if (linePrefix.endsWith(':')) {
                const prevLines = document.getText(new vscode.Range(0, 0, position.line, 0)).split('\n');
                const fieldType = prevLines.reverse().find(line => line.match(/\s*-\s*(input|email):/));

                if (fieldType) {
                    const match = fieldType.match(/(input|email)/);
                    if (!match) {
                        return completions; // Return early if no match is found
                    }
                    const type = match[0] as keyof typeof fieldProperties;
                    const props = fieldProperties[type].properties;

                    props.forEach((prop: string) => {
                        const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
                        completions.items.push(item);
                    });
                }
            }

            return completions;
        }
    }, ':');

    // Register preview command
    let previewCommand = vscode.commands.registerCommand('lyik.showPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const panel = vscode.window.createWebviewPanel(
                'lyikPreview',
                'Form Preview',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            const updatePreview = () => {
                const text = editor.document.getText();
                try {
                    const formData = yaml.load(text) as any;
                    panel.webview.html = generatePreviewHtml(formData);
                } catch (e) {
                    panel.webview.html = `<div class="error">Invalid YAML: ${e}</div>`;
                }
            };

            updatePreview();

            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.uri.toString() === editor.document.uri.toString()) {
                    updatePreview();
                }
            });

            panel.onDidDispose(() => {
                changeDocumentSubscription.dispose();
            });
        }
    });

    context.subscriptions.push(completionProvider, triggerProvider, previewCommand);
}

function generatePreviewHtml(formData: any): string {
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: 500; }
                input, textarea, select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 100%; }
                .section-break { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                .tab-break { border-bottom: 2px solid #eee; margin: 15px 0; }
                .column-break { display: inline-block; vertical-align: top; padding: 0 10px; }
                .card { border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin: 10px 0; }
                .group { border: 1px dashed #ccc; padding: 15px; margin: 10px 0; }
                .info-pane { background: #e8f4f8; padding: 10px; border-radius: 4px; margin: 10px 0; }
                .photo-capture, .video-capture { border: 2px dashed #ccc; padding: 20px; text-align: center; }
                .radio-group, .checkbox-group { margin: 10px 0; }
                .radio-group label, .checkbox-group label { display: inline-block; margin-right: 15px; }
            </style>
        </head>
        <body>
            <form>`;

    if (formData && formData.form) {
        html += `<h2>${formData.form.name || 'Form Preview'}</h2>`;
        
        if (formData.form.fields) {
            html += generateFieldsHtml(formData.form.fields);
        }
    }

    html += `
            </form>
            <script>
                // Add any required client-side functionality here
            </script>
        </body>
        </html>`;

    return html;
}

function generateFieldsHtml(fields: any[]): string {
    let html = '';
    
    fields.forEach((field: any) => {
        const fieldType = Object.keys(field)[0];
        const fieldData = field[fieldType];
        
        switch (fieldType) {
            case 'textbox':
                html += `
                    <div class="form-group">
                        <label for="${fieldData.name}">${fieldData.label || fieldData.name}</label>
                        <input type="text" 
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            ${fieldData.required ? 'required' : ''}
                            ${fieldData.defaultValue ? `value="${fieldData.defaultValue}"` : ''}
                        >
                    </div>`;
                break;
                
            case 'textarea':
                html += `
                    <div class="form-group">
                        <label for="${fieldData.name}">${fieldData.label || fieldData.name}</label>
                        <textarea 
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            rows="${fieldData.displayType === 'textbox.row-8' ? '8' : '4'}"
                            ${fieldData.required ? 'required' : ''}
                        >${fieldData.defaultValue || ''}</textarea>
                    </div>`;
                break;
                
            case 'date':
                html += `
                    <div class="form-group">
                        <label for="${fieldData.name}">${fieldData.label || fieldData.name}</label>
                        <input type="date"
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            ${fieldData.required ? 'required' : ''}
                            ${fieldData.defaultValue ? `value="${fieldData.defaultValue}"` : ''}
                        >
                    </div>`;
                break;
                
            case 'dropdown':
                html += `
                    <div class="form-group">
                        <label for="${fieldData.name}">${fieldData.label || fieldData.name}</label>
                        <select 
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            ${fieldData.required ? 'required' : ''}
                        >
                            <option value="">Select...</option>
                        </select>
                    </div>`;
                break;
                
            case 'checkbox':
                html += `
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox"
                                id="${fieldData.name}"
                                name="${fieldData.name}"
                                ${fieldData.required ? 'required' : ''}
                                ${fieldData.defaultValue === 'true' ? 'checked' : ''}
                            >
                            ${fieldData.label || fieldData.name}
                        </label>
                    </div>`;
                break;
                
            case 'radio':
                html += `
                    <div class="form-group radio-group">
                        <label>${fieldData.label || fieldData.name}</label>
                        <div>
                            <label>
                                <input type="radio"
                                    name="${fieldData.name}"
                                    ${fieldData.required ? 'required' : ''}
                                > Option 1
                            </label>
                        </div>
                    </div>`;
                break;
                
            case 'section_break':
                html += `
                    <div class="section-break">
                        <h3>${fieldData.title || fieldData.name}</h3>
                    </div>`;
                break;
                
            case 'tab_break':
                html += `
                    <div class="tab-break">
                        <h3>${fieldData.title || fieldData.name}</h3>
                    </div>`;
                break;
                
            case 'card':
                html += `
                    <div class="card">
                        <h4>${fieldData.title || fieldData.name}</h4>
                        ${fieldData.fields ? generateFieldsHtml(fieldData.fields) : ''}
                    </div>`;
                break;
                
            case 'group':
                html += `
                    <div class="group">
                        <h4>${fieldData.title || fieldData.name}</h4>
                        ${fieldData.fields ? generateFieldsHtml(fieldData.fields) : ''}
                    </div>`;
                break;
                
            case 'photo_capture':
                html += `
                    <div class="form-group photo-capture">
                        <label for="${fieldData.name}">${fieldData.label || 'Take Photo'}</label>
                        <input type="file"
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            accept="image/*"
                            capture="environment"
                            ${fieldData.required ? 'required' : ''}
                        >
                    </div>`;
                break;
                
            case 'video_capture':
                html += `
                    <div class="form-group video-capture">
                        <label for="${fieldData.name}">${fieldData.label || 'Record Video'}</label>
                        <input type="file"
                            id="${fieldData.name}"
                            name="${fieldData.name}"
                            accept="video/*"
                            capture="environment"
                            ${fieldData.required ? 'required' : ''}
                        >
                    </div>`;
                break;
                
            case 'geolocation':
                html += `
                    <div class="form-group">
                        <label>${fieldData.label || 'Location'}</label>
                        <div>
                            <input type="text" readonly placeholder="Latitude" name="${fieldData.name}_lat">
                            <input type="text" readonly placeholder="Longitude" name="${fieldData.name}_long">
                        </div>
                    </div>`;
                break;
        }
    });
    
    return html;
}