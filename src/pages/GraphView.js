import { Component } from 'react'
import { get_table, set_url } from '../providers/Table';
import Graph from 'vis-react'
import './GraphView.css';
import ReactJson from 'react-json-view'
import { getEdgesCommingFrom, getEdgesGoingTo } from '../api/NodesFilters';
import { getContent, getGroup, nameGroups } from '../api/DocumentHelpers';
import ConfigBar, { ConfigData } from '../components/ConfigBar';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton'
import ToolBar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { withStyles } from '@material-ui/core';

const styles = theme => { console.log(theme); return {
  drawerHeader: {
    display: 'flex',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end'
  },
  drawerButton: {
    marginRight: theme.spacing(2)
  },
  toolbar: theme.mixins.toolbar,
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    position: 'relative'
  }
}
}

const options = {
  physics: {
    enabled: true,
    solver: 'repulsion',
    stabilization: {
      enabled: false,
    },
    // repulsion: {
    //   centralGravity: 0,
    //   springLength: 200,
    //   springConstant: 0.05,
    //   nodeDistance: 100,
    //   damping: 0.09
    // },
  },
  layout: {
    hierarchical: {
      enabled: false,
      direction:'UD',
      sortMethod: 'directed'
    }
  },
  edges: {
      color: '#000000',
      smooth: true
  },
  nodes: {
    fixed: {
      x: false,
      y: false
    }
  },
  interaction: { hoverEdges: true }
};

