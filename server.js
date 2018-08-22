const express = require('express');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const fetch = require('node-fetch');
const API = require('./constants');
const cors = require('cors');
require('url-search-params-polyfill');

const schema = buildSchema(`
  type Customer {
    username: String
    identifier: String
    email: String
    first_name: String
    last_name: String
    birth_year: Int
    occupation_type: String
    balance: String
    transaction_info: TransactionHistory
    detail: String
    error: String
    message: String
  }
  
  type Transaction {
    identifier: String
    customer_id: String
    amount: String
    category: String
    transfer_method: String
    transfer_time: String
    balance_after: String
    detail: String
    error: String
    message: String
  }
  
  type TransactionHistory {
    total_spending: String
    total_income: String
    transfer_methods: String
    transfer_methods_ratio: String
    spending: String
    spending_ratio: String
    last_month_history: [Transaction]
    detail: String
    error: String
    message: String
  }
  
  type Authentication {
    access_token: String
    expires_in: Int
    token_type: String
    error: String
    error_description: String
  }
  
  type Query {
    getCustomer(id: String!): Customer
    getCustomerByUsername(username: String!): Customer
    getTransaction(id: String!): Transaction
  }
  
  enum Occupation {
    MISC
    PROFESSIONAL
    MANAGERIAL
    CLERICAL
    MILITARY
    ELEMENTARY
    TECHNICAL
    SERVICE
    AGRICULTURAL
  }
  
  enum Method {
    ATM
    WIRE
    CHECK
    CARD
    MONEY_ORDER
    ONLINE
  }
  
  enum Category {
    UTILITIES
    GROCERIES
    ENTERTAINMENT
    DINING
    TRAVEL
    MEDICAL
    MISC
    INCOME
  }
  
  type Mutation {
    addCustomer(
        username: String!
        email: String!
        password: String!
        first_name: String!
        last_name: String!
        birth_year: Int!
        occupation_type: Occupation!
    ): Message
    patchCustomer(
        identifier: String!
        username: String
        email: String
        password: String
        first_name: String
        last_name: String
        birth_year: Int
        occupation_type: Occupation
    ): Customer
    addTransaction(
        customer_id: String!
        amount: String!
        category: Category!
        transfer_method: Method!
    ): Message
    getAuthentication(
        username: String!
        password: String!
        client_id: String
        grant_type: String
    ): Authentication
  }
  
  type Message {
    detail: String
    message: String
    error: String
  }
`);

let token = null;

function loggingMiddleware(req, res, next) {
    token = req.headers['authorization'];
    next();
}

const corsOptions = {
    origin(origin, callback) {
        callback(null, true);
    },
    credentials: true
};

const app = express();
app.use(loggingMiddleware);
app.use(cors(corsOptions));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

const root = {
    getCustomer: async ({id}) => {
        const response = await fetch(`${API.CUSTOMER_API_ROOT}customers/${id}/`, {
            method: 'get',
            headers: {'Authorization': token}
        });
        return response.json();
    },
    getCustomerByUsername: async ({username}) => {
        const response = await fetch(`${API.CUSTOMER_API_ROOT}customers/self/?username=${username}`, {
            method: 'get',
            headers: {'Authorization': token}
        });
        return response.json();
    },
    getTransaction: async ({id}) => {
        const response = await fetch(`${API.TRANSACTION_API_ROOT}transactions/${id}/`, {
            method: 'get',
            headers: {'Authorization': token}
        });
        return response.json();
    },
    addCustomer: async ({
                            username, email, password, first_name,
                            last_name, birth_year, occupation_type
                        }) => {
        const response = await fetch(`${API.CUSTOMER_API_ROOT}customers/`, {
            method: 'post',
            headers: {'Authorization': token, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username, email, password, first_name,
                last_name, birth_year, occupation_type
            })
        });
        return response.json()
    },
    patchCustomer: async ({
                              identifier, username, email, password, first_name,
                              last_name, birth_year, occupation_type
                          }) => {
        const response = await fetch(`${API.CUSTOMER_API_ROOT}customers/${identifier}/`, {
            method: 'patch',
            headers: {'Authorization': token, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username, email, password, first_name,
                last_name, birth_year, occupation_type
            })
        });
        return response.json()
    },
    addTransaction: async ({customer_id, amount, category, transfer_method}) => {
        const response = await fetch(`${API.TRANSACTION_API_ROOT}transactions/`, {
            method: 'post',
            headers: {'Authorization': token, 'Content-Type': 'application/json'},
            body: JSON.stringify({customer_id, amount, category, transfer_method})
        });
        return response.json()
    },
    getAuthentication: async ({
                                  username,
                                  password,
                                  client_id = 'qDfWDHvWxfr03cCsEwfO6Bd4MjbB1nAdMTMCPgSu',
                                  grant_type = 'password'
                              }) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        params.append('client_id', client_id);
        params.append('grant_type', grant_type);

        const response = await fetch(`${API.CUSTOMER_API_ROOT}auth/token/`, {
            method: 'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
            body: params
        });
        return response.json()
    },
};

app.use('/graphql', graphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(process.env.PORT || 4000);
