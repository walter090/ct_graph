# ct_graph

## Introduction

The GraphQL interface for accessing [customer](http://customer-pre.us-west-2.elasticbeanstalk.com/)
 and [transaction](http://customer-pre.us-west-2.elasticbeanstalk.com/) APIs.

See documentation in documentation.html

Start the server locally:
```commandline
node server.js
```
The API will be live at http://localhost:4000/graphql

See `message`, `detail`, `error` in returned data to see messages and errors returned from REST APIs. For example,
query

```
{
	getCustomerByUsername(
		username: "no_one"
	){
		identifier
		message
		error
	}
}
```
returns
```json
{
	"data": {
		"getCustomerByUsername": {
			"identifier": null,
			"message": "User does not exist",
			"error": null
		}
	}
}
```

## Authentication
Most requests require a OAuth2 token in header. Since GraphiQL cannot attach headers, it is recommended to make
requests using `JavaScript` or `Insomnia`.
