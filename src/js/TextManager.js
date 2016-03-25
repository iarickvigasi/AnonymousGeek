export default class TextManager {
  constructor() {
    console.log('TextManager initing...');
    this.inputId = 'input';
    this.input = `anon@Geek:~$:<input id='${this.inputId}'>`;

    console.log('TextManager inited');
  }

  getMenuText() {
    const menuText =
    `Hello Neo... <br>
     Are you smart enough? <br>
    `
    return menuText;
  }

  getProjects() {
    //@TODO: Form string from projects that inside user store
    const projects =
    `
    Projects: total: 1 <br>
    1) game : Your personal game, maybe another shit but who knows...</br>
    `
    return projects
  }

  getHelpText() {
    const helpText =
    `
    GNU bash, version 4.3.42(1)-release (x86_64-pc-linux-gnu) <br>
    These shell commands are defined internally.<br>
    Type 'help' to see this list.<br>
    help   - see help<br>
    clear  - clear console<br>
    projects - show all your project names<br>
    code <argument> - go to code<br>
    `
    return helpText;
  }

  getGameCode() {
    return gameCode;
  }

  getUnknownCommandText(command) {
    const unknownCommand =
    `
    No command '${command}' found, but you can type 'help'<br>
    ${command}: command not found<br>
    `
    return unknownCommand;
  }

  getUnknownArgument(commands) {
    const text =
    `
    ${commands[0]}: fatal error: unknown argument<br>
    usage: ${commands[0]} &ltargument that we know&gt<br>
    `
    return text;
  }

  getBadCommand(command) {
    let text =
    `
    Please use commands correctly! <br>
    command '${command}' is using with arguments!<br>
    `
    return text;
  }

  getInput() {
    return this.input;
  }

  getInputId() {
    return "#"+this.inputId;
  }

}

