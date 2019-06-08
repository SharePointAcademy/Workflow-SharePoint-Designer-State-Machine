
// This function prepares, loads, and then executes a SharePoint query to get the current users information
function getUserName() {
    _user = context.get_web().get_currentUser();
    context.load(_user);
    context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}

// This function is executed if the above call is successful
function onGetUserNameSuccess() {
    _userName = _user.get_title();
}

// This function is executed if the above call fails
function onGetUserNameFail(sender, args) {
    alert('Erro ao recuperar o usuário. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
}

function isNull(texto)
{
	if ( texto === null ){
		return "";
	}
	else
		return texto;
}

function getSiteUrl() {
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;//retorna url absoluta do site
    return siteUrl;
}

function getPageName()
{
    var path = window.location.pathname;
    var page = path.split("/").pop();
    return page;
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

function getQueryStringParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function redirecionarListaReembolso() {
    window.location.href = getSiteUrl() + "/SitePages/ListaReembolso.aspx";
}

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    value: function () {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear() +
               pad2(this.getMonth() + 1) +
               pad2(this.getDate()) +
               pad2(this.getHours()) +
               pad2(this.getMinutes()) +
               pad2(this.getSeconds());
    }
});

   
function initializePeoplePicker(peoplePickerElementId, Users) {
    if (typeof (Users) == 'undefined') Users = null;
    // Create a schema to store picker properties, and set the properties.
    var schema = {};
    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = false;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '280px';
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, Users, schema);
}

function exibeLoading()
{
	jQuery('#loading').attr("style", "display:block");
	
}

function escondeLoading()
{
	
	setTimeout(function(){ 	
	
		jQuery('#loading').fadeOut('easy');		
		
  	}, 1000);
  	
}