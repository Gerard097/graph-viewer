import React from "react";
import Flexbox from "./Flexbox";

const TabPanel = ({children, value, index}) => {
  return (
    <Flexbox
      hidden={value !== index}
      style={{flexDirection: 'column'}}>
      {children}
    </Flexbox>
  );
}

export default TabPanel;