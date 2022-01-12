import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useImperativeHandle } from "react"
import Flexbox from "./Flexbox";
import TabPanel from "./TabPanel";

import { queryAll, queryByHash, queryByType, queryByTypeAndHash } from '../api/DGraphClient';

export const DocumentTypes = [
  "Dho",
  "Dao",
  "Member",
  "Settings",
  "Timeshare",
  "Alert",
  "Assignment",
  "Payout",
  "Role",
  "Badge",
  "Period",
  "Payment",
  "Vote",
  "VoteTally"
]

const Panel = React.forwardRef(({index, tab, classes, configData}, ref) => {

  const getRows = async (maxNodes, offset) => {
    
    const { byType, byHash } = configData.fetchFilters;

    let res = { data: {} };

    try {
      //Conver array to a single string
      //must add a dummy element " " otherwise it will crash 
      //since reduce is not allowed on empty arrays
      const types = [" "].concat(byType).reduce((acc, c) => acc = acc + " " + c).trim();

      const hashes = [" "].concat(byHash).reduce((t, c) => t = t + " " + c).trim();

      if (byType.length > 0 && byHash.length > 0) {
        res = await queryByTypeAndHash(types, hashes, maxNodes, offset);
      }
      else if (byType.length > 0) {
        res = await queryByType(types,  maxNodes, offset);
      }
      else if (byHash.length > 0) {
        res = await queryByHash(hashes, offset);
      }
      else {
        res = await queryAll(maxNodes, offset);
      }
    }
    catch(error) {
      console.log("Error while getting data:", error)
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
        defaultValue={DocumentTypes}
        className={classes.autocomplete}
        options={DocumentTypes}
        onChange={(e, value) => configData.fetchFilters.byType = value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Document Types"
            placeholder="Type"
          />
        )}
        //onChange={({target}) => configData.url = target.value}
        />
    </Flexbox>
    {/* <Flexbox
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <Autocomplete
        multiple
        freeSolo
        className={classes.autocomplete}
        options={[]}
        onChange={(e, value) => configData.fetchFilters.byLabel = value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Document Labels"
            placeholder="Label"
          />
        )}
        //onChange={({target}) => configData.url = target.value}
        />
    </Flexbox> */}
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
        //onChange={({target}) => configData.url = target.value}
      /> 
    </Flexbox>
  </TabPanel>
  );
})

export default Panel;