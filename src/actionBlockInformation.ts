export namespace ActionBlock {
  export const shortHumanMap: { [key: string]: string } = {
    bprel: "Release",
    bpre: "End",
    bpr: "Press",
    //bstn: "undefined",
    bste: "End",
    bst0: "Button Off",
    cb: "Code Block",
    c: "Comment Block",
    el: "Else",
    ei: "Else if",
    en: "End",
    if: "If",
    sn: "Element Name",
    elrel: "Rotate Right",
    elre: "End",
    elr: "Rotate Left",
    eprel: "Just Rotate",
    epre: "End",
    epr: "Push & Rotate",
    eprlrel: "Just Rotate Right",
    eprlrei1: "Push & Rotate Right",
    eprlrei2: "Just Rotate Left",
    eprlre: "End",
    eprlr: "Push & Rotate Left",
    for: "Repeater Loop",
    fen: "End",
    fst: "Function",
    ggms: "GamePad Axis",
    ggbs: "GamePad Button",
    glat: "Start Animation",
    glap: "Stop Animation",
    glc: "Color",
    glp: "Intensity",
    glut: "Lookup",
    enl: "End",
    gks: "Keyboard",
    gms: "MIDI",
    gmsh: "MIDI 14",
    gmnp: "MIDI NRPN",
    gmss: "MIDI SysEX",
    gmbs: "Mouse Button",
    gmms: "Mouse Move",
    raw: "RAW code",
    sbc: "Button Mode",
    sec: "Encoder Mode",
    sen: "Endless Mode",
    spc: "Potmeter Mode",
    gts: "Clock Source",
    gtt: "Start",
    gtp: "Stop",
    g: "Global",
    l: "Locals",
    s: "Self",
  };

  const displayNameToShortMap: { [key: string]: string } = Object.keys(
    shortHumanMap
  ).reduce((acc, short) => {
    const displayName = shortHumanMap[short];
    acc[displayName] = short;
    return acc;
  }, {} as { [key: string]: string });

  export function displayNameToShort(displayName: string): string | undefined {
    return displayNameToShortMap[displayName];
  }

  export function shortToDisplayName(short: string): string | undefined {
    return shortHumanMap[short];
  }
}
