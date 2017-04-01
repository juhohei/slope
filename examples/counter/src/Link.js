import React from 'react'

import {navigate} from './actions'

export default function Link ({href, children}) {
  return <a href={href} onClick={handleClick(href)}>{children}</a>
}

function handleClick (href) {
  return e => {
    e.preventDefault()
    navigate(href)
  }
}
