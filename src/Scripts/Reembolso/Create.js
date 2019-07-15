var reembolso = [];
var attcount = 0;
var arraycount = 0;
var fileArray = []; 
var fileCountCheck = 0;  
var fileNames;

var _itemID;
var _workflowName = 'Reembolso de despesas v2';
var _listID = '259D244E-7CA1-4E50-AF5F-A4FB91F842ED';
var teste;

function validarReembolso()
{
    var titulo = jQuery("#txtTitulo").val();
    if (titulo === "")
    {
        alert("Digite um título");
        return false;
    }

    return true;
}

function criarReembolso() {    

    if (validarReembolso()) {

		exibeLoading();

		jQuery("#divAnexos input:file").each(function () {  
            if (jQuery(this)[0].files[0]) {  
                fileArray.push({ "Attachment": jQuery(this)[0].files[0] });  
            }  
        });  
        arraycount += fileArray.length;
        
        reembolso.push({  
            "Title": jQuery('#txtTitulo').val(),  
            "Solicitante": jQuery('#hdfUserID').val(),  
            "Valor": jQuery('#txtValor').val(),    
            "Files": fileArray  
        });

        jQuery.when(setUserId())
            .done(function (data) {
                criar(reembolso);                
           })
           .fail(function (sender, args) {
               console.log('Erro ao salvar reembolso');
           });
    }
}

function criar() {
	
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listaReembolso);		

    var itemCreateInfo = new SP.ListItemCreationInformation();
    oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('Title', reembolso[0].Title);
    oListItem.set_item('Solicitante', jQuery('#hdfUserID').val());
    oListItem.set_item('Valor', reembolso[0].Valor);
    oListItem.update();

    clientContext.executeQueryAsync(
        Function.createDelegate(this, onQuerySucceededCreate),
        Function.createDelegate(this, onQueryFailedCreate)
    );

    return dfd;
}

function onQuerySucceededCreate(sender, args) {
    
    if (reembolso[0].Files.length != 0) 
    {  

	    var id = oListItem.get_id();
	    teste = oListItem;
	    _itemID = id;	       	    
	    	    
        if (fileCountCheck <= reembolso[0].Files.length - 1) {  
            loopFileUpload(listaReembolso, id, reembolso, fileCountCheck).then(  
                function () {  
                },  
                function (sender, args) {  
                    console.log("Erro no upload");  
                    dfd.reject(sender, args);  
                }  
            );  
        }  
    }  
    else {  
        dfd.resolve(fileCountCheck);  
    } 

    dfd.resolve(sender, args);

}

