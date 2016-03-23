import jquery from 'jquery';
var $ = jquery;
const CHAR_CODES = {
  ENTER: 13,
}
export default class RenderManager {
  constructor() {
    console.log('RenderManager initing...');

    let consoleEl = $("#console");
    this.$console = consoleEl;

    console.log('RenderManager inited');
  }

  focus(id) {
    $(id).focus();
  }

  listenEnter(id,cb) {
    $(id).on('keypress', (e) => {
      if(e.charCode === CHAR_CODES.ENTER) {
        const userText = $(id).val();
        cb(userText);
      }
    })
  }

  saveInput(inputId, command) {
    $(inputId).remove()
    let html = this.$console.html();
    html += command +'<br>';
    this.$console.html(html);
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

  clear() {
    this.$console.html("");
  }
}
