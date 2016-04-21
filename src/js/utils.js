let utils = {
  random(min, max) {
    let rand = min + Math.random() * (max - min)
    rand = Math.round(rand);
    return rand;
  },

  getProgresPercentage(project) {
    return  Math.round(project.progress*100/project.length);
  }
}

export default utils;
