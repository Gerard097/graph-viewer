import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react"
import Flexbox from "./Flexbox";
import TabPanel from "./TabPanel";

export const DocumentTypes = [
  "dho",
  "member",
  "settings",
  "timeshare",
  "alert",
  "assignment",
  "role",
  "badge",
  "period",
  "payment",
  "vote",
  "vote.tally"
]

const Panel = ({index, tab, classes, configData}) => {
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
        id="tags-standard"
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
}

export default Panel;