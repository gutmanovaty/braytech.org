import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import ErrorBoundary from './components/ErrorBoundary';
import * as serviceWorker from './serviceWorker';
import runOnceTasks from './utils/runOnceTasks';
import packageJSON from '../package.json';

import App from './App';

import store from './store';

class AppEntry extends React.Component {
  constructor() {
    super();
    
    this.state = {
      updateAvailable: false
    };

    console.log(`%c Braytech ${packageJSON.version}`, 'font-family: sans-serif; font-size: 24px;');

    runOnceTasks();
  }

  config = {
    onUpdate: registration => {
      console.warn('Service worker update available');
      console.log(registration);

      this.setState({
        updateAvailable: true
      });

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    },
    onSuccess: registration => {
      console.warn('Service worker registered');
      console.log(registration);
    }
  };

  beforeInstallPrompt = (event) => {
    console.log(event)
  }

  componentDidMount() {
    serviceWorker.register(this.config);
    serviceWorker.beforeInstallPrompt(this.beforeInstallPrompt);
  }

  render() {
    return (
      <Provider store={store}>
        <ErrorBoundary app {...this.state}>
          <App {...this.state} />
        </ErrorBoundary>
      </Provider>
    );
  }
}

ReactDOM.render(<AppEntry />, document.getElementById('root'));