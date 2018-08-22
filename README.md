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

## Authentication
Most requests require a OAuth2 token in header. Since GraphiQL cannot attach headers, it is recommended to make
requests using `JavaScript` or `Insomnia`.
