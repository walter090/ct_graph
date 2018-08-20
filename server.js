const express = require('express');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const fetch = require('node-fetch');

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
  }
  
  type Transaction {
    identifier: String
    customer_id: String
    amount: String
    category: String
    transfer_method: String
    transfer_time: String
  }
  
  type TransactionHistory {
    total_spending: String
    total_income: String
    transfer_methods: String
    transfer_methods_ratio: String
    spending: String
    spending_ratio: String
    last_month_history: [Transaction]
  }
  
  type Query {
    getCustomer(id: String!): Customer
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
        balance: Int
    ): Message
    addTransaction(
        customer_id: String!
        amount: String!
        category: Category!
        transfer_method: Method!
    ): Message
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

const app = express();
app.use(loggingMiddleware);

const root = {
    getCustomer: async ({id}) => {
        const response = await fetch(`http://localhost:8000/customers/${id}/`, {
            method: 'get',
            headers: {'Authorization': token}
        });
        return response.json();
    },
    getTransaction: async ({id}) => {
        const response = await fetch(`http://localhost:8001/transactions/${id}/`, {
            method: 'get',
            headers: {'Authorization': token}
        });
        return response.json();
    },
    addCustomer: async ({
                            username, email, password, first_name,
                            last_name, birth_year, occupation_type, balance
                        }) => {
        const response = await fetch(`http://localhost:8000/customers/`, {
            method: 'post',
            headers: {'Authorization': token, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username, email, password, first_name,
                last_name, birth_year, occupation_type, balance
            })
        });
        return response.json()
    },
    addTransaction: async ({customer_id, amount, category, transfer_method}) => {
        const response = await fetch(`http://localhost:8001/transactions/`, {
            method: 'post',
            headers: {'Authorization': token, 'Content-Type': 'application/json'},
            body: JSON.stringify({customer_id, amount, category, transfer_method})
        });
        return response.json()
    },
};

app.use('/graphql', graphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');
