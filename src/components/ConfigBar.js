import { CircularProgress, Divider, IconButton, makeStyles, MenuItem, TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import React, { useState } from 'react'
import Flexbox from './Flexbox';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles((theme) => ({
  url: {
    paddingRight: theme.spacing(2)
  },
  code: {
    
  },
  updateContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    position: 'relative'
  },
  nodeCount: {
    paddingRight: theme.spacing(2),
  },
  inputRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  edgeCount: {
  },
  minusButtonBack: {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 0
  },
  plusButtonBack: {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main
  },
  spinnerButton: {
    color: 'white',
    "&:hover": {
      color: 'black'
    },
  },
  progress: {
    position: 'absolute',
    left: 'calc(50% - 12px)',
    top: 'calc(50% - 12px)',
    zIndex: 1,
  },
  filtersHeader: {
    paddingBottom: theme.spacing(1)
  },
  filterDropdown: {
    width: '50%',
    paddingRight: theme.spacing(2)
  },
  divider: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}))

const SpinnerInput = ({label, onChange, min, max, step, defaultVal, className, style}) => {
  
  const classes = useStyles();

  const [value, setValue] = useState(defaultVal);

  const verifyAndSet = (value) => {
    const validator = /^[1-9][0-9]*$/
    if (validator.test(value) &&
        parseInt(value) >= min && parseInt(value) <= max) {
      setValue(value)
      onChange(value)
    }
  }

  return (
  <Flexbox
    className={className}
    style={style}
  >
    <TextField
      label={label}
      InputLabelProps={{
        
      }}
      inputProps={{
        size: label.length
      }}
      onChange={({target: { value }}) => verifyAndSet(value)}
      value={value}/>
    <Flexbox
      style={{
        marginLeft: '16px',
        flexDirection: 'column'
      }}>
      <IconButton
        onClick={() => {
          verifyAndSet((parseInt(value)+step).toString())
        }}
        className={classes.plusButtonBack}
        size='small'>
        <AddIcon
          className={classes.spinnerButton}
        />
      </IconButton>
      <IconButton
        onClick={() => {
          verifyAndSet((parseInt(value)-step).toString())
        }}
        className={classes.minusButtonBack}
        size='small'>
        <RemoveIcon
          className={classes.spinnerButton}
        />
      </IconButton>
    </Flexbox>
  </Flexbox>
  )
}

export class ConfigData {
  constructor({ defaultURL, 
                defaultDepth, 
                defaultMaxNodes,
                defaultMaxEdges,
                defaultCode }) {
    this.url = defaultURL;
    this.searchDepth = defaultDepth;
    this.maxNodes = defaultMaxNodes;
    this.maxEdges = defaultMaxEdges;
    this.code = defaultCode;
  }
}

/**
 * 
 * @param {ConfigData} configData 
 */
const ConfigBar = ({configData,
                    isLoadingData,
                    onUpdate, 
                    onDepthChange,
                    onMaxNodesChange,
                    onMaxEdgesChange,
                    fetchingData,
                    ...otherProps}) => {

  const classes = useStyles();

  const [filter, setFilter] = useState("Hash");

  return (
  <Flexbox {...otherProps} style={{flexDirection: 'column'}}>
    <Typography
      className={classes.filtersHeader}
      variant='h5'>
      Settings
    </Typography>
    <Flexbox 
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      <TextField
        className={classes.url}
        defaultValue={configData.url}
        onChange={({target}) => configData.url = target.value}
        label='Remote server'/>  
      <TextField
        className={classes.code}
        defaultValue={configData.code}
        onChange={({target}) => configData.code = target.value}
        label='Code'/>
    </Flexbox>
    <Flexbox 
      className={classes.inputRow} 
      style={{flexDirection: 'row'}}>
      <SpinnerInput
        className={classes.nodeCount}
        defaultVal={configData.maxNodes}
        min={1}
        max={1000000}
        step={100}
        onChange={v => {
          console.log(v);
          configData.maxNodes = v;
          onMaxNodesChange && onMaxNodesChange(v);
        }}
        label='Max node count'/>
      <SpinnerInput
        className={classes.edgeCount}
        defaultVal={configData.maxEdges}
        min={1}
        max={1000000}
        step={100}
        onChange={v => {
          configData.maxEdges = v;
          onMaxEdgesChange && onMaxEdgesChange(v);
        }}
        label='Max edge count'/>
    </Flexbox>
    <Flexbox style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <div className={classes.updateContainer}>
        <Button
          style={fetchingData ? {color: 'transparent'} : {}}
          disabled={fetchingData}
          onClick={onUpdate}
          variant="contained" 
          color='primary'>
          Fetch data
        </Button>
        {fetchingData && 
        <CircularProgress
          color='primary'
          className={classes.progress}
          size={24}/>}
      </div>
    </Flexbox>
    <Divider className={classes.divider}/>
    <Flexbox style={{flexDirection: 'column'}}>
      <Typography
        className={classes.filtersHeader}
        variant='h5'>
        Filters
      </Typography>
      <SpinnerInput
        className={classes.filterDropdown}
        defaultVal={configData.searchDepth}
        min={0}
        max={10}
        step={1}
        onChange={v => {
          configData.searchDepth = v;
          onDepthChange && onDepthChange(v);
        }}
        label='Connections Depth'/>
      <Flexbox>
        <TextField
          className={classes.filterDropdown}
          select
          value={filter}
          onChange={(e) => { console.log(e); setFilter(e.target.value)}}
          label='Filter type'>
          {['Hash','Node Type', 'Node Label'].map((o, idx) => {
            return (
            <MenuItem value={o} key={idx}>
            {o}
            </MenuItem>
            )
          })}
        </TextField>
        <TextField
          style={{width: '50%'}}
          label="Value"
        />
      </Flexbox>
    </Flexbox>
  </Flexbox>
  );
};

export default ConfigBar;