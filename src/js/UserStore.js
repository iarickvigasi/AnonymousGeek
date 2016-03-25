import _ from 'lodash';

export default class UserStore {
  constructor() {
    console.log('Initing UserStore...');

    this.user = {
      jobs: [],
      skill: 1,
    }

    this.game = {
      progress: 0,
      file: 'game',
      type: 'game'
    }

    this.jobs = []

    console.log('User Store inited');
  }

  getGameData() {
    return this.game;
  }

  saveProject(project = {}) {
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

  getProjects() {
    //@TODO: Random texts based on skills
    let jobs = this.user.jobs;
    let txt = "game : Your personal shit... oh sorry game<br>";
    console.log("Getting projects:", jobs);
    jobs.forEach( (job, index) => {
      txt += `job#${index} : ${job.title} payment: $${job.price}<br>`
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
