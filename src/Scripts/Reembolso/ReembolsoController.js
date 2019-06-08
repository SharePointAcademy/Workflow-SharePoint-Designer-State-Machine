'use strict';


var context = SP.ClientContext.get_current();
var _user;
var _userName;
var _statusTarefa;

var listaReembolso = "ReembolsoDespesasv2";
var listaReembolsoHistorico = "ReembolsoDespesasHistoricov2";
var listaReembolsoTarefas = "Tarefas de Reembolso de despesas v2";

var pagina = getPageName();
var dfd = jQuery.Deferred();

// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
jQuery(document).ready(function () {


    if (pagina === "ListaReembolso.aspx") {                

        jQuery("#btnNext").click(function () {
            pageIndex = pageIndex + 1;
            if (nextPagingInfo) {
                position = new SP.ListItemCollectionPosition();
                position.set_pagingInfo(nextPagingInfo);
            }
            else {
                position = null;
            }

            pesquisarReembolso(jQuery("#txtTitulo").val());
        });

        jQuery("#btnBack").click(function () {
            pageIndex = pageIndex - 1;
            position = new SP.ListItemCollectionPosition();
            position.set_pagingInfo(previousPagingInfo);
            pesquisarReembolso(jQuery("#txtTitulo").val());
        });

        pesquisarReembolso(jQuery("#txtTitulo").val());        
    }
    else if (pagina === "CadastroReembolso.aspx") {
        console.log("criar");
    }
    else if (pagina === "VisualizarReembolso.aspx") {
    
	    var idReembolso = getQueryStringParameter("IDSolicitacao");
	    
        obterReembolso(idReembolso);
        obterHistorico(idReembolso);
        ObterAnexosPorItemID(idReembolso);
        
        getUserName();
        obterTarefa();
    }
    else {
        console.log("outra página");
    }

});


