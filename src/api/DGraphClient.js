import * as dgraph from "dgraph-js-http"

// Create a client stub.
function newClientStub(url) {
  return new dgraph.DgraphClientStub(url);
}

// Create a client.
function newClient(clientStub) {
  return new dgraph.DgraphClient(clientStub);
}

let client;

export const changeURL = (url) => {
  client = newClient(newClientStub(url));
}

const getQueryByType = (types, limit, offset) => `
  query bytype { 
    docs(func: type(Document), orderdesc: Document.createdDate, first: ${limit ?? 10}, offset: ${offset ?? 0}) @filter(${buildOptionalMultipleFilter("Document.type", types)}) { 
       expand(_all_) {
         hash: Document.hash
       }
    }
  }
`

export const buildOptionalMultipleFilter = (predicate, options) => {
  let split = options.split(" ");
  
  let filter = "";
  let append = "";
  for (let option of split) {
    filter = filter + append + `eq(${predicate},${option})`;
    append = " or ";
  }

  return filter;
}

const getQueryByTypeAndHash = (limit, offset, type, hash) => `
{ 
  docs(func: type(Document), orderdesc: Document.createdDate, first: ${limit ?? 10}, offset: ${offset ?? 0}) @filter(${buildOptionalMultipleFilter("Document.type", type)} or ${buildOptionalMultipleFilter("Document.hash", hash)}) {  
     expand(_all_) {
       hash: Document.hash
     }
  }
}
`
const getQueryByHash = (hash, offset) => `
{
    docs(func: type(Document), offset: ${offset}) @filter(${buildOptionalMultipleFilter("Document.hash", hash)}) {
      expand(_all_) {
        hash: Document.hash
        contents {
          expand(_all_)
        }
      }
    }
}
`

const getQueryByLabel = (label, offset) => `
{


  docs(func: type(Document), offset: ${offset}) {
    expand(_all_) {
      hash: Document.hash
      contents {
        expand(_all_)
      }
    }
  }
}
`

const getAllQuery = (limit, offset) => `
{
    docs(func: type(Document), offset: ${offset}, first: ${limit}) {
      expand(_all_) {
        hash: Document.hash
        contents {
          expand(_all_)
        }
      }
    }
}
`

export const queryByType = async (type, limit, offset) => {
  console.log("types", type, );
  const res = await client.newTxn({ readOnly: true })
                          .query(getQueryByType(type, limit, offset));
  return res;
}

export const queryByHash = async (hash, offset) => {
  const res = await client.newTxn({ readOnly: true })
                          .query(getQueryByHash(hash, offset));
  return res;
}

export const queryByTypeAndHash = async (type, hash, limit, offset) => {
  let query = getQueryByTypeAndHash(limit, offset, type, hash);
  
  const res = await client.newTxn({ readOnly: true })
                          .query(query);
  return res;
}

export const queryAll = async (limit, offset) => {
  let query = getAllQuery(limit, offset);
  
  const res = await client.newTxn({ readOnly: true })
                          .query(query);
  return res;
}

export const customQuery = async (query) => {
  const res = await client.newTxn({ readOnly: true })
                          .query(query);

  return res;
}
