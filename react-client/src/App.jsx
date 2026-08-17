import { useState } from 'react';
import VtkRemoteView from './VtkRemoteView.jsx';
import Sidebar from './Sidebar.jsx';

function App({ wsClient, viewId }) {
  // wsClient.getRemote().Trame.subscribeToStateUpdate(([newState]) => {
  //   if ("resolution" in newState) {
  //     setResolution(newState.resolution);
  //   }
  // });

  // wsClient.getRemote().Trame.subscribeToActions(([actions]) => {
  //   for (let i = 0; i < actions.length; i++) {
  //     const { ref, method, args } = actions[i];
  //     console.log(`Call method "${method}" on ref="${ref}" with args=[${args}]`);
  //   }
  // });

  // function handleResolutionChange(value) {
  //   setResolution(value);
  //   wsClient.getRemote().Trame.updateState([
  //     { key: "resolution", value }
  //   ]);
  // }

  function trigger(name, args = [], kwargs = {}) {
    return wsClient.getRemote().Trame.trigger(name, args, kwargs);
  }
  function getState(...names) {
    return wsClient.getRemote().Trame.getState(...names);
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      margin: 0,
      padding: 0,
    }}>
      <VtkRemoteView wsClient={wsClient} viewId={viewId} />
      
      <Sidebar 
        onTrigger={trigger}
        onGetState={getState}
      />
    </div>
  );
}

export default App;