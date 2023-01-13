import React, { Component, useEffect } from 'react';
import { DocumentEditorContainerComponent, SfdtExport, Selection, Editor, WordExport, Print, Toolbar, CustomToolbarItemModel } from '@syncfusion/ej2-react-documenteditor';
import Cookies from 'universal-cookie';

import { useParams } from 'react-router-dom'
import axios from 'axios';

const cookies = new Cookies();

DocumentEditorContainerComponent.Inject(SfdtExport, Selection, Editor, WordExport, Print, Toolbar)

const user = cookies.get('username');

// class Individual extends React.Component
const Individual = () => {
    let { mode } = useParams();

    let editorObj

    let exportDocument = async () => {
        // await stopProtection()
        //Download the document in sfdt format.
        // editorObj.save('sample', 'Sfdt');
        // editorObj.docusave('sample', 'Docx');
        editorObj.documentEditor.saveAsBlob('Docx').then(async exportedDocument => {
            console.log(exportedDocument, '<----------------BLOB');
            if (mode === 'unprotected') await enforceProtection()
            await saveFileAWS(exportedDocument)
            if (mode === 'unprotected') await stopProtection()
        });
    }

    let saveFileAWS = async (file) => {
        let ajax = new XMLHttpRequest();
        ajax.open('POST', 'https://localhost:7003/api/SaveAWS', true);
        ajax.onreadystatechange = () => {
            if (ajax.readyState === 4) {
                if (ajax.status === 200 || ajax.status === 304) {
                    // open SFDT text in document editor
                    // editorObj.documentEditor.open(ajax.responseText);
                    alert("successfully")
                } else {
                    alert("No hay respuesta del backend");
                }
            }
        };
        let formData = new FormData();
        formData.append('files', file);
        await ajax.send(formData);
    }

    let close = () => {
        cookies.remove('id', { path: "/" });
        cookies.remove('name', { path: "/" })
        cookies.remove('username', { path: "/" });
        cookies.remove('password', { path: "/" });
        window.location.href = './';
    }

    let loadFile = async (file) => {
        let ajax = new XMLHttpRequest();
        ajax.open('POST', 'https://localhost:7003/api/Import', true);
        ajax.onreadystatechange = () => {
            if (ajax.readyState === 4) {
                if (ajax.status === 200 || ajax.status === 304) {
                    // open SFDT text in document editor
                    editorObj.documentEditor.open(ajax.responseText);
                } else {
                    alert("No hay respuesta del backend");
                }
            }
        };
        let formData = new FormData();
        formData.append('files', file);
        ajax.send(formData);
    }

    let enforceProtection = async () => {
        console.log("enforce protection")
        //enforce protection
        await editorObj.documentEditor.editor.enforceProtection('123', 'RevisionsOnly');
    }

    let stopProtection = async () => {
        console.log('stop protection')
        //stop the document protection
        await editorObj.documentEditor.editor.stopProtection('123');
    }

    let initiateProcess = async () => {
        let file = await axios({ url: 'https://a3cloud-development.s3.us-west-2.amazonaws.com/syncfussion/NDA+Prueba.docx', method: 'GET', responseType: 'blob' })
        file = file.data

        await loadFile(file)

        //To handle custom toolbar click event.
        editorObj.toolbarClick = (args) => {
            console.log(args)
            switch (args.item.id) {
                case 'save-aws':
                    exportDocument()
            }
        };
    }

    useEffect(() => {
        initiateProcess()
    }, [])

    //Custom toolbar item.
    let toolItem = {
        prefixIcon: "e-save",
        tooltipText: "Disable Image",
        text: "Save",
        id: "save-aws",

    };

    let items = [
        'Separator', 'Undo', 'Redo', 'Separator', 'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator', 'Header', 'Footer', 'PageSetup', 'PageNumber', 'Break', 'InsertFootnote', 'InsertEndnote', 'Separator', 'Find', 'Separator', 'Comments', 'Separator', 'Separator', 'FormFields', 'UpdateFields', 'Separator', toolItem,
    ];

    return (
        <div>
            {/* <button onClick={this.send.bind(this)}>Enviar cambios</button>
      <button onClick={this.save.bind(this)}>Guardar</button>
      <button onClick={this.delete.bind(this)}>Eliminar</button> */}
            {/* <input type='file' id='file_upload' accept='.dotx,.docx,.docm,.dot,.doc,.rtf,.txt,.xml,.sfdt' onChange={onFileChange} /> */}
            {/* <button onClick={exportDocument}>Guardar en linea</button> */}
            {/* <button onClick={this.restrict.bind(this)}>Restrict</button> */}
            {/* <button onClick={close}>Cerrar Sesión</button> */}
            {/* <button onClick={enforceProtection}>Iniciar protección</button>
      <button onClick={stopProtection}>Terminar protección</button> */}
            {/* <button onClick={save}>Guardar</button> */}
            {/* <button onClick={() => { console.log(editorObj.documentEditor.revisions) }}>Revisiones</button> */}



            <DocumentEditorContainerComponent
                id="container"
                height='100vh'
                ref={(scope) => { editorObj = scope; }}
                // enableTrackChanges={true} //habilitar la vista de cambios.
                // showRevisions={true} //Muestra los cambios de revisión en el documento 
                // currentUser={user} //recibe el nombre del usuario.
                serviceUrl='https://localhost:7003/api/'
                toolbarItems={items}
                isReadOnly={false}
                // restrictEditing={false}
                //enableBookmarkDialog={true}
                //enableBordersAndShadingDialog={true}
                //enableContextMenu={true}
                enableEditor={true}
                //enableEditorHistory={true}
                //enableFontDialog={false}
                //enableHyperlinkDialog={true}
                //enableImageResizer={true}
                //enableListDialog={true}
                //enableOptionsPane={true}
                //enablePageSetupDialog={true}
                //enableParagraphDialog={true}
                enablePrint={true}
                //enableSearch={true}
                //enableSelection={true}
                enableSfdtExport={true}
                //enableStyleDialog={true}
                //enableTableDialog={true}
                //enableTableOfContentsDialog={true}
                //enableTableOptionsDialog={true}
                //enableTablePropertiesDialog={true}
                enableTextExport={true}
                enableWordExport={true}
                // restrictEditing={false}
                documentChange={e => { console.log('Prueba de trigger', e); }}
            // trackChange={e => { console.log('Prueba de trigger en track change?', e); }}

            />
        </div>
    );
}



export default Individual;
