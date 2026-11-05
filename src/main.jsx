import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
class EB extends React.Component{state={e:false};static getDerivedStateFromError(){return{e:true}}render(){return this.state.e?<div style={{padding:'60px 20px',textAlign:'center',fontFamily:'system-ui'}}><h1>Something went wrong</h1><p>Please reload the page. If it keeps happening, message us on WhatsApp.</p><button onClick={()=>location.reload()} style={{padding:'12px 22px',fontSize:16}}>Reload</button></div>:this.props.children}}
createRoot(document.getElementById('root')).render(<EB><App/></EB>)
