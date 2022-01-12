import { Checkbox, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useImperativeHandle, useState } from "react"
import Flexbox from "./Flexbox";
import TabPanel from "./TabPanel";
import { customQuery } from "../api/DGraphClient";

const getMemberAndConnectios = (members, hashes, maxNodes, offset) => `
{
  hashed as var(func: type(Document)) @filter(eq(Document.hash, [${["\"\""].concat(hashes).reduce((acc, next)=>acc+","+next)}])) {
    expand(_all_) {
      hash: Document.hash
    }
  }

  mem as var (func: type(Member)) @filter(eq(Member.details_member_n, [${["\"\""].concat(members).reduce((acc, next)=>acc+","+next)}])) {
    expand(_all_) {
      hash: Document.hash
    }
  }

  docs(func: uid(hashed, mem), first: ${maxNodes}, offset: ${offset}) {
    expand(_all_) {
      hash: Document.hash
    }
  }
}
`

const getQueryByHash = (hashes, offset) => `
{
    docs(func: type(Document), offset: ${offset}) @filter(eq(Document.hash, [${["\"\""].concat(hashes).reduce((acc, next)=>acc+","+next)}])) {
      expand(_all_) {
        hash: Document.hash
      }
    }
}
`

const MembersPanel = React.forwardRef(({index, tab, classes, configData}, ref) => {

  const [members, setMembers] = useState([]);
  const [ignoredTypes, setIgnoredTypes] = useState(['paid', 'vote', 'memberof']);
  const [hashLoadConnections, setHashLoadConnections] = useState(true);

  const getRows = async (maxNodes, offset) => {

    let res = { data: {} };

    const { byHash } = configData.fetchFilters;
    
    const query = getMemberAndConnectios(members, byHash, maxNodes, offset);

    //console.log(query);

    res = await customQuery(query);

    //Load connections
    let data = res.data.docs;
   
    if (data) {

      let loadedHashes = [];
      let toLoadHashes = [];
      
      const remainingNodes = maxNodes - data.length;
      
      for (let node of data) {
        
        loadedHashes.push(node.hash);

        for (let key in node) {
          if (Array.isArray(node[key])) {
            const connections = node[key];
            if (remainingNodes > toLoadHashes.length &&
                ignoredTypes.find(v => v === key) === undefined) {
              for (let connection of connections) {
                if (loadedHashes.find(v => v === connection.hash) === undefined) {
                  loadedHashes.push(connection.hash);
                  toLoadHashes.push(connection.hash);
                }
              }
            }
          }
        }
      }

      if (toLoadHashes.length > 0) {
        let res2 = { data: { docs: [] } } 

        res2 = await customQuery(getQueryByHash(toLoadHashes, 0));

        if (res2?.data?.docs) {
          res.data.docs = res.data.docs.concat(res2.data.docs);
        }
      }
    }

    return res.data.docs;
  }

  useImperativeHandle(ref, () => ({
    getRows
  }))

  return (
  <TabPanel value={tab} index={index}>
    <Flexbox
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <Autocomplete
        multiple
        freeSolo
        className={classes.autocomplete}
        options={[]}
        onChange={(e, value) => setMembers(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Members"
            placeholder="Member"
          />
        )}
      />
    </Flexbox>
    <Flexbox
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <Autocomplete
        multiple
        freeSolo
        className={classes.autocomplete}
        options={[]}
        onChange={(e, value) => configData.fetchFilters.byHash = value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Document Hashes"
            placeholder="Hash"
          />
        )}
      />
      <Checkbox title="With connections" checked={hashLoadConnections} onChange={(e, clicked) => setHashLoadConnections(clicked)}/>
    </Flexbox>
    <Flexbox
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <Autocomplete
        multiple
        freeSolo
        className={classes.autocomplete}
        options={[]}
        value={ignoredTypes}
        onChange={(e, value) => setIgnoredTypes(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Ignored Types"
            placeholder="Type"
          />
        )}
      />
    </Flexbox>
  </TabPanel>
  );
})

export default MembersPanel;