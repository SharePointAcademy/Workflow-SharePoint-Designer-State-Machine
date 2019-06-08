function obterReembolso(idReembolso)
{    
	exibeLoading();
    // the current context is taken by default here  
    var clientContext = new SP.ClientContext.get_current();

    var lstReembolso = clientContext.get_web().get_lists().getByTitle(listaReembolso);
    this.lstReembolsoItem = lstReembolso.getItemById(idReembolso);
    clientContext.load(lstReembolsoItem);
    clientContext.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceeded), 
        Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceeded() {

	var valor = lstReembolsoItem.get_item('Valor');
	valor = valor.toLocaleString('pt-br', {minimumFractionDigits: 2});
    jQuery("#txtTitulo").val(lstReembolsoItem.get_item('Title'));
	jQuery("#txtSolicitante").val(lstReembolsoItem.get_item('Solicitante').get_lookupValue());
	jQuery("#txtValor").val(valor);
	
	var statusWorkflow = lstReembolsoItem.get_item("Reembolso_x0020_de_x0020_despesa").$1_1;
	mostrarAprovacao(statusWorkflow);
}

function onQueryFailed(sender, args) {
	escondeLoading();
    console.log('Erro ao recuperar o reembolso. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}


function mostrarAprovacao(status)
{
	if(status == "Finalizado")
		jQuery("#divAprovacao").hide();
}


function obterHistorico(idReembolso)
{
    // the current context is taken by default here  
    var clientContextHistorico = new SP.ClientContext.get_current();

    var lstHistorico = clientContextHistorico.get_web().get_lists().getByTitle(listaReembolsoHistorico);
    camlQuery = new SP.CamlQuery();
    
    camlQuery.set_viewXml("<View>" +
                              "<Query>" +
	                             "<Where>" +
	                    			"<Eq>" +
	                        			"<FieldRef Name='IDSolicitacaoReembolso'/><Value Type='Integer'>" + idReembolso + "</Value>" +
	                    			"</Eq>" +
	                 			 "</Where>"+
                 			  "</Query>" +                            
                              "<ViewFields>" +
                                     "<FieldRef Name='ID'/>" +
                                     "<FieldRef Name='Title'/>" +
                                     "<FieldRef Name='StatusSolicitacao'/>" +
                                     "<FieldRef Name='Responsavel'/>" +
									 "<FieldRef Name='Comentario'/>" +
                                "</ViewFields>" +
                            "</View>");
    
    spItemsHistorico = lstHistorico.getItems(camlQuery);

    clientContextHistorico.load(spItemsHistorico);    
    clientContextHistorico.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceededHistorico), 
        Function.createDelegate(this, this.onQueryFailedHistorico));
}

function onQuerySucceededHistorico() {

if (spItemsHistorico.get_count() > 0) {

        var listEnumerator = spItemsHistorico.getEnumerator();
        var html = "<table class='table table-striped'><tr><th>ID</th><th>Título</th><th>Status</th><th>Responsável</th><th>Comentário</th></tr>";
        var item;

        while (listEnumerator.moveNext()) {
            item = listEnumerator.get_current();

            var ID = item.get_item('ID');
            var Title = item.get_item('Title');
            var StatusSolicitacao = item.get_item('StatusSolicitacao');
            var Responsavel = item.get_item('Responsavel');   
            var Comentario = item.get_item('Comentario');          

            html = html + "<tr>";
            html = html + "<td valign='top'>" + ID + "</td>";
            html = html + "<td valign='top'>" + Title + "</td>";
            html = html + "<td valign='top'>" + StatusSolicitacao + "</td>";
            html = html + "<td valign='top'>" + isNull(Responsavel) + "</td>";
            html = html + "<td valign='top'>" + isNull(Comentario) + "</td>";
            
            html = html + "</tr>";

        }

        html = html + "</table>";
        jQuery("#divHistorico").html(html);
    }
    else {
        jQuery("#divHistorico").html("<p>Nenhum histórico cadastrado!</p>");

    }

}