class GraphView extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      //Stores the whole graph
      //up to nodesLimit & edgesLimit
      graph: { nodes: [], edges: [] },
      //Stores a partial view of the whole graph
      customView: null,
      style: { width: "100%", height: "100%" },
      network: null,
      currentNode: undefined,
      configBarOpen: false,
      loadingNodes: false,
    }

    this.config = new ConfigData ({
      defaultMaxNodes: 100,
      defaultMaxEdges: 1000,
      defaultDepth: 2,
      defaultCode: process.env.REACT_APP_DEFAULT_CODE,
      defaultURL: process.env.REACT_APP_DEFAULT_SERVER,
    });

    this.byhash = {};
    this.events = {
      select: (e) => {

        const { ctrlKey } = e.event.srcEvent;
        this.ctrlKey = ctrlKey;
        if (e.nodes.length === 0) { 
          this.setState({currentNode: undefined, customView: null});
          //this.state.network.redraw();
        }
        else {

          if (!ctrlKey) {
            this.filterID = e.nodes[0];            
          }

          this.viewID = e.nodes[0];

          this.filterNodes(this.config.searchDepth, e.nodes[0], this.viewID, ctrlKey);
          //this.state.network.redraw();
        }
      }
    };
  }

  filterNodes = (maxDepth, filterIdx, viewIdx, ctrlKey) => {
    
    const originNodes = this.state.graph.nodes;

    let newEdges;
    let newNodes;

    if (ctrlKey) {
      const { currentNode, customView, graph } = this.state;
      const { nodes, edges } = currentNode ? customView : graph;
      newEdges = edges;
      newNodes = nodes;
    }
    else {         

      let markedNodes = {};

      const { data } = originNodes[filterIdx];

      const commingEdgesNodes = getEdgesCommingFrom(this, data.hash, markedNodes, maxDepth);

      const goingEdgesNodes = getEdgesGoingTo(this, data.hash, markedNodes, maxDepth);

      newEdges = commingEdgesNodes[0].concat(goingEdgesNodes[0]);
      newNodes = commingEdgesNodes[1].concat(goingEdgesNodes[1]);
    }

    //Some bug makes the app crash if I don't set the customView to null first
    this.setState({currentNode: originNodes[viewIdx], customView: null}, () => this.setState({customView: { nodes: newNodes, edges: newEdges }}))
  }

  getNetwork = data => {
    this.setState({network: data});
  }

  getEdges = data => {
    //console.log("getEdges:", data);
  }

  getNodes = data => {
    //console.log("getNodes:", data);
  }

  resize = data => {
    this.state.network.redraw();
    this.state.network.fit();
  }

  depthChange = () => {
    const { currentNode } = this.state;
    if (currentNode) {
      this.filterNodes(this.config.searchDepth, this.filterID, this.viewID);
    }
  }

  loadData = async () => {

    const { url, code, maxNodes, maxEdges } = this.config;

    console.log('loading from url', url);

    this.byhash = {};

    //Cleaunp old state
    this.setState({ 
      customView: null,
      loadingNodes: true, 
      graph: { nodes: [], edges: [] }, 
      currentNode: undefined 
    });

    try {

      // const { serverUrl } = this.state.config;

      set_url(url);

      let nextNode;

      let nodes = []; 

      while (true) {

        let limit = maxNodes - nodes.length;

        const {more, rows, next_key} = await get_table(code, code, 'documents', limit, nextNode);

        rows.forEach((node) => {

          const idx = nodes.length;

          let label = node.hash.substr(0, 5);

          const system = getGroup(node, "system");

          if (system) {
            
            const name = getContent(system, "node_label");
            
            if (name) {
              label = name.value[1];
            }

            const type = getContent(system, "type");

            if (type) {
              node.type = type.value[1];
            }
          }

          if (!this.config.fetchFilterNode(node)) {
            return;
          }

          this.byhash[node.hash] = idx;

          node = nameGroups(node);

          nodes.push({id: idx, label: label, data: node});
        });

        if (!more || nodes.length >= maxNodes) {
          break;
        }

        nextNode = next_key;
      }

      let nextEdge;
      
      let edges = [];
      
      while (true) {

        let limit = maxEdges - edges.length;

        const { rows, more, next_key } = await get_table(code, code, 'edges', limit, nextEdge)

        rows.forEach(edge => {
          if (this.byhash.hasOwnProperty(edge.from_node) && 
              this.byhash.hasOwnProperty(edge.to_node)) {
            edges.push({from: this.byhash[edge.from_node], 
              to: this.byhash[edge.to_node], 
              label: edge.edge_name, 
              origin: edge});
          }
        });

        if (!more || edges.length >= maxEdges) {
          break;
        }

        nextEdge = next_key;
      }

      this.setState({ graph: { nodes: nodes, edges: edges }});

      this.state.network.redraw();
    }
    catch(error) {
      console.error("Error while getting nodes data:", error);
    }
    finally {
      this.setState({ loadingNodes: false })
    }
  }

  componentDidMount() {

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  render() {
   
    const { classes } = this.props; 

    const { graph, customView, currentNode, configBarOpen,
            loadingNodes } = this.state;

    const renderGraph = customView ?? graph;

    //const { maxNodes, maxEdges }

    return (
    <div className="app-container">
      <div className={classes.toolbar}></div>
      <AppBar
      >
        <ToolBar>
          <IconButton
            color='inherit'
            size='medium'
            className={classes.drawerButton}
            onClick={()=>this.setState({configBarOpen: true})}>
            <SettingsIcon 
            />
          </IconButton>
          <Typography
            noWrap
            variant="h6"
          >
            DHO Graph Viewer
          </Typography>
        </ToolBar>
      </AppBar>
      <Drawer
        variant='persistent'
        open={configBarOpen}
        anchor='left'
      >
        <div className={classes.drawerHeader}>
          <IconButton
            onClick={()=>this.setState({configBarOpen: false})}
          >
            <ArrowBackIosIcon/>
          </IconButton>
        </div>
        <ConfigBar
          className='options-container' 
          fetchingData={loadingNodes}
          configData={this.config}
          onUpdate={this.loadData}
          onDepthChange={this.depthChange}
        />
      </Drawer>
      <div className={classes.contentContainer}> 
        <div className="graph-canvas">
        <Graph
          graph={renderGraph}
          options={options}
          style={this.state.style}
          events={this.events}
          getNetwork={this.getNetwork}
          getEdges={this.getEdges}
          getNodes={this.getNodes}
          vis={vis => (this.vis = vis)}/>
        </div>
        <div
          className={`json-container ${currentNode && 'container-show'}`}
        >
          <ReactJson
            displayDataTypes={false}
            theme='monokai'
            style={{
              minWidth: "100%", 
              maxWidth: "100%",
              minHeight: "100%"
            }} 
            src={currentNode} />
        </div>
      </div>
    </div>)
  }
}



export default withStyles(styles)(GraphView);