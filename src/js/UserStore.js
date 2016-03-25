import _ from 'lodash';
import utils from './utils';

export default class UserStore {
  constructor(textManager) {
    console.log('Initing UserStore...');

    this.user = {
      jobs: [],
      cash: 0,
      skills: {
        web: 1,
        game: 1,
        mobile: 1,
      }
    }

    this.game = {
      progress: 0,
      file: 'game',
      type: 'game',
      skill: 'game',
      length: textManager.getCodeLentgh('game')
    }

    this.jobs = []

    console.log('User Store inited');
  }

  getGameData() {
    return this.game;
  }

  getSkillsTxt() {
    let keys = Object.keys(this.user.skills);
    let txt = "User skills<br>";
      txt += "========================================================<br>"
    keys.forEach(key => {
      let skill = this.user.skills[key];
      txt += key + " : " + skill +"<br>"
    })
    return txt;
  }

  getCash() {
    return this.user.cash;
  }

  updateSkill(project) {
    let random = utils.random(1,100);
    if(random >= 99) {
      let skill = project.skill;
      this.user.skills[skill] += 0.5;
    }
  }

  saveProject(project = {}) {
    this.updateSkill(project);
    if(project.type === 'game') {
      this.game = _.assign({}, this.game, project);
      return true;
    } else {
      let job = this.user.jobs[project.index];
      if(!job) return 'false';
      else {
        job = _.assign({}, job, project);
        return true;
      }
    }
    console.log("New game data:", this);
  }

  setJobs(data = []) {
    this.jobs = data;
  }

  getJobs() {
    return this.jobs;
  }

  completeProject(project) {
    console.log('Going to complete: ',project);
    if(project.progress === project.length && !project.complete) {
      project.complete = true;
      this.user.cash += project.price;
    }
  }

  getProjectsTxt() {
    //@TODO: Random texts based on skills
    let jobs = this.user.jobs;
    let txt = "game : Your personal shit... oh sorry game<br>";
    console.log("Getting projects:", jobs);
    jobs.forEach( (job, index) => {
      let status = job.complete ? "complete" : 'in progress';
      txt += `job#${index} : ${job.title} payment: $${job.price}<br> status: ${status}<br>`;
    })
    return txt;
  }

  getProject(projectName) {
    console.log("Getting project name: ", projectName);
    if(projectName === 'game') return this.game;
    else {
      let hashSignIndex = projectName.indexOf('#')+1;
      if(!hashSignIndex) return null;
      let index = projectName.substring(hashSignIndex, projectName.length);
      let job = this.user.jobs[index];
      if(job && job.complete) return null;
      return job;
    }
  }

  setUserJob(index) {
    console.log('Setting User Job: index ', index);
    if(index > this.jobs.length-1) return null;

    let job = this.jobs[index];
    this.jobs.splice(index, 1);
    if(job) this.user.jobs.push(job);

    console.log('job ', job);
    return job;
  }
}
