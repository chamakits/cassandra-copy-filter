'use strict';

import * as protobufjs from 'protobufjs';
import { auth } from 'cassandra-driver';
import * as cassandra from 'cassandra-driver';
import * as hash from 'object-hash';

var secretData: SecretData = require("./secrets/data.json");

var root = protobufjs.loadSync('./dist/app/hello.proto');


interface AuthInfo { username: string, password: string }
interface ConnectionInfo { clusterIps: string[] }
interface SecretData {
    auth?: AuthInfo,
    connection?: ConnectionInfo
}

interface SomePerson {
    name: string;
    age: number;
    id: number;
}

class SomePersonImpl implements SomePerson {
    constructor(public name: string, public age: number, public id: number) {
    }
    hashCode(): string {
        return hash(this);
    }

}

var client = new cassandra.Client({
    contactPoints: secretData.connection.clusterIps,
    authProvider: authBuild()
});

interface CassPromiseLike {
    then: (accept: Function, reject: Function) => CassPromiseLike;
}

function toPlike(anyIn: any): CassPromiseLike {
    return anyIn as CassPromiseLike;
}

var createKeySpace = `CREATE KEYSPACE IF NOT EXISTS ks1
  WITH REPLICATION = { 
   'class' : 'SimpleStrategy', 
   'replication_factor' : 1 
  };`;

toPlike(client.execute(createKeySpace))
    .then(createTable, failedWith)
    .then(insertBinaryData, failedWith)
    .then(postInsert, failedWith)

function failedWith(err) {
    if (err) {
        console.error("ERROR!!!");
        console.error(err);
        return;
    }
}

function createTable(result): any {
    console.log("Calling create table");
    var query = "CREATE TABLE IF NOT EXISTS ks1.people (person_hash varchar PRIMARY KEY, person_proto blob)";
    return client.execute(query);
}

function insertBinaryData(result): any {
    console.log("calling insertBinaryData");
    var pSomePerson = root.lookupType("hello.SomePerson");
    var somePerson1 = new SomePersonImpl("Omar Ferrer2", 30, 1);
    var binSomePerson1 = pSomePerson.create(somePerson1)
    var buffer = pSomePerson.encode(binSomePerson1).finish();
    return client.execute(
        'INSERT INTO ks1.people(person_hash, person_proto) values(?,?)',
        [somePerson1.hashCode(), buffer]);
}

function postInsert(result): any {
    console.log("Post insert:");
    console.log(result);
    return 1;
}

function authBuild(): auth.PlainTextAuthProvider {
    var authProvider = new auth.Authenticator();
    return new auth.PlainTextAuthProvider(secretData.auth.username, secretData.auth.password);
}