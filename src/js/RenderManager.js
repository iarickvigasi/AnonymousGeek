import jquery from 'jquery';
var $ = jquery;

export default class RenderManager {
  constructor() {
    console.log('RenderManager initing...');

    let consoleEl = $("#console");
    this.$console = consoleEl;

    console.log('RenderManager inited');
  }

  render(text) {
    this.$console.text(text);
  }
}
