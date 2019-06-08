var contextReembolso,
    web,
    spItemsReembolso,
    position,
    nextPagingInfo,
    previousPagingInfo,
    pageIndex = 1, // default page index value
    pageSize = 20, // default page size value
    listReembolso,
    camlQuery,
    filtro;

function pesquisar() {
    pageIndex = 1;
    pesquisarReembolso(jQuery("#txtTitulo").val());
}

function redirecionarCadastroReembolso() {
    window.location.href = getSiteUrl() + "/SitePages/CadastroReembolso.aspx";
}

function pesquisarReembolso(titulo) {

    contextReembolso= SP.ClientContext.get_current();
    listReembolso = contextReembolso.get_web().get_lists().getByTitle(listaReembolso);
    camlQuery = new SP.CamlQuery();

    //Set the next or back list items collection position
    //First time the position will be null
    camlQuery.set_listItemCollectionPosition(position);
    
    if (titulo !== "") {
        filtro = "<Query><Where>" +
                    "<Contains>" +
                        "<FieldRef Name='Title'/><Value Type='Text'>" + titulo + "</Value>" +
                    "</Contains>" +
                 "</Where></Query>";
    }
    else
        filtro = "";

    // Create a CAML view that retrieves all contacts items  with assigne RowLimit value to the query
    camlQuery.set_viewXml("<View>" +
                             filtro +
                            
                              "<ViewFields>" +
                                     "<FieldRef Name='ID'/>" +
                                     "<FieldRef Name='Title'/>" +
                                     "<FieldRef Name='Solicitante'/>" +
                                     "<FieldRef Name='Valor'/>" +
                                     "<FieldRef Name='Reembolso_x0020_de_x0020_despesa'/>" +                                     
                                "</ViewFields>" +
                             "<RowLimit>" + pageSize + "</RowLimit>"+
                            "</View>");
    
    spItemsReembolso = listReembolso.getItems(camlQuery);

    contextReembolso.load(spItemsReembolso);
    contextReembolso.executeQueryAsync(
            Function.createDelegate(this, onSuccessPesquisarReembolso),
            Function.createDelegate(this, onFailPesquisarReembolso)
        );
}

// This function is executed if the above OM call is successful
// This function render the returns items to html table
function onSuccessPesquisarReembolso() {

    if (spItemsReembolso.get_count() > 0) {

        var urlSite = getSiteUrl() + "/SitePages/VisualizarReembolso.aspx?IDSolicitacao=";

        var listEnumerator = spItemsReembolso.getEnumerator();
        var html = "<table class='table table-striped'><tr><th>Ações</th><th>ID</th><th>Título</th><th>Solicitante</th><th>Valor</th><th>Status</th></tr>";
        var item;
        var Status = "";

        while (listEnumerator.moveNext()) {
            item = listEnumerator.get_current();

            var ID = item.get_item('ID');
            var Title = item.get_item('Title');
            var Solicitante = item.get_item('Solicitante').get_lookupValue();
			var Valor = item.get_item('Valor');
			var Status = tentaRecuperarStatusWorkflow(item.get_item('Reembolso_x0020_de_x0020_despesa'));
			
			
            html = html + "<tr>";
            html = html + "<td valign='top'><a href='" + urlSite + ID + "' title='Visualizar' class='mr10'>Visualizar</a></td>";
            html = html + "<td valign='top'>" + ID + "</td>";
            html = html + "<td valign='top'>" + Title + "</td>";
            html = html + "<td valign='top'>" + Solicitante + "</td>";
            html = html + "<td valign='top'>" + Valor + "</td>";
            html = html + "<td valign='top'>" + Status + "</td>";
            html = html + "</tr>";

        }

        html = html + "</table>";
        jQuery("#content").html(html);
        jQuery(".pager").show();
        managePagerControl();
    }
    else {
        jQuery("#content").html("<p>Nenhuma solicitação encontrada!");
        jQuery(".pager").hide();
    }
        
}

// This function is executed if the above call fails
function onFailPesquisarReembolso(sender, args) {
    alert('Não foi possível recuperar os reembolsos. Erro:' + args.get_message());
}


function tentaRecuperarStatusWorkflow(status)
{
	var statusWorkflow = "";
	try
	{
		statusWorkflow = status.get_description();
	}
	catch(e)
	{
		console.log("Status workflow vazio");
	}
	
	return statusWorkflow;
}

function managePagerControl() {

    if (spItemsReembolso.get_listItemCollectionPosition()) {
        nextPagingInfo = spItemsReembolso.get_listItemCollectionPosition().get_pagingInfo();
    } else {
        nextPagingInfo = null;
    }

    //The following code line shall add page information between the next and back buttons
    jQuery("#pageInfo").html((((pageIndex - 1) * pageSize) + 1) + " - " + ((pageIndex * pageSize) - (pageSize - spItemsReembolso.get_count())));

    previousPagingInfo = "PagedPrev=TRUE&Paged=TRUE&p_ID=" + spItemsReembolso.itemAt(0).get_item('ID');

    if (pageIndex <= 1) {
        jQuery("#btnBack").attr('disabled', 'disabled');
    }
    else {
        jQuery("#btnBack").removeAttr('disabled');
    }

    if (nextPagingInfo) {
        jQuery("#btnNext").removeAttr('disabled');
    }
    else {
        jQuery("#btnNext").attr('disabled', 'disabled');
    }

}
