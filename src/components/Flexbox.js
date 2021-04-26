import React from 'react'

const Flexbox = ({children, style, hidden, ...otherProps}) => {
  return (
  <div {...otherProps} style={{display: hidden ? 'none' : 'flex', ...style}}>
    {children}
  </div>
  )
}

export default Flexbox;