import io from 'socket.io-client'
import { Client } from 'graphql-socketio-subscriptions-transport'

import { SubscriptionClient } from 'subscriptions-transport-ws'



import { GRAPHQL_HTTP_PATH, GRAPHQL_WS_PATH } from './config';

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

function graphQLFetcherHTTP(graphQLParams) {

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

let SOCKET_INTERFACE;
SOCKET_INTERFACE = 'subscription-transport-ws';
//SOCKET_INTERFACE = 'socketio';

let networkQuery;
let client;
let activeSubscription = null;
let unsubscribe;

switch(SOCKET_INTERFACE){
	case 'socketio':
		initSocketIo();
	break;
	case 'subscription-transport-ws':
	default:		
		initSubscriptionTransportWs();
	break;
}

function handleError(observer, error){
	observer.error(JSON.stringify({errors:error}, null, 2))
}


function initSubscriptionTransportWs(){
	const WS_PATH = 'ws://'+GRAPHQL_WS_PATH.replace('http://','').replace('https://','')+'/subscriptions';
	client = new SubscriptionClient(WS_PATH, {
		reconnect: true,
	});
	networkQuery = (observer, data)=>{
		return client.request(data).subscribe((result)=>{
			console.log('result',result);
			observer.next(result);
		},(error)=>{
			handleError(observer,error);
		});
	};
	render();
}

function initSocketIo(){

	const socket = io(GRAPHQL_WS_PATH);
	client = new Client(socket);
	
	networkQuery = (observer, data)=>{
		return client.subscribe({
			...data,
			id: socket.id
		}, (...args)=>{
			networkCallback(observer, ...args);
		});
	};

	socket.on('connect',()=>{
		render();
	});
}

function networkCallback(observer, error,result){
	if (error) {
		handleError(observer,error);
	}
	else {
		observer.next(result);
	}
}


function subscriptionsFetcher(graphQLParams){
	if (activeSubscription) {
		activeSubscription = false;
		unsubscribe();
	}

	if (hasSubscriptionOperation(graphQLParams)) {
		return {
			subscribe: (observer) => {
				observer.next('Your subscription data will appear here after server publication!');
				
				activeSubscription = true;
				
				let unsubscribtion = networkQuery(observer, {
					query: graphQLParams.query,
					variables: graphQLParams.variables,
				});
				
				if(typeof(unsubscribtion)=='object'){ //ws
					unsubscribe = function(){
						unsubscribtion.unsubscribe();
					};
				}
				else{ //socketio
					unsubscribe = function(){
						client.unsubscribe(unsubscribtion);
					};
				}
				
			},
		};
	}
	else {
		return graphQLFetcherHTTP(graphQLParams);
	}
}

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