function onQueryFailedHistorico(sender, args) {
	escondeLoading();
    console.log('Erro ao recuperar o historico. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}


function approveTask(statusTarefa){

	var idReembolso = getQueryStringParameter("ID");
	_statusTarefa = statusTarefa;
	
    var clientContextAprovar = SP.ClientContext.get_current();
    var listTask = clientContextAprovar.get_web().get_lists().getByTitle(listaReembolsoTarefas);
    var item = listTask.getItemById(idReembolso);
    item.set_item('PercentComplete',1);
    item.set_item('Status',statusTarefa);
    item.set_item('TaskOutcome',statusTarefa);
    item.update();
    clientContextAprovar.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceededAprovar), 
        Function.createDelegate(this, this.onQueryFailedAprovar));
}

function onQuerySucceededAprovar() {
	var idReembolso = getQueryStringParameter("IDSolicitacao");
	var titulo = "A tarefa ID:" + idReembolso + " foi finalizada com sucesso.";
	criarHistorico(idReembolso, titulo, _statusTarefa, _userName, jQuery("#txtObservacao").val());
	
}

function onQueryFailedAprovar(sender, args) {
    alert('Erro ao aprovar a tarefa. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}


function criarHistorico(idSolicitacao, titulo, status, responsavel, comentario) {
        
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listaReembolsoHistorico);

    var itemCreateInfo = new SP.ListItemCreationInformation();
    oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('IDSolicitacaoReembolso', idSolicitacao);
    oListItem.set_item('Title', titulo);
    oListItem.set_item('StatusSolicitacao', status);
    oListItem.set_item('Responsavel', responsavel);
    oListItem.set_item('Comentario', comentario);
    oListItem.update();

    clientContext.executeQueryAsync(
        Function.createDelegate(this, onQuerySucceededCreate),
        Function.createDelegate(this, onQueryFailedCreate)
    );
}

function onQuerySucceededCreate(sender, args) {
	jQuery("#divAprovacao").hide();
    alert("Tarefa aprovada com sucesso!");
}

function onQueryFailedCreate(sender, args) {
    alert('Erro ao criar o histórico do reembolso. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}


function obterTarefa()
{
    var idTarefa = getQueryStringParameter("ID");

	if(idTarefa != "")
	{
	    var clientContextTarefa = new SP.ClientContext.get_current();
	
	    var lstTarefas = clientContextTarefa.get_web().get_lists().getByTitle(listaReembolsoTarefas);
	    this.lstTarefasItem = lstTarefas.getItemById(idTarefa);
	    clientContextTarefa.load(lstTarefasItem);
	    clientContextTarefa.executeQueryAsync(
	        Function.createDelegate(this, this.onQuerySucceededTarefa), 
	        Function.createDelegate(this, this.onQueryFailedTarefa));
    }
    else
    {
    	jQuery("#divAprovacao").hide();
    }
}

function onQuerySucceededTarefa() {

	var status = lstTarefasItem.get_item('Status');
	if(status == "Aprovada")
		jQuery("#divAprovacao").hide();
}

function onQueryFailedTarefa(sender, args) {
	escondeLoading();
    alert('Erro ao obter a tarefa. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}


function ObterAnexosPorItemID(itemID)
{
	var Requestorurl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('"+listaReembolso+"')/items(" + itemID + ")/AttachmentFiles";  
    ObterAnexos(Requestorurl, function (data) 
    {  
        var results = data.d.results;  
        var htmlStr = "";  
        if (data.d.results.length > 0) {  
            jQuery.each(data.d.results, function () {  
                if (htmlStr === "") {  
                    htmlStr = "<li><a id='attachment' href='" + this.ServerRelativeUrl + "'>" + this.FileName + "</a></li>";  
                }  
                else {  
                    htmlStr = htmlStr + "<li><a id='attachment' href='" + this.ServerRelativeUrl + "'>" + this.FileName + "</a></li>";  
                }  
            });  
        }  
        else { htmlStr = "Esse item não possui anexos."; } 
        
        jQuery('#ulAnexos').html(htmlStr);  
    });
}


function ObterAnexos(siteurl, success, failure) {  
    jQuery.ajax({  
        url: siteurl,  
        method: "GET",  
        headers: { "Accept": "application/json; odata=verbose" },  
        success: function (data) {  
            success(data);  
        },  
        error: function (data) {  
        	escondeLoading();
            failure(data);  
        }  
    });  
}
