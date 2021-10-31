/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component } from 'react';

export default class Comments extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute(
      'repo',
      'lhfam97/Ignite-reactjs-criando-um-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return <div id="inject-comments-for-uterances" />;
  }
}
