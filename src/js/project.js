import utils from './utils';
import moment from 'moment';

export var FIELDS = {
  Web: 'web',
  Mobile: 'mobile',
  Game: 'game'
}

export var FILES = {
  Js: 'js',
  Cpp: 'cpp',
  Java: 'java',
  Game: 'game'
}

export default class ProjectFactory {
  constructor(gameController) {
    this.gameController = gameController;
    this.textManager = gameController.getTextManager();
  }

  getRandomProject() {
    let random = utils.random(1, 3);
    let job = {};
    //@NOTE: SHould make randow positions and companies
    switch (random) {
      case 1:
        job = new Project({
          title: 'Angular Developer for some Indian Startup',
          field: FIELDS.Web,
          skills: ['web'],
          file: FILES.Js
        })
        break;
      case 2:
        job = new Project({
          title: 'C++ Developer for CryTek',
          field: FIELDS.Game,
          skills: ['game'],
          file: FILES.Cpp
        })
        break;
      default:
        job = new Project({
          title: 'Java Developer for Google',
          field: FIELDS.Mobile,
          skills: ['mobile'],
          file: FILES.Java
        })
        break;
    }
    job.length = this.textManager.getCodeLentgh(job.file);
    return job
  }
}

class Project {
  constructor(data = {}) {
    this.title = data.title || "Project";
    this.field = data.field || FIELDS.Game;
    this.file = data.file || FILES.Cpp;
    this.skills = data.skills || ['game'];
    this.price = data.price || 0;
    this.length = data.length || 0;
    this.progress = 0;
    this.price = utils.random(1, 1000);
    this.difficulty = utils.random(1, 100);
    let randomDay = utils.random(1, 365);
    //@TODO: compute deadline from game time 
    this.deadline = moment().add(randomDay, 'd').format('L');
    console.log("Project", this);
  }
}