const gameCode = `
import TextManager from './TextManager';
import RenderManager from './RenderManager';
import UserStore from './UserStore';
import Typer from './Typer';

export default class GameController {
  constructor() {
    console.log('GameController initing...');

    this.textManager    = new TextManager();
    this.renderManager  = new RenderManager();
    this.typer          = new Typer(this.renderManager);
    this.user           = new UserStore();

    console.log('GameController inited.');

    this.showMenu();
  }

  showMenu() {
    console.log('Showing menu');
    const menuText = this.textManager.getMenuText();
    this.renderManager.render(menuText);
    this.showInput();
  }

  showInput() {
    const inputMd  = this.textManager.getInput();
    const inputId = this.textManager.getInputId();
    this.renderManager.renderInput(inputMd);
    this.renderManager.focus(inputId);
    this.renderManager.listenEnter(inputId, (text)=>{
      console.log('User has typed:', text);
      this.handleCommand(text);
    });
  }

  handleSimpleCommand(command) {
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'projects':
        this.showProjects();
        break;
      case 'clear':
        this.clear();
        break;
      case 'code':
        this.badCommand(command)
        break;
      default:
      this.unknownCommand(command);
    }
  }

  handleDoubleCommand(commands) {
    switch (commands[0]) {
      case 'code':
        this.code(commands);
        break;
      default:
        this.unknownCommand(commands[0]);
    }
  }

  handleComplexCommand(commands) {
    //@TODO: Make it normal)))
    this.renderManager.render("WTF?<br>");
    this.showInput();
  }

  handleCommand(command) {
    command = command.toLowerCase();
    command = command.split(' ');
    const inputId = this.textManager.getInputId();
    this.renderManager.saveInput(inputId, command);
    if(command.length == 1) this.handleSimpleCommand(command[0]);
    else if(command.length == 2) this.handleDoubleCommand(command);
    else if(command.length > 2) this.handleComplexCommand(command);
  }

  code(commands) {
    const projectName = commands[1];
    //@TODO: Check for project
    if(projectName !== 'game'){ this.unknownArgument(commands); }
    else {
      this.codeGame();
    }
  }

  codeGame(){
    this.renderManager.clear();
    const gameData = this.user.getGameData();
    const gameCode = this.textManager.getGameCode();
    this.typer.startTyping(gameCode, gameData);
  }

  showProjects() {
    const projects = this.textManager.getProjects();
    this.renderManager.render(projects);
    this.showInput();
  }

  clear() {
    this.renderManager.clear();
    this.showInput();
  }

  showHelp() {
    const helpText = this.textManager.getHelpText();
    this.renderManager.render(helpText);
    this.showInput();
  }

  saveGameData(gameData) {
    this.user.setGameData(gameData);
  }

  unknownCommand(command) {
    const unknownCommand = this.textManager.getUnknownCommandText(command);
    this.renderManager.render(unknownCommand);
    this.showInput();
  }

  unknownArgument(commands) {
    const unknownArgument = this.textManager.getUnknownArgument(commands);
    this.renderManager.render(unknownArgument);
    this.showInput();
  }

  badCommand(command){
    const badCommand = this.textManager.getBadCommand(command);
    this.renderManager.render(badCommand);
    this.showInput();
  }
}


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

export default class TextManager {
  constructor() {
    console.log('TextManager initing...');
    this.inputId = 'input';
    console.log('TextManager inited');
  }

  getMenuText() {
    const menuText =
    'Hello Neo... <br>
     Are you smart enough? <br>
    ''
    return menuText;
  }

  getProjects() {
    //@TODO: Form string from projects that inside user store
    const projects =
    '
    Projects: total: 1 <br>
    1) game : Your personal game, maybe another shit but who knows...</br>
    '
    return projects
  }

  getHelpText() {
    const helpText =
    '
    GNU bash, version 4.3.42(1)-release (x86_64-pc-linux-gnu) <br>
    These shell commands are defined internally.<br>
    Type 'help' to see this list.<br>
    help   - see help<br>
    clear  - clear console<br>
    projects - show all your project names<br>
    code <argument> - go to code<br>
    '
    return helpText;
  }

  getGameCode() {
    return gameCode;
  }

  getUnknownCommandText(command) {
    const unknownCommand ='
    No command 'command' found, but you can type 'help'<br>
    command: command not found<br>
    '
    return unknownCommand;
  }

  getUnknownArgument(commands) {
    const text =
    '
    commands[0]}: fatal error: unknown argument<br>
    usage: commands[0]} &ltargument that we know&gt<br>
    '
    return text;
  }

  getBadCommand(command) {
    let text =
    '
    Please use commands correctly! <br>
    command 'command}' is using with arguments!<br>
    '
    return text;
  }

  getInput() {
    return this.input;
  }

  getInputId() {
    return "#"+this.inputId;
  }

}

const gameCode = 'Recursion... Oh no...'

import jquery from 'jquery';
import CONST from './consts'
import gameController from './app'
var $ = jquery;
const { KEY_CODES } = CONST

export default class Typer {
  constructor(renderManager){
    console.log('Typer initing...');

    this.render = renderManager;

    this.index = 0;
    this.speed = 2;

    this.typeCodeHandler = null;
    this.shortCutsHandler = null;
    this.cursorInterval = null;
    this.lastTypedKey = null;

    console.log('Typer inited');
  }

  prepareCode(code) {
    var text=$("<div/>").text(code.substring(0, this.index)).html();

    var rtn= new RegExp("\n", "g");
    var rts= new RegExp("\\s", "g");
    var rtt= new RegExp("\\t", "g");

    return text.replace(rtn,"<br/>").replace(rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;");
  }

  deleteLastCode(e) {
    this.index -= 2*this.speed;
    this.typeCode({});
  }

  getSpeed(e) {
    if(e.keyCode === this.lastTypedKey) return 0;
    else return this.speed;
  }

  getCode() {
    return this.prepareCode(this.codeSnippet)
  }

  saveKey(e) {
    this.lastTypedKey = e.keyCode;
  }

  typeCode(e) {
    const code = this.getCode()
    this.render.html(code);
    window.scrollBy(0,50);
    this.index += this.getSpeed(e);
    this.saveKey(e);
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
    else if(e.keyCode == KEY_CODES.BACKSPACE) {
      this.deleteLastCode(e);
      e.preventDefault();
    }
  }

  startTyping(code, gameData) {
    this.codeSnippet = code;
    this.index = gameData.progress;

    let typeCodeHandler = this.typeCode.bind(this)
    let shortCutsHandler = this.handleShortCut.bind(this);
    let cursorInterval = setInterval(this.updateCursor.bind(this), 500);
    this.typeCodeHandler = typeCodeHandler;
    this.shortCutsHandler = shortCutsHandler;
    this.cursorInterval = cursorInterval;
    $(document).on('keypress', typeCodeHandler);
    // $(document).unbind('keydown').bind('keydown', preventBackSpace);
    $(document).on('keydown', shortCutsHandler)
  }

  stopTyping() {
    let typeCodeHandler = this.typeCodeHandler;
    let shortCutsHandler = this.shortCutsHandler;
    let cursorInterval = this.cursorInterval;
    $(document).off('keypress', typeCodeHandler)
    $(document).off('keydown', shortCutsHandler)
    clearInterval(cursorInterval);
    let gameData = {
      progress: this.index,
    }
    gameController.clear();
    gameController.saveGameData(gameData)
  }
}

`
