import TextManager from './TextManager';
import RenderManager from './RenderManager';
export default class GameController {
  constructor() {
    console.log('GameController initing...');

    this.textManager    = new TextManager();
    this.renderManager  = new RenderManager();

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

  handleCommand(command) {
    command = command.toLowerCase();
    const inputId = this.textManager.getInputId();
    this.renderManager.saveInput(inputId, command);
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'clear':
        this.clear();
        break;
      default:
        this.unknownCommand(command);
    }
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

  unknownCommand(command) {
    const unknownCommand = this.textManager.getUnknownCommandText(command);
    this.renderManager.render(unknownCommand);
    this.showInput();
  }
}
