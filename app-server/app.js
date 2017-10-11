import express from 'express'
import fs from 'fs'

import { DEV, SERVER_PORT, BASE_HREF, PROTOCOL, DOMAIN } from 'app/config'

const app = express();

app.use('/assets',express.static('dist-client'));
app.use('/node_modules/graphiql',express.static('node_modules/graphiql'));


let revision;
function getRevision(){
	if(!revision){
		revision = fs.readFileSync('dist-client/.revision').toString();
	}
	return revision;
}

function asset(uri){
	let x = uri.split('.');
	let e = x.pop();
	x.push(getRevision());
	x.push(e);
	uri = x.join('.');
	if(DEV){
		uri += '?'+Date.now();
	}
	return BASE_HREF+'/assets/'+uri;
}

const layout = ({ entry }) => {
	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>GraphiQL</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		<meta name="apple-mobile-web-app-capable" content="yes">
		
		<base href="${BASE_HREF}">
		
		<style>
			body {
			height: 100%;
			margin: 0;
			width: 100%;
			overflow: hidden;
			}
			#graphiql {
			height: 100vh;
			}
		</style>
		
		<script src="//cdn.jsdelivr.net/es6-promise/4.0.5/es6-promise.auto.min.js"></script>
		<script src="//cdn.jsdelivr.net/fetch/0.9.0/fetch.min.js"></script>
		<script src="//cdn.jsdelivr.net/react/15.4.2/react.min.js"></script>
		<script src="//cdn.jsdelivr.net/react/15.4.2/react-dom.min.js"></script>
		
		<link rel="stylesheet" href="./node_modules/graphiql/graphiql.css" />
		<script src="./node_modules/graphiql/graphiql.js"></script>
		
	</head>
	<body>
		
		<div id="graphiql">Loading...</div>
		
		<script src="${asset('vendor.js')}"></script>
		<script src="${asset(entry+'.js')}"></script>
		
	</body>
</html>`;
};

function makeLayout(client){
	return function(req, res){
		res.send(layout({
			entry: client,
		}));
	};
}



app.get('/', makeLayout('app'));

app.listen(SERVER_PORT);
