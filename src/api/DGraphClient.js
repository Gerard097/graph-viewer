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

const getQueryByType = (limit, offset) => `
  query bytype($value: string!){ 
    typed as var(func: has(hash)) @cascade { 
      content_groups { 
        contents  @filter(eq(label,"type") and anyofterms(value, $value)){ 
          label 
          value 
        } 
      } 
    }
    docs(func: uid(typed), first: ${limit ?? 10}, offset: ${offset ?? 0}){ 
       expand(_all_) {
         hash
         contents {
           expand(_all_)
         }
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
  hashed as var(func: has(hash)) @filter(${buildOptionalMultipleFilter("hash", hash)}) {
    expand(_all_) {
      hash
      contents {
        expand(_all_)
      }
    }
  }
  typed as var(func: has(hash)) @cascade { 
    content_groups { 
      contents  @filter(eq(label,"type") and anyofterms(value, "${type}")){ 
        label 
        value 
      } 
    } 
  }
  docs(func: uid(typed, hashed), first: ${limit ?? 10}, offset: ${offset ?? 0}){ 
     expand(_all_) {
       hash
       contents {
         expand(_all_)
       }
     }
  }
}
`

const getQueryByHash = (hash, offset) => `
{
    docs(func: has(hash), offset: ${offset}) @filter(${buildOptionalMultipleFilter("hash", hash)}) {
      expand(_all_) {
        hash
        contents {
          expand(_all_)
        }
      }
    }
}
`
const getAllQuery = (limit, offset) => `
{
    docs(func: has(hash), offset: ${offset}, first: ${limit}) {
      expand(_all_) {
        hash
        contents {
          expand(_all_)
        }
      }
    }
}
`

export const queryByType = async (type, limit, offset) => {
  
  const res = await client.newTxn({ readOnly: true })
                          .queryWithVars(getQueryByType(limit, offset), 
                                         { "$value": type });
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
