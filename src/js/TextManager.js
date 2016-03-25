import cppCode from './cppCode';
import jsCode from './jsCode';
import gameCode from './gameCode';
import javaCode from './javaCode';

const CODES = {
  cpp: cppCode,
  js: jsCode,
  game: gameCode,
  java: javaCode
}

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

  getGameCode(project) {
    switch (project.file) {
      case 'game':
        return gameCode
      case 'js':
        return jsCode
      case 'java':
        return javaCode
      case 'cpp':
        return cppCode
      default:
        return null;
    }
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

  getCodeLentgh(name) {
    if(!CODES[name]) return null;
    return CODES[name].length;
  }

}
