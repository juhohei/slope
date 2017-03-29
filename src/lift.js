import React from 'react'

class Observable extends React.Component {

  constructor (props) {
    super(props)
    this.state = {value: null}
  }

  componentWillMount () {
    this.unsubscribe = this.props.stream(value => this.setState({value}))
  }

  componentWillUnMount () {
    this.unsubscribe()
  }

  render () {
    const value = this.state.value

    if (value === null) {
      return null
    }

    return React.isValidElement(value) ? value : <span>{value}</span>
  }
}

export function lift (stream) {
  return <Observable stream={stream}/>
}

