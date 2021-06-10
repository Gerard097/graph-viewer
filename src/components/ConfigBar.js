import { CircularProgress, Divider, IconButton, makeStyles, MenuItem, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import React, { useRef, useState } from 'react'
import Flexbox from './Flexbox';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import DefaultPanel, { DocumentTypes } from './DefaultPanel';
import PeriodsPanel from './PeriodsPanel';
import { Autocomplete } from '@material-ui/lab';
import MembersPanel from './MemberPanel';

const useStyles = makeStyles((theme) => ({
  url: {
    flex: 1,
    paddingRight: theme.spacing(2)
  },
  code: {
    
  },
  autocomplete: {
    width: 'calc(100%)'
  },
  autocompleteShared: {
    
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
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  divider: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}))

export const FilterTypes = {
  HASH: 'Hash',
  NODE_TYPE: 'Node Type', 
  NODE_LABEL: 'Node Label'
};

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
                }) {
    this.url = defaultURL;
    this.searchDepth = defaultDepth;
    this.maxNodes = defaultMaxNodes;
    this.maxEdges = defaultMaxEdges;
    this.fetchFilters = { byType: DocumentTypes, byHash: [], byLabel: [] }
    this.fetchFilterMode = "and"; //and | or
    this.showFilters = { type: FilterTypes.HASH, values: [] }
  }
}

export const RemoteServers = [
  {url: 'https://alpha.tekit.io/', label: 'DHO Main'},
  {url: 'https://alpha-test.tekit.io/', label: 'DHO Testenv'},
  {url: 'https://alpha-acct-test.tekit.io/', label: 'Accounting Testenv'},
];

/**
 * 
 * @param {ConfigData} configData 
 */
const ConfigBar = ({configData,
                    isLoadingData,
                    onUpdate, 
                    onFilter,
                    onDepthChange,
                    onMaxNodesChange,
                    onMaxEdgesChange,
                    fetchingData,
                    ...otherProps}) => {

  const classes = useStyles();

  const [filter, setFilter] = useState(configData.showFilters.type)

  const [tab, setTab] = useState(0);

  const tabRefs = useRef([null, null, null])

  return (
  <Flexbox {...otherProps} style={{flexDirection: 'column', maxWidth: '400px'}}>
    <Typography
      className={classes.filtersHeader}
      variant='h5'>
      Settings
    </Typography>
    {/**Settings**/}
    <Flexbox 
      className={classes.inputRow}
      style={{flexDirection: 'row'}}>
      {/* <TextField
        className={classes.url}
        defaultValue={configData.url}
        onChange={({target}) => configData.url = target.value}
        label='Remote server'/>   */}
        <Autocomplete
          freeSolo
          defaultValue={`${RemoteServers[0].label} (${RemoteServers[0].url})`}
          className={classes.url}
          options={RemoteServers}
          onChange={(e, value) => {
       
            if (value && value.hasOwnProperty('url')) {
              configData.url = value.url;
            }
            else {
              configData.url = value;
            }
          }}
          getOptionLabel={(option) => {
            if (option.hasOwnProperty('label')) {
              return `${option.label} (${option.url})`;
            }

            return option;
          }}
          renderInput={(params) => {
            return (
            <TextField
              {...params}
              variant="standard"
              label="Remote server"
              placeholder="Url"
            />
          )}}
        />
    </Flexbox>
    <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="simple tabs example">
      <Tab label="Default"/>
      <Tab label="Periods"/>
      <Tab label="Members & Docs"/>
    </Tabs>
    <DefaultPanel
      ref={ref => tabRefs.current[0] = ref}
      classes={classes}
      configData={configData}
      index={0}
      tab={tab}
    />
    <PeriodsPanel
      ref={ref => tabRefs.current[1] = ref}
      classes={classes}
      configData={configData}
      index={1}
      tab={tab}
    />
    <MembersPanel
      ref={ref => tabRefs.current[2] = ref}
      classes={classes}
      configData={configData}
      index={2}
      tab={tab}
    />
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
          onClick={() => {
            onUpdate(tabRefs.current[tab]);
          }}
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
    {/**Settings**/}
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
          onChange={(e) => { setFilter(configData.showFilters.type = e.target.value); }}
          label='Filter By'>
          {Object.values(FilterTypes).map((o, idx) => {
            return (
            <MenuItem value={o} key={idx}>
            {o}
            </MenuItem>
            )
          })}
        </TextField>
      </Flexbox>
      <Flexbox>
        <Autocomplete
          multiple
          freeSolo
          className={classes.autocomplete}
          options={[]}
          onChange={(e, value) => console.log(configData.showFilters.values = value) }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Filter Values"
              placeholder="Value"
            />
          )}
        //onChange={({target}) => configData.url = target.value}
        />
      </Flexbox>
      <Flexbox style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <div className={classes.updateContainer}>
          <Button
            onClick={onFilter}
            variant="contained" 
            color='primary'>
            Filter Nodes
          </Button>
        </div>
      </Flexbox>
    </Flexbox>
  </Flexbox>
  );
};

export default ConfigBar;