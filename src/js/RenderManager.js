import jquery from 'jquery';
import CONSTS from './consts'
var $ = jquery;
export default class RenderManager {
  constructor() {
    console.log('RenderManager initing...');

    let consoleEl = $("#console");
    this.$console = consoleEl;

    $(document).on('click', e => {
      this.focus('#input');
    })
    console.log('RenderManager inited');
  }

  focus(id) {
    $(id).focus();
  }

  listenEnter(id,cb) {
    $(id).on('keypress', (e) => {
      if(e.charCode === CONSTS.KEY_CODES.ENTER) {
        const userText = $(id).val();
        cb(userText);
      }
    })
  }

  saveInput(inputId, command) {
    if(command.length > 1) command = command.join(' ');
    $(inputId).remove()
    let html = this.$console.html();
    html += command +'<br>';
    this.$console.html(html);
  }

  setInput(inputId, command) {
    $(inputId).val(command);
    //Need to set the cursor to the end
    // $(inputId).focus();
    // var tmpStr = $(inputId).val();
    // $(inputId).val('');
    // $(inputId).val(tmpStr);
  }

  renderInput(inputMd) {
    let html = this.$console.html();
    html += inputMd;
    this.$console.html(html);
  }

  render(text) {
    let html = this.$console.html();
    html += text;
    this.$console.html(html);
  }

  html(text) {
    this.$console.html(text);
  }

  getHtml() {
    return this.$console.html();
  }

  removeLastChar(length) {
    let html = this.$console.html();
    html = html.substring(0, html.length-length);
    this.$console.html(html);
  }

  clear() {
    this.$console.html("");
  }
}
