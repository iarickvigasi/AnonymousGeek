export default class TextManager {
  constructor() {
    console.log('TextManager initing...');
    this.inputId = 'input';
    this.input = `anon@Geek:~$:<input id='${this.inputId}'>`;
    console.log('TextManager inited');
  }

  getMenuText() {
    const menuText =
    `Hello, I am glad to see you in my game... <br>
     please type the action what you would like to do <br>
    `
    return menuText;
  }

  getHelpText() {
    const helpText =
    `
    GNU bash, version 4.3.42(1)-release (x86_64-pc-linux-gnu) <br>
    These shell commands are defined internally.<br>
    Type 'help' to see this list.<br>
    `
    return helpText;
  }

  getUnknownCommandText(command) {
    const unknownCommand =
    `
    No command '${command}' found, but you can type 'help'<br>
    ${command}: command not found<br>
    `
    return unknownCommand;
  }

  getInput() {
    return this.input;
  }

  getInputId() {
    return "#"+this.inputId;
  }

}
