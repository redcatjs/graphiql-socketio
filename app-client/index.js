import io from 'socket.io-client'
import { Client } from 'graphql-socketio-subscriptions-transport'

import { GRAPHQL_HTTP_PATH, GRAPHQL_WS_PATH } from './config'

var search = window.location.search;
var parameters = {};
search.substr(1).split('&').forEach(function (entry) {
	var eq = entry.indexOf('=');
	if (eq >= 0) {
		parameters[decodeURIComponent(entry.slice(0, eq))] =
		decodeURIComponent(entry.slice(eq + 1));
	}
});

if (parameters.variables) {
	try {
		parameters.variables =
		JSON.stringify(JSON.parse(parameters.variables), null, 2);
	}
	catch (e) {
		// Do nothing, we want to display the invalid JSON as a string, rather
		// than present an error.
	}
}

function onEditQuery(newQuery) {
	parameters.query = newQuery;
	updateURL();
}
function onEditVariables(newVariables) {
	parameters.variables = newVariables;
	updateURL();
}
function onEditOperationName(newOperationName) {
	parameters.operationName = newOperationName;
	updateURL();
}
function updateURL() {
	var newSearch = '?' + Object.keys(parameters).filter(function (key) {
		return Boolean(parameters[key]);
	}).map(function (key) {
		return encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]);
	}).join('&');
	history.replaceState(null, null, newSearch);
}

function graphQLFetcher(graphQLParams) {

	return fetch(GRAPHQL_HTTP_PATH, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(graphQLParams),
	}).then(function (response) {
		return response.text();
	}).then(function (responseBody) {
		try {
			return JSON.parse(responseBody);
		}
		catch (error) {
			return responseBody;
		}
	});
}

import { parse } from 'graphql'
function hasSubscriptionOperation(graphQlParams){
	const queryDoc = parse(graphQlParams.query);
	for (let definition of queryDoc.definitions) {
		if (definition.kind === 'OperationDefinition') {
			const operation = definition.operation;
			if (operation === 'subscription') {
				return true;
			}
		}
	}
	return false;
}


let subscriptionsFetcher;
const socket = io(GRAPHQL_WS_PATH);
socket.on('connect',()=>{
	const client = new Client(socket);


	let activeSubscriptionId = null;
	subscriptionsFetcher = function(graphQLParams){
		if (activeSubscriptionId !== null) {
			client.unsubscribe(activeSubscriptionId);
		}

		if (hasSubscriptionOperation(graphQLParams)) {
			return {
				subscribe: (observer) => {
					observer.next('Your subscription data will appear here after server publication!');
										
					activeSubscriptionId = client.subscribe({
						query: graphQLParams.query,
						variables: graphQLParams.variables,
						id: socket.id,
					},(error,result)=>{
						if (error) {
							//observer.error(error);
							observer.error(JSON.stringify({errors:error}, null, 2));
						}
						else {
							observer.next(result);
						}
					});
				},
			};
		}
		else {
			return graphQLFetcher(graphQLParams);
		}
	}
	
	render();

});

function render(){
	ReactDOM.render(
		React.createElement(GraphiQL, {
			fetcher: subscriptionsFetcher,
			query: parameters.query,
			variables: parameters.variables,
			operationName: parameters.operationName,
			onEditQuery: onEditQuery,
			onEditVariables: onEditVariables,
			onEditOperationName: onEditOperationName
		}),
		document.getElementById('graphiql')
	);
}
