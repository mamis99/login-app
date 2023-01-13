import React, { Component, useEffect } from 'react';
import { DocumentEditorContainerComponent, SfdtExport, Selection, Editor, WordExport, Print, Toolbar, CustomToolbarItemModel } from '@syncfusion/ej2-react-documenteditor';
import Cookies from 'universal-cookie';

import { useParams } from 'react-router-dom'
import axios from 'axios';

const cookies = new Cookies();

DocumentEditorContainerComponent.Inject(SfdtExport, Selection, Editor, WordExport, Print, Toolbar)

const user = cookies.get('username');

// class Menu extends React.Component
const Menu = () => {
  let { mode } = useParams();

  let editorObj
  // async componentDidMount() {
  //   // editorObj.spellChecker.languageID = 1033; //LCID of "en-us";
  //   // editorObj.spellChecker.removeUnderline = false;
  //   // editorObj.spellChecker.allowSpellCheckAndSuggestion = true;
  //   // // //Open the document in Document Editor.
  //   // // editorObj.open(sfdt);
  //   // // this.EnforceProtection();
  //   // // this.StopProtection();
  //   // this.container.serviceUrl = this.hostUrl + '/RestrictEditing';
  // }

  let send = () => {
    let revision = editorObj.revisions;
    console.log(revision);
    let datosExtraidos = [];
    revision.changes.map((usuarios, index) => {
      datosExtraidos[index] = {
        autor: usuarios.author
      };
      usuarios.range.map((texto, indexTwo) => {
        //datosExtraidos[indexTwo].data[0]= texto.text || 'No trajo nada'
        console.log(typeof texto);
      });
    });
    console.log(datosExtraidos, '<-----------------Datos extraidos');
  }

  let save = () => {
    // let revision = editorObj.documentEditor.editor.revisions;
    // revision.acceptAll();

    editorObj.documentEditor.save("sample", "Docx")
  }

  let deleteDocument = () => {
    let revision = editorObj.revisions;
    revision.rejectAll();
  }

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

  let onFileChange = (e) => {
    if (e.target.files[0]) {
      console.log(e.target.files[0], '<-------- DOC');
      //Get selected file.
      let file = e.target.files[0];
      //Open sfdt document.
      typeOfDocument(file);
    }
  }

  let typeOfDocument = (file) => {
    if (file.name.substr(file.name.lastIndexOf('.')) === '.sfdt') {
      let fileReader = new FileReader();
      fileReader.onload = e => {
        let contents = e.target.result;
        let proxy = this;
        //Open the document in Document Editor.
        proxy.documenteditor.open(contents);
      };
      //Read the file as text.
      fileReader.readAsText(file);
      editorObj.documentName = file.name.substr(0, file.name.lastIndexOf('.'));
    } else {
      loadFile(file);
    }
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
    let file = await axios({ url: 'https://a3cloud-development.s3.us-west-2.amazonaws.com/syncfussion/sample.docx', method: 'GET', responseType: 'blob' })
    console.log(mode, 'the mode')
    file = file.data

    await loadFile(file)

    mode === 'protected' ?
      enforceProtection() : stopProtection()
  }

  useEffect(() => {
    initiateProcess()
  }, [])

  //Custom toolbar item.
  let toolItem = {
    prefixIcon: "e-de-ctnr-lock",
    tooltipText: "Disable Image",
    text: "Disable Image",
    id: "Custom"
  };
  let items = [
    toolItem,
    'Separator', 'Undo', 'Redo', 'Separator', 'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator', 'Header', 'Footer', 'PageSetup', 'PageNumber', 'Break', 'InsertFootnote', 'InsertEndnote', 'Separator', 'Find', 'Separator', 'Comments', 'Separator', 'Separator', 'FormFields', 'UpdateFields'
  ];

  return (
    <div>
      {/* <button onClick={this.send.bind(this)}>Enviar cambios</button>
      <button onClick={this.save.bind(this)}>Guardar</button>
      <button onClick={this.delete.bind(this)}>Eliminar</button> */}
      {/* <input type='file' id='file_upload' accept='.dotx,.docx,.docm,.dot,.doc,.rtf,.txt,.xml,.sfdt' onChange={onFileChange} /> */}
      <button onClick={exportDocument}>Guardar en linea</button>
      {/* <button onClick={this.restrict.bind(this)}>Restrict</button> */}
      <button onClick={close}>Cerrar Sesión</button>
      {/* <button onClick={enforceProtection}>Iniciar protección</button>
      <button onClick={stopProtection}>Terminar protección</button> */}
      {/* <button onClick={save}>Guardar</button> */}
      <button onClick={()=> { console.log(editorObj.documentEditor.revisions) }}>Revisiones</button>
      


      <DocumentEditorContainerComponent
        id="container"
        height='100vh'
        ref={(scope) => { editorObj = scope; }}
        enableTrackChanges={true} //habilitar la vista de cambios.
        showRevisions={true} //Muestra los cambios de revisión en el documento 
        currentUser={user} //recibe el nombre del usuario.
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
        trackChange={e => { console.log('Prueba de trigger en track change?', e); }}

      />
    </div>
  );
}



export default Menu;
