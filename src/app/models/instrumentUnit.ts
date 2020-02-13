export class InstrumentUnit {
  frame: number
  grasper: number
  harmonicScalpel: number
  j_hook: number
  ligasure: number
  scissors: number
  stapler: number
  aspirator: number
  swapholder: number
  siliconeDrain: number
  clipper: number
  i_hook: number
  needleHolder: number

  constructor(frame: string,
    grasper: string,
    harmonicScalpel: string,
    j_hook: string,
    ligasure: string,
    scissors: string,
    stapler: string,
    aspirator: string,
    swapholder: string,
    siliconeDrain: string,
    clipper: string,
    i_hook: string,
    needleHolder: string) {
    this.frame = parseInt(frame);
    this.grasper = parseInt(grasper)
    this.harmonicScalpel = parseInt(harmonicScalpel)
    this.j_hook = parseInt(j_hook)
    this.ligasure = parseInt(ligasure)
    this.scissors = parseInt(scissors)
    this.stapler = parseInt(stapler)
    this.aspirator = parseInt(aspirator)
    this.swapholder = parseInt(swapholder)
    this.siliconeDrain = parseInt(siliconeDrain)
    this.clipper = parseInt(clipper)
    this.i_hook = parseInt(i_hook)
    this.needleHolder = parseInt(needleHolder)
  }
}