function onQueryFailedCreate(sender, args) {
    alert('Erro ao criar o reembolso. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
    dfd.reject(sender, args);
}

function loopFileUpload(listaReembolso, id, reembolso, fileCountCheck) {  
    var dfd = jQuery.Deferred();  
    uploadFileHolder(listaReembolso, id, reembolso[0].Files[fileCountCheck].Attachment).then(  
        function (data) {  
            var objcontext = new SP.ClientContext();  
            var targetList = objcontext.get_web().get_lists().getByTitle(listaReembolso);  
            var listItem = targetList.getItemById(id);  
            objcontext.load(listItem);  
            objcontext.executeQueryAsync(function () {  

                fileCountCheck++;  
                if (fileCountCheck <= reembolso[0].Files.length - 1) {  
                    loopFileUpload(listaReembolso, id, reembolso, fileCountCheck);  
                } else {  

                    attcount += fileCountCheck;  
                    if (arraycount == attcount) {  
                    	console.log("Fim do upload"); 
                    	
						//inicia workflow
	    				getWfSubscriptions();
	     
                    	escondeLoading();
                    	redirecionarListaReembolso();                     
                    }  

                }  
            },  
            function (sender, args) {  
                console.log("Recarregar a lista falhou" + args.get_message());  
            });  

        },  
        function (sender, args) {  
            console.log("O upload falhou");  
            dfd.reject(sender, args);  
        }  
   );  
    return dfd.promise();  
}  
  
function uploadFileHolder(listaReembolso, id, file) { 

    var deferred = jQuery.Deferred();  
    var fileName = file.name;  
    getFileBuffer(file).then(  
        function (buffer) {  
            var bytes = new Uint8Array(buffer);  
            var binary = '';  
            for (var b = 0; b < bytes.length; b++) {  
                binary += String.fromCharCode(bytes[b]);  
            }  
            var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";  

 
            jQuery.getScript(scriptbase + "SP.RequestExecutor.js", function () {  
                var createitem = new SP.RequestExecutor(_spPageContextInfo.webServerRelativeUrl);  
                createitem.executeAsync({  
                    url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/GetByTitle('" + listaReembolso + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.name + "')",  
                    method: "POST",  
                    binaryStringRequestBody: true,  
                    body: binary,  
                    success: fsucc,  
                    error: ferr,  
                    state: "Update"  
                });  
                function fsucc(data) {  
                    console.log(data + ' sucesso no upload.');  
                    deferred.resolve(data);  
                }  
                function ferr(data) {  
                    console.log(fileName + "não foi feito upload.");  
                    deferred.reject(data);  
                }  
            });  

        },  
        function (err) {  
            deferred.reject(err);  
        }  
    );  
    return deferred.promise();  
}  
function getFileBuffer(file) {  

    var deferred = jQuery.Deferred();  
    var reader = new FileReader();  
    reader.onload = function (e) {  
        deferred.resolve(e.target.result);  
    }  
    reader.onerror = function (e) {  
        deferred.reject(e.target.error);  
    }  
    reader.readAsArrayBuffer(file);  
    return deferred.promise();  
}


function getUserInfo() {

    // Get the people picker object from the page.
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict.txtSolicitante_TopSpan;
    var users = peoplePicker.GetAllUserInfo();
    return users[0].Key;

}

// Get the user ID.
function setUserId() {

    var solicitante = getUserInfo();

    var context = new SP.ClientContext.get_current();
    this.user = context.get_web().ensureUser(solicitante);
    context.load(this.user);
    context.executeQueryAsync(
        Function.createDelegate(this, ensureUserSuccess),
        Function.createDelegate(this, onFailUser)
    );

    return dfd;
}

function ensureUserSuccess(sender, args) {
    jQuery('#hdfUserID').val(this.user.get_id());
    dfd.resolve(sender, args);
}

function onFailUser(sender, args) {
    console.log('Não foi possível recuperar o usuário: ' + args.get_message());
    dfd.reject(sender, args);
}


function getWfSubscriptions() {

    var restUri = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.WorkflowServices.WorkflowSubscriptionService.Current/EnumerateSubscriptionsByList('" + _listID + "')";
    $.ajax({
        url: restUri,
        type: 'POST',
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        dataType: 'json',
        success: startWorkflow,
        error: showErrorNotification
    });
}


function startWorkflow(sender, args) {
    var itemID = _itemID;
    teste = sender;
    
    for (var i = 0; i < sender.d.results.length; i++) {
        if (sender.d.results[i].Name === _workflowName) {
            var wfSubscription = sender.d.results[i];
            break;
        }
    }

    var initParams = {
        "payload": [{
            "Key": "Idioma",
            "Value": "en-US",
            "ValueType": "Edm.String"
        }]
    };
    
    var restUri = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.WorkflowServices.WorkflowInstanceService.Current/StartWorkflowOnListItemBySubscriptionId(subscriptionId='" + wfSubscription.Id + "',itemId='" + itemID + "')";
    $.ajax({
        url: restUri,
        type: 'POST',
        data: JSON.stringify(initParams),
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        dataType: 'json',
        success: workflowStarted,
        error: showErrorNotification
    });
}

function showErrorNotification(sender, args)
{
	console.log("falha ao iniciar o workflow.");
}

function workflowStarted(sender, args)
{
	console.log("workflow iniciado");
}
