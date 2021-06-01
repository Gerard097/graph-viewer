import { IconButton, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useImperativeHandle, useState } from "react"
import Flexbox from "./Flexbox";
import TabPanel from "./TabPanel";
import { DateTimePicker } from '@material-ui/pickers'
import DeleteIcon from '@material-ui/icons/Clear'
import { customQuery } from "../api/DGraphClient";

const NullDatePicker = ({label, value, onChange}) => {
  return (
  <DateTimePicker
    
    TextFieldComponent={(props) => {
      return (
        <Flexbox style={{alignItems: 'center'}}>
          <TextField
            label={props.label}
            className={props.className}
            style={props.style}
            onClick={props.onClick}
            value={value ? value.toLocaleString() : '---'}
          />
          <IconButton
            onClick={() => onChange(undefined)}>
            <DeleteIcon/>
          </IconButton>
        </Flexbox>
      )
    }}
    label={label}
    value={value} 
    onChange={onChange}
  />
  )
}

const getPeriodsQuery = (startPeriod, endPeriod, hashes, maxNodes, offset) => `
{
  hashed as var(func: has(hash)) @filter(eq(hash, [${["\"\""].concat(hashes).reduce((acc, next)=>acc+","+next)}])) {
    expand(_all_) {
      hash
      contents {
        expand(_all_)
      }
    }
  }

  periods as var(func: type(Document)) @cascade {
    content_groups {
      contents @filter(eq(label, "type") and 
                       eq(value, "period")) {
        
      }
    }
  }

  filterByDate as var(func: uid(periods)) ${startPeriod || endPeriod ? '@cascade' : ''} {
    content_groups {
      contents ${(startPeriod || endPeriod) ? `@filter ( 
        ${startPeriod ? `ge(time_value, "${startPeriod.toISOString()}") and` : ''}
        ${endPeriod ? `le(time_value, "${endPeriod.toISOString()}") and` : ''}
      eq(label, "start_time"))`: ''} {}
    }
  }

  docs(func: uid(hashed,filterByDate), first: ${maxNodes}, offset: ${offset}) {
    expand(_all_) {
      hash
      contents {
        expand(_all_)
      }
    }
  }
}
`

const PeriodsPanel = React.forwardRef(({index, tab, classes, configData}, ref) => {

  const [fromDate, setFromDate] = useState(undefined);
  const [toDate, setToDate] = useState(undefined);

  const getRows = async (maxNodes, offset) => {
    let res = { data: {} };

    const { byHash } = configData.fetchFilters;
    
    const query = getPeriodsQuery(fromDate, toDate, byHash, maxNodes, offset);

    console.log(query);

    res = await customQuery(query);

    console.log(res);

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
      /> 
    </Flexbox>
    <Flexbox
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <NullDatePicker
        label='From'
        value={fromDate}
        onChange={(newDate) => { 
        if (!toDate || !newDate ||
            newDate.getTime() <= toDate.getTime()) {
          setFromDate(newDate);
        }}}
      />
      <NullDatePicker
        label='To'
        value={toDate}
        onChange={(newDate) => { 
        if (!fromDate || !newDate ||
            newDate.getTime() >= fromDate.getTime()) {
          setToDate(newDate);
        }}}
      />
    </Flexbox>
  </TabPanel>
  );
})

export default PeriodsPanel;