import React from 'react'
import '../design-system/styles/design-system.css'
import { Sidebar as DSidebar, ChatWindow as DChatWindow } from '../design-system'

export function Sidebar(props){
  return <DSidebar {...props} />
}

export function ChatWindow(props){
  return <DChatWindow {...props} />
}

export default null
