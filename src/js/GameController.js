import TextManager from './TextManager';
import RenderManager from './RenderManager';
export default class GameController {
  constructor() {
    console.log('GameController initing...');

    this.textManager = new TextManager();
    this.renderManager      = new RenderManager();

    console.log('GameController inited.');

    this.showMenu();
  }

  showMenu() {
    console.log('Showing menu');
    const menuText = this.textManager.getMenuText();
    this.renderManager.render(menuText);
  }
}
