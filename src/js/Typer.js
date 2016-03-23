import jquery from 'jquery';
var $ = jquery;

export default class Typer {
  constructor(renderManager, gameController){
    console.log('Typer initing...');

    this.render = renderManager;
    this.gameController = gameController;
    this.index = 0;
    this.typeCodeHandler = null;
    this.shortCutsHandler = null;
    this.cursorInterval = null;

    console.log('Typer inited');
  }

  prepareCode(code) {
    var text=$("<div/>").text(code.substring(0, this.index)).html();

    var rtn= new RegExp("\n", "g");
    var rts= new RegExp("\\s", "g");
    var rtt= new RegExp("\\t", "g");

    return text.replace(rtn,"<br/>").replace(rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;");
  }

  typeCode(code, e) {
    code = this.prepareCode(code);
    this.render.html(code);
    window.scrollBy(0,50);
    this.index += 2;
  }

  updateCursor() {
    let content = this.render.getHtml();
    if(content.substring(content.length-1, content.length) === "|") {
      this.render.removeLastChar(1);
    }
    else {
      this.render.render('|');
    }
  }

  handleShortCut(e) {
    if(e.ctrlKey && e.keyCode == 67) {
      console.log("YEAP");
      this.stopTyping();
    }
  }

  startTyping(code, status = 0) {
    let typeCodeHandler = this.typeCode.bind(this, code)
    let shortCutsHandler = this.handleShortCut.bind(this);
    let cursorInterval = setInterval(this.updateCursor.bind(this), 500);
    this.typeCodeHandler = typeCodeHandler;
    this.shortCutsHandler = shortCutsHandler;
    this.cursorInterval = cursorInterval;
    $(document).on('keypress', typeCodeHandler);
    $(document).on('keydown', shortCutsHandler)
  }

  stopTyping() {
    let typeCodeHandler = this.typeCodeHandler;
    let shortCutsHandler = this.shortCutsHandler;
    let cursorInterval = this.cursorInterval;
    $(document).off('keypress', typeCodeHandler)
    $(document).off('keydown', shortCutsHandler)
    clearInterval(cursorInterval);
    this.gameController.clear();
  }
}
