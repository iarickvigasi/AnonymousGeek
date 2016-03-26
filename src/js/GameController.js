import TextManager from './TextManager';
import RenderManager from './RenderManager';
import UserStore from './UserStore';
import Typer from './Typer';
import utils from './utils';

export default class GameController {
  constructor() {
    console.log('GameController initing...');

    this.textManager    = new TextManager();
    this.renderManager  = new RenderManager();
    this.typer          = new Typer(this.renderManager);
    this.user           = new UserStore(this.textManager);

    this.history        = [' '];
    this.historyIndex   = 0;
    this.generateJobs();

    this.startHandleArrowKeys();
    console.log('GameController inited.');

    this.showMenu();
  }

  startHandleArrowKeys() {
    this.handleArrowKeyHandler = this.handleArrowKey.bind(this);
    document.addEventListener('keydown', this.handleArrowKeyHandler);
  }

  stopHandleArrowKeys() {
    document.removeEventListener('keypress', this.handleArrowKeyHandler);
    this.handleArrowKeyHandler = null;
  }

  handleArrowKey(e) {
    if(e.keyCode == 38) {
      this.takeFromHistory();
    }
    else if(e.keyCode == 40) {
      this.takebackFromHistory();
    }
    console.log('hist',this.history);
    console.log('histI',this.historyIndex);
  }

  takeFromHistory() {
    if(this.historyIndex > this.history.length-1) return;

    const inputId = this.textManager.getInputId();
    let lastArgument = this.history[this.historyIndex];
    this.historyIndex += 1;

    this.renderManager.setInput(inputId, lastArgument);
  }

  takebackFromHistory() {
      this.historyIndex -= 2;
      if(this.historyIndex < 0) { this.historyIndex = 0; return }
      this.takeFromHistory();
  }

  addToHistory(command) {
    this.history.unshift(command);
    this.historyIndex = 0;
  }

  showMenu() {
    console.log('Showing menu');
    const menuText = this.textManager.getMenuText();
    this.renderManager.render(menuText);
    this.showInput();
  }

  showInput(e) {
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
      case 'skills':
        this.showSkills();
        break;
      case 'getcash':
        this.showCash();
        break;
      case 'jobs':
        this.showJobs();
        break;
      case 'clear':
        this.clear();
        break;
      case 'code':
        this.badCommand(command)
        break;
      case 'jobapply':
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
      case 'jobapply':
        this.jobapply(commands);
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
    this.addToHistory(command);
    command = command.toLowerCase();
    command = command.trim();
    command = command.split(' ');
    const inputId = this.textManager.getInputId();
    this.renderManager.saveInput(inputId, command);
    if(command.length == 1) this.handleSimpleCommand(command[0]);
    else if(command.length == 2) this.handleDoubleCommand(command);
    else if(command.length > 2) this.handleComplexCommand(command);
  }

  code(commands) {
    const projectName = commands[1];
    let project = this.user.getProject(projectName);
    if(!project){ this.unknownArgument(commands); }
    else {
      console.log("Start coding:", project);
      this.codeGame(project);
    }
  }

  jobapply(commands) {
    const jobIndex = commands[1];
    let job = this.user.setUserJob(jobIndex);
    if(!job){
      this.unknownArgument(commands);
    }
    else {
      this.showJobApplySuccess(job);
    }
  }

  codeGame(project){
    this.renderManager.clear();
    const gameCode = this.textManager.getGameCode(project);
    if(!gameCode) {
      this.renderManager.render('Hmm....I don\'n know such language<br>')
      this.showInput();
      return;
    }
    this.typer.startTyping(gameCode, project);
  }

  showProjects() {
    const projects = this.user.getProjectsTxt();
    this.renderManager.render(projects);
    this.showInput();
  }

  showSkills() {
    const skills = this.user.getSkillsTxt();
    this.renderManager.render(skills);
    this.showInput();
  }

  showCash() {
    const cash = this.user.getCash();
    let txt = 'User has : $' + cash + "<br>";
    this.renderManager.render(txt);
    this.showInput();
  }

  showJobs() {
    const jobs = this.getJobs();
    this.renderManager.render(jobs);
    this.showInput();
  }

  showJobApplySuccess(job) {
    let txt = `You\'v applied successfuly to \'${job.title}!\' Go start coding!<br>`;
    this.renderManager.render(txt);
    this.showInput();
  }

  clear(showInput = true) {
    this.renderManager.clear();
    showInput && this.showInput();
  }

  showHelp() {
    const helpText = this.textManager.getHelpText();
    this.renderManager.render(helpText);
    this.showInput();
  }

  saveProject(project) {
    let success = this.user.saveProject(project);
    if(!success) {
      this.renderManager.render('Oops, something wrong went while saving<br>')
    }
  }

  tryEvent() {
    let gameData = this.user.getGameData();
    //@TODO: Add checking by skill
    if(gameData.progress >= 10000) {
      this.typer.breakTyping();
      this.renderManager.render('You don\'n know what to write next! Such a low skill..<br>')
      this.showInput();
      return false;
    }

    return true;
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

  projectComplete(project) {
    this.user.completeProject(project);
    this.renderManager.render('YAY! You\'ve finished project #' + project.index + " " + project.title+'<br>');
    this.showInput();
  }

  generateJobs() {
    let jobGenerator = new JobGenerator(this.textManager);
    let jobs = []

    for(let i = 0;i < 10; i++) {
      let job = jobGenerator.getJob();
      job.index = jobs.length;
      jobs.push(job);
    }

    this.user.setJobs(jobs);
  }

  getJobs() {
    let jobs = this.user.getJobs();
    let txt  = 'Jobs:<br>';
      txt  += '======================================================================<br>';
    for(let i=0;i<jobs.length;i++) {
      let job = jobs[i];
      txt += 'Position:'+ job.title + '<br>';
      txt += 'Payment: $'+ job.price + '<br>';
      txt += 'Skill: '+ job.field + '<br>';
      txt += 'ID: '+ job.index + '<br>';
      txt += '----------------------------------------------------------------------</br>';
    }
    return txt;
  }
}

class JobGenerator {
  constructor(textManager) {
    this.textManager = textManager;
  }

  getJob() {
    let random = utils.random(1, 3);
    let job = {};
    //@NOTE: SHould make randow positions and companies
    switch (random) {
      case 1:
        job.title = 'Angular Developer for some Indian Startup';
        job.field = 'WebDevelopment';
        job.skill = 'web';
        job.file  = 'js';
        break;
      case 2:
        job.title = 'C++ Developer for CryTek';
        job.field = 'Game Development';
        job.skill = 'game';
        job.file  = 'cpp';
        break;
      default:
        job.title = 'Java Developer for Google';
        job.field = 'Mobile Softwere Development ';
        job.skill = 'mobile';
        job.file  = 'java';
        break;
    }

    job.price = utils.random(1, 1000);
    job.progress = 0;
    let length = this.textManager.getCodeLentgh(job.file);
    job.length = length;
    return job
  }
}
