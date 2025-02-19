import * as protocol_data from "./grid_protocol_bot.json";
const grid_protocol: Record<string, string> = protocol_data;

import lodash from "lodash";

export enum ModuleType {
  BU16 = "BU16",
  EF44 = "EF44",
  EN16 = "EN16",
  PBF4 = "PBF4",
  PO16 = "PO16",
  TEK2 = "TEK2",
  TEK1 = "TEK1",
  VSN0 = "VSN0",
  VSN1L = "VSN1L",
  VSN1R = "VSN1R",
  VSN2 = "VSN2",
  PB44 = "PB44",
}

export enum EventType {
  SETUP = "setup",
  POTMETER = "potmeter",
  ENCODER = "encoder",
  BUTTON = "button",
  UTILITY = "utility",
  MIDIRX = "midi rx",
  TIMER = "timer",
  ENDLESS = "endless",
}

export function NumberToEventType(value: Number) {
  switch (value) {
    case 0:
      return EventType.SETUP;
    case 1:
      return EventType.POTMETER;
    case 2:
      return EventType.ENCODER;
    case 3:
      return EventType.BUTTON;
    case 4:
      return EventType.UTILITY;
    case 5:
      return EventType.MIDIRX;
    case 6:
      return EventType.TIMER;
    case 7:
      return EventType.ENDLESS;
    default:
      throw "Unknown event type";
  }
}

export function EventTypeToNumber(value: EventType) {
  switch (value) {
    case EventType.SETUP:
      return 0;
    case EventType.POTMETER:
      return 1;
    case EventType.ENCODER:
      return 2;
    case EventType.BUTTON:
      return 3;
    case EventType.UTILITY:
      return 4;
    case EventType.MIDIRX:
      return 5;
    case EventType.TIMER:
      return 6;
    case EventType.ENDLESS:
      return 7;
    default:
      throw "Unknown event type";
  }
}

export enum ElementType {
  SYSTEM = "system",
  BUTTON = "button",
  POTMETER = "potmeter",
  ENCODER = "encoder",
  FADER = "fader",
  ENDLESS = "endless",
  LCD = "lcd",
}

export enum Architecture {
  ESP32 = "esp32",
  D51 = "d51",
  VIRTUAL = "virtual",
}

const editor_lua_properties = [
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "*",
    human: "*",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "+",
    human: "+",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "-",
    human: "-",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "%",
    human: "%",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "//",
    human: "//",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "/",
    human: "/",
  },
  {
    type: "arithmetic_operator",
    allowed: ["2", "1", "3"],
    short: "^",
    human: "^",
  },

  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: "==",
    human: "==",
  },
  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: "~=",
    human: "~=",
  },
  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: ">",
    human: ">",
  },
  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: "<",
    human: "<",
  },
  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: ">=",
    human: ">=",
  },
  {
    type: "relational_operator",
    allowed: ["2", "1", "3"],
    short: "<=",
    human: "<=",
  },

  {
    type: "logical_operator",
    allowed: ["2", "1", "3"],
    short: "and",
    human: "and",
  },
  {
    type: "logical_operator",
    allowed: ["2", "1", "3"],
    short: "or",
    human: "or",
  },
  {
    type: "logical_operator",
    allowed: ["2", "1", "3"],
    short: "not",
    human: "not",
  },
];

function returnDeepestObjects(obj: any) {
  var found: any = {};
  let parent: string = "";

  function _find(obj: any, d: any) {
    for (var key in obj) {
      if (d == 0) {
        parent = key;
        found[parent] = [];
      }

      if (typeof obj[key] === "object") {
        _find(obj[key], d + 1);
      } else {
        if (found[parent].indexOf(obj) == -1) {
          found[parent].push(obj);
        }
      }
    }
  }
  _find(obj, 0);

  return found;
}

function mapObjectsToArray(array: any[], object: any) {
  function mapper(baseArray: any[], type: any, allowed: any) {
    return (baseArray = baseArray.map((e, i) => {
      return { type: type, allowed: allowed, ...e };
    }));
  }

  for (const key in object as any) {
    if (key == "B") {
      array = [...array, ...mapper(object[key], "button", ["3"])];
    }

    if (key == "EP") {
      array = [...array, ...mapper(object[key], "endless", ["2"])];
    }

    if (key == "E") {
      array = [...array, ...mapper(object[key], "encoder", ["2"])];
    }

    if (key == "G") {
      array = [...array, ...mapper(object[key], "global", ["2", "3", "1"])];
    }

    if (key == "P") {
      array = [...array, ...mapper(object[key], "potmeter", ["1"])];
    }

    if (key == "KW") {
      array = [...array, ...mapper(object[key], "keyword", ["1", "2", "3"])];
    }
  }

  return array;
}

function createNestedObject(base: any, names: any, value: any) {
  // to avoid array property overwriting

  if (value == "epva") {
    //console.log(base, names, value);
  }

  let _names = [...names];

  // If a value is given, remove the last name and keep it for later:
  var lastName = arguments.length === 3 ? _names.pop() : false;

  // Walk the hierarchy, creating new objects where needed.
  // If the lastName was removed, then the last object is not set yet:
  for (var i = 0; i < _names.length; i++) {
    base = base[_names[i]] = base[_names[i]] || {};
  }

  // If a value was given, set it to the last name:
  if (lastName) base = base[lastName] = value;

  // Return the last object in the hierarchy:
  return base;
}

// global id for serial message generation
let global_id: number = 0;

let [class_name_from_code, class_code_from_name] =
  class_code_decode_encode_init();
let [instr_name_from_code, instr_code_from_name] =
  instr_code_decode_encode_init();

let class_parameters: any = parse_class_parameters_from_protocol();
let brc_parameters: any = parse_brc_parameters_from_protocol();

function parse_brc_parameters_from_protocol() {
  let brcparams: any = {};

  for (const key in grid_protocol as any) {
    if (typeof grid_protocol[key] !== "object") {
      if (key.startsWith("GRID_BRC_") && key.endsWith("length")) {
        let splitted = key.split("_");
        let parameter_name: string = splitted[splitted.length - 2];

        if (brcparams[parameter_name] === undefined) {
          brcparams[parameter_name] = {};
        }

        brcparams[parameter_name].name = parameter_name;
        brcparams[parameter_name].length = parseInt(grid_protocol[key]);
      } else if (key.startsWith("GRID_BRC_") && key.endsWith("offset")) {
        let splitted = key.split("_");
        let parameter_name: string = splitted[splitted.length - 2];

        if (brcparams[parameter_name] === undefined) {
          brcparams[parameter_name] = {};
        }

        brcparams[parameter_name].offset = parseInt(grid_protocol[key]);
      }
    }
  }

  return brcparams;
}

function class_code_decode_encode_init() {
  let name_from_code: any = {};
  let code_from_name: any = {};

  for (const key in grid_protocol as any) {
    if (typeof grid_protocol[key] !== "object") {
      if (key.startsWith("GRID_CLASS_") && key.endsWith("code")) {
        let splitted = key.split("_");
        let class_name: string = splitted[splitted.length - 2];
        name_from_code[grid_protocol[key]] = class_name;
        code_from_name[class_name] = grid_protocol[key];
      }
    }
  }

  return [name_from_code, code_from_name];
}

function instr_code_decode_encode_init() {
  let instrcodes: any = {};
  let instrnames: any = {};

  for (const key in grid_protocol as any) {
    if (typeof grid_protocol[key] !== "object") {
      if (key.startsWith("GRID_INSTR_") && key.endsWith("code")) {
        let splitted = key.split("_");
        let instr_name = splitted[splitted.length - 2].toUpperCase();
        instrcodes[grid_protocol[key].toLowerCase()] = instr_name;
        instrnames[instr_name] = grid_protocol[key].toLowerCase();
      }
    }
  }

  return [instrcodes, instrnames];
}

function parse_class_parameters_from_protocol() {
  let classparams: any = {};

  for (const key in grid_protocol as any) {
    if (typeof grid_protocol[key] !== "object") {
      if (key === "GRID_CLASS_length" || key === "GRID_CLASS_offset") {
        // they keys should have been depricated, are not useful, even in firmware
      } else if (key.startsWith("GRID_CLASS_") && key.endsWith("length")) {
        let splitted = key.split("_");
        let class_name: string = splitted[splitted.length - 3];

        let parameter_name: string = splitted[splitted.length - 2];
        let parameter_length = parseInt(grid_protocol[key]);

        if (classparams[class_name] === undefined) {
          classparams[class_name] = {};
        }
        if (classparams[class_name][parameter_name] === undefined) {
          classparams[class_name][parameter_name] = {};
        }

        classparams[class_name][parameter_name].name = parameter_name;
        classparams[class_name][parameter_name].length = parameter_length;
      } else if (key.startsWith("GRID_CLASS_") && key.endsWith("offset")) {
        let splitted = key.split("_");
        let class_name: string = splitted[splitted.length - 3];

        let parameter_name: string = splitted[splitted.length - 2];
        let parameter_offset = parseInt(grid_protocol[key]);

        if (classparams[class_name] === undefined) {
          classparams[class_name] = {};
        }
        if (classparams[class_name][parameter_name] === undefined) {
          classparams[class_name][parameter_name] = {};
        }

        classparams[class_name][parameter_name].name = parameter_name;
        classparams[class_name][parameter_name].offset = parameter_offset;
      }
    }
  }

  return classparams;
}

function read_integer_from_asciicode_array(
  array: number[],
  offset: number,
  length: number
): number | undefined {
  // check is parameters are valid, make sure we don't overrun the buffer
  if (array.length < offset + length) {
    //console.log(`Array overrun error! array.length: ${array.length}, offset: ${offset}, length: ${length}`);
    return undefined;
  }

  let ret_value: any = 0;
  for (let i = 0; i < length; i++) {
    ret_value +=
      parseInt("0x" + String.fromCharCode(array[offset + i])) *
      Math.pow(16, length - 1 - i);
  }

  // if elemnt in ascii array was not valid hex character (0...9 or a...f)
  if (Number.isNaN(ret_value)) {
    return undefined;
  }

  return ret_value;
}

function write_integer_to_asciicode_array(
  array: any[],
  offset: number,
  length: number,
  value: any
) {
  let hex_value_array = value.toString(16).padStart(length, "0").split("");

  for (let i = offset; i < offset + length; i++) {
    array[i] = hex_value_array[i - offset].charCodeAt(0);
  }

  return array;
}

function write_string_to_asciicode_array(
  array: any[],
  offset: number,
  length: number,
  value: any
) {
  let string_in_array = value.split("");

  for (let i = offset; i < offset + length; i++) {
    array[i] = string_in_array[i - offset].charCodeAt(0);
  }

  return array;
}

function read_string_from_asciicode_array(
  array: any[],
  offset: number,
  length: number
) {
  // check is parameters are valid, make sure we don't overrun the buffer
  if (array.length > 0 && array.length < offset + length) {
    // console.log(`Array overrun error! array.length: ${array.length}, offset: ${offset}, length: ${length}`);
    return undefined;
  }

  let ret_array: any = [];
  let ret_value = "";

  if (length > 0) {
    // fixed length
    // not implemented
  } else {
    // variable length

    for (let i = offset; i < array.length; i++) {
      ret_array[i - offset] = array[i];
      ret_value += String.fromCharCode(array[i]);
    }
  }

  //console.log(String.fromCharCode(array),ret_value);

  return ret_value;
}

// helper functions
function utility_genId() {
  if (global_id / 255 == 1) {
    global_id = 0;
  }
  return (global_id += 1);
}

interface CEEAT {
  desc: string;
  value: number;
  key: string;
}

// control element event assignment table.
export const CEEAT: Record<EventType, CEEAT> = {
  [EventType.SETUP]: {
    desc: EventType.SETUP,
    value: 0,
    key: "INIT",
  },

  [EventType.POTMETER]: {
    desc: EventType.POTMETER,
    value: 1,
    key: "AC",
  },

  [EventType.ENCODER]: {
    desc: EventType.ENCODER,
    value: 2,
    key: "EC",
  },

  [EventType.BUTTON]: {
    desc: EventType.BUTTON,
    value: 3,
    key: "BC",
  },

  [EventType.UTILITY]: {
    desc: EventType.UTILITY,
    value: 4,
    key: "MAP",
  },

  [EventType.MIDIRX]: {
    desc: EventType.MIDIRX,
    value: 5,
    key: "MIDIRX",
  },

  [EventType.TIMER]: {
    desc: EventType.TIMER,
    value: 6,
    key: "TIMER",
  },

  [EventType.ENDLESS]: {
    desc: EventType.ENDLESS,
    value: 7,
    key: "ENDLESS",
  },
};

// Define the module types and their associated element types
const moduleElements: {
  [key in ModuleType]: ElementType[];
} = {
  [ModuleType.PO16]: [
    ...Array(16).fill(ElementType.POTMETER),
    ...Array(239), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.PBF4]: [
    ...Array(4).fill(ElementType.POTMETER),
    ...Array(4).fill(ElementType.FADER),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(243), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.BU16]: [
    ...Array(16).fill(ElementType.BUTTON),
    ...Array(239), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.EN16]: [
    ...Array(16).fill(ElementType.ENCODER),
    ...Array(239), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.EF44]: [
    ...Array(4).fill(ElementType.ENCODER),
    ...Array(4).fill(ElementType.FADER),
    ...Array(247), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.TEK2]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(2).fill(ElementType.ENDLESS),
    ...Array(245), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.TEK1]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.ENDLESS),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.LCD),
    ...Array(241), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.VSN0]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(2).fill(ElementType.ENDLESS),
    ...Array(245), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.VSN1]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.ENDLESS),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.LCD),
    ...Array(241), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.VSN1R]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.ENDLESS),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.LCD),
    ...Array(241), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.VSN2]: [
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.LCD),
    ...Array(4).fill(ElementType.BUTTON),
    ...Array(1).fill(ElementType.LCD),
    ...Array(237), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
  [ModuleType.PB44]: [
    ...Array(8).fill(ElementType.POTMETER),
    ...Array(8).fill(ElementType.BUTTON),
    ...Array(239), // Filling with undefined values until index 254
    ElementType.SYSTEM, // Add system element at index 255
  ],
};

// elementEvents based on control element type and the CEEA table
const elementEvents = {
  [ElementType.BUTTON]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_BUTTON_INIT,
    },
    {
      ...CEEAT[EventType.BUTTON],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_BUTTON_BUTTON,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.POTMETER]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_POTMETER_INIT,
    },
    {
      ...CEEAT[EventType.POTMETER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_POTMETER_POTMETER,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.FADER]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_POTMETER_INIT,
    },
    {
      ...CEEAT[EventType.POTMETER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_POTMETER_POTMETER,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.ENCODER]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_ENCODER_INIT,
    },
    {
      ...CEEAT[EventType.BUTTON],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_BUTTON_BUTTON,
    },
    {
      ...CEEAT[EventType.ENCODER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_ENCODER_ENCODER,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.ENDLESS]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_ENDLESS_INIT,
    },
    {
      ...CEEAT[EventType.BUTTON],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_ENDLESS_BUTTON,
    },
    {
      ...CEEAT[EventType.ENDLESS],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_ENDLESS_ENDLESS,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.SYSTEM]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_INIT,
    },
    {
      ...CEEAT[EventType.UTILITY],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_MAPMODE,
    },
    {
      ...CEEAT[EventType.MIDIRX],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_MIDIRX,
    },
    {
      ...CEEAT[EventType.TIMER],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_SYSTEM_TIMER,
    },
  ],
  [ElementType.LCD]: [
    {
      ...CEEAT[EventType.SETUP],
      defaultConfig: grid_protocol.GRID_ACTIONSTRING_LCD_INIT,
    },
  ],
};

interface GridClass {
  [key: string]: any;
}

interface GridLua {
  [key: string]: any;
}

interface GridBRC {
  [key: string]: any;
}

interface GridEvents {
  [key: string]: any;
}

interface GridParameters {
  [key: string]: any;
}

interface GridConst {
  [key: string]: any;
}

interface GridInstr {
  [key: string]: any;
}

interface HWCFG {
  [key: string]: any;
}

interface LuaAutocompleteFunction {
  label: string;
  type: "function";
  elementtype?: string;
}

interface PropertiesObject {
  BRC: GridBRC;
  LUA: GridLua[];
  LUA_AUTOCOMPLETE: LuaAutocompleteFunction[];
  CLASSES: GridClass;
  HWCFG: HWCFG;
  EVENTS: GridEvents;
  CONST: GridConst;
  INSTR: GridInstr;
  VERSION: GridConst;
  PARAMETERS: GridParameters;
  HEARTBEAT_INTERVAL: number;
  CONFIG_LENGTH: number;
  SESSION: string;
}

class GridProperty {
  private props: PropertiesObject;
  constructor() {
    this.props = this.parse_properties();
  }

  public getProperty(key: string) {
    const obj = Object.entries(this.props).find(
      ([objKey, objValue]) => key === objKey
    );
    if (typeof obj === "undefined") {
      throw `GridProtocol: Unknown property of ${key}!`;
    }

    return obj[1];
  }

  private parse_properties(): PropertiesObject {
    let HWCFG: HWCFG = {};
    let CONST: GridConst = {};
    let INSTR: GridInstr = {};
    let CLASSES: GridClass = {};
    let EVENTS: GridEvents = {};
    let LUA: GridLua = {};
    let BRC: GridBRC = {};
    let VERSION: GridConst = {};
    let PARAMETERS: GridParameters = {};
    let HEARTBEAT_INTERVAL: number = 0;
    let CONFIG_LENGTH: number = 0;
    let LUA_AUTOCOMPLETE: LuaAutocompleteFunction[] = [];

    for (const key in grid_protocol as any) {
      if (typeof grid_protocol[key] !== "object") {
        // GRID MODULE HWCFGS
        if (key.startsWith("GRID_MODULE_")) {
          const paramName: string = key.substring("GRID_MODULE_".length);
          HWCFG[paramName] = +grid_protocol[key];
        }

        // GRID HEARTBEAT INTERVAL
        if (key == "GRID_PARAMETER_HEARTBEATINTERVAL_us") {
          HEARTBEAT_INTERVAL = +grid_protocol[key] / 1000;
          console.log(
            "HEARTBEAT_INTERVAL",
            grid_protocol[key],
            HEARTBEAT_INTERVAL
          );
        }

        if (key == "GRID_PARAMETER_ACTIONSTRING_maxlength") {
          CONFIG_LENGTH = +grid_protocol[key];
        }

        // GRID INSTRUCTIONS
        if (key.startsWith("GRID_INSTR")) {
          let paramName = key.slice(11).slice(0, -5);
          let dec = parseInt(grid_protocol[key], 16);
          INSTR[paramName] = dec;
        }

        // GRID CONSTS TO CONSTRUCT SERIAL DATA
        if (key.startsWith("GRID_CONST")) {
          let paramName = key.slice(11);
          let dec = parseInt(grid_protocol[key], 16);
          CONST[paramName] = dec;
        }

        // GRID TEMPLATE PARAMETERS
        if (key.startsWith("GRID_PARAMETER_TEMPLATEINDEX_")) {
          const param = key
            .substr("GRID_PARAMETER_TEMPLATEINDEX_".length)
            .slice(0, -5);
          PARAMETERS[param] = grid_protocol[key];
        }

        // GRID PROTOCOL VERSION
        if (key.startsWith("GRID_PROTOCOL_VERSION_")) {
          const param = key.substr("GRID_PROTOCOL_VERSION_".length);
          VERSION[param] = +grid_protocol[key];
        }

        // GRID BRC
        if (key.startsWith("GRID_BRC_")) {
          let paramSet = key.split("_");
          let value: any = grid_protocol[key];
          if (paramSet[paramSet.length - 1] !== "frame") {
            createNestedObject(BRC, paramSet.slice(2), value);
          }
        }

        // GRID EVENT TYPES
        if (key.startsWith("GRID_EVENT")) {
          let paramSet = key.split("_");
          EVENTS[paramSet[2]] = grid_protocol[key];
        }

        // GRID LUA PROPERTIES
        if (
          key.startsWith("GRID_LUA_FNC_") &&
          !/_ACTION_/gm.test(key) &&
          !/_LIST_/gm.test(key)
        ) {
          let paramSet = key.split("_");
          let value: any = grid_protocol[key];
          createNestedObject(LUA, paramSet.slice(3), value);
        }

        // AUTOCOMPLETE FUNCTIONS
        if (key.startsWith("GRID_LUA_FNC_G") && key.endsWith("_human")) {
          let value: any = grid_protocol[key];
          LUA_AUTOCOMPLETE.push({
            label: value,
            type: "function",
          });
        }

        if (key.startsWith("GRID_LUA_FNC_EP") && key.endsWith("_human")) {
          let value: any = grid_protocol[key];
          LUA_AUTOCOMPLETE.push({
            label: "self:" + value,
            type: "function",
            elementtype: ElementType.ENDLESS,
          });
          LUA_AUTOCOMPLETE.push({
            label: "element[0]:" + value,
            type: "function",
            elementtype: ElementType.SYSTEM,
          });
        } else if (key.startsWith("GRID_LUA_FNC_E") && key.endsWith("_human")) {
          let value: any = grid_protocol[key];
          LUA_AUTOCOMPLETE.push({
            label: "self:" + value,
            type: "function",
            elementtype: ElementType.ENCODER,
          });
          LUA_AUTOCOMPLETE.push({
            label: "element[0]:" + value,
            type: "function",
            elementtype: ElementType.SYSTEM,
          });
        }

        if (key.startsWith("GRID_LUA_FNC_B") && key.endsWith("_human")) {
          let value: any = grid_protocol[key];
          LUA_AUTOCOMPLETE.push({
            label: "self:" + value,
            type: "function",
            elementtype: ElementType.BUTTON,
          });
          LUA_AUTOCOMPLETE.push({
            label: "element[0]:" + value,
            type: "function",
            elementtype: ElementType.SYSTEM,
          });
        }

        if (key.startsWith("GRID_LUA_FNC_P") && key.endsWith("_human")) {
          let value: any = grid_protocol[key];
          LUA_AUTOCOMPLETE.push({
            label: "self:" + value,
            type: "function",
            elementtype: ElementType.POTMETER,
          });
          LUA_AUTOCOMPLETE.push({
            label: "element[0]:" + value,
            type: "function",
            elementtype: ElementType.SYSTEM,
          });
        }

        // GRID LUA KEYWORDS
        if (key.startsWith("GRID_LUA_KW_")) {
          let paramSet = key.split("_");
          let value: any = grid_protocol[key];
          createNestedObject(LUA, paramSet.slice(2), value);
        }

        // GRID CLASSES
        if (key.startsWith("GRID_CLASS_")) {
          let paramSet = key.split("_");
          let value: any = grid_protocol[key];
          if (paramSet[paramSet.length - 1] !== "frame") {
            // not sure why fram is unsupported...
            createNestedObject(CLASSES, paramSet.slice(2), value);
          }
        }
      }
    }

    return {
      BRC: BRC,
      LUA: this.extendLua(LUA),
      LUA_AUTOCOMPLETE: LUA_AUTOCOMPLETE,
      CLASSES: CLASSES,
      HWCFG: HWCFG,
      EVENTS: EVENTS,
      CONST: CONST,
      INSTR: INSTR,
      VERSION: VERSION,
      PARAMETERS: PARAMETERS,
      HEARTBEAT_INTERVAL: HEARTBEAT_INTERVAL,
      CONFIG_LENGTH: CONFIG_LENGTH,
      SESSION: Math.floor(Math.random() * 255)
        .toString(16)
        .padStart(2, "0"),
    };
  }

  private extendLua(propObject: GridLua): GridLua[] {
    const deepObjects = returnDeepestObjects(propObject);
    //console.log(deepObjects)
    const array = mapObjectsToArray(editor_lua_properties, deepObjects);
    return array;
  }
}

import { ActionBlock as _ActionBlock } from "./actionBlockInformation";
export namespace grid {
  const properties = new GridProperty();
  export const ActionBlock = _ActionBlock;

  export function getProperty(key: string): any {
    return properties.getProperty(key);
  }

  export function module_type_from_hwcfg(
    hwcfg: number
  ): ModuleType | undefined {
    const HWCFG = grid.getProperty("HWCFG");
    let type: any = undefined;

    for (const key in HWCFG as any) {
      if (HWCFG[key] === hwcfg) {
        type = ModuleType[key.split("_")[0] as keyof typeof ModuleType];
      }
    }

    return type;
  }

  export function get_module_element_list(type: ModuleType) {
    return moduleElements[type];
  }

  export function get_element_events(type: ElementType) {
    return elementEvents[type];
  }

  export function module_architecture_from_hwcfg(hwcfg: number) {
    if (hwcfg % 2 === 1) {
      return Architecture.ESP32;
    } else {
      return Architecture.D51;
    }
  }

  export function encode_packet(descriptor: any) {
    if (descriptor === undefined) {
      return;
    }

    let descr: any = lodash.cloneDeep(descriptor);

    descr.brc_parameters.ID = utility_genId();
    descr.brc_parameters.SX = 0;
    descr.brc_parameters.SY = 0;
    descr.brc_parameters.SESSION = properties.getProperty("SESSION");
    descr.brc_parameters.MSGAGE = 0;

    if (descr.brc_parameters.DX !== undefined) {
      descr.brc_parameters.DX = parseInt(descr.brc_parameters.DX) + 127;
    } else {
      descr.brc_parameters.DX = 0; // assume global
    }

    if (descr.brc_parameters.DY !== undefined) {
      descr.brc_parameters.DY = parseInt(descr.brc_parameters.DY) + 127;
    } else {
      descr.brc_parameters.DY = 0; // assume global
    }

    // put brc parameters into hexarray
    let BRC_ARRAY: any = [];
    BRC_ARRAY.push(properties.getProperty("CONST").SOH);
    BRC_ARRAY.push(properties.getProperty("CONST").BRC);

    for (const key in brc_parameters as any) {
      let offset = brc_parameters[key].offset;
      let length = brc_parameters[key].length;
      let value: any = descr.brc_parameters[key];

      if (descr.brc_parameters[key] === undefined) {
        write_integer_to_asciicode_array(BRC_ARRAY, offset, length, 0);
      } else {
        write_integer_to_asciicode_array(BRC_ARRAY, offset, length, value);
      }
    }

    BRC_ARRAY.push(properties.getProperty("CONST").EOB);

    // put class parameters into hexarray
    let CLASS_ARRAY: any = [];

    CLASS_ARRAY.push(properties.getProperty("CONST").STX);

    write_integer_to_asciicode_array(
      CLASS_ARRAY,
      1,
      3,
      parseInt(class_code_from_name[descr.class_name])
    );
    write_integer_to_asciicode_array(
      CLASS_ARRAY,
      4,
      1,
      parseInt(instr_code_from_name[descr.class_instr])
    );

    for (const key in class_parameters[descr.class_name] as any) {
      let offset = class_parameters[descr.class_name][key].offset;
      let length = class_parameters[descr.class_name][key].length;
      let value: any = descr.class_parameters[key];

      if (length > 0) {
        if (value === undefined) {
          // skip
          //console.log("MISSING CLASS PARAMETER!")
        } else {
          write_integer_to_asciicode_array(CLASS_ARRAY, offset, length, value);
        }
      } else {
        if (value !== undefined) {
          write_string_to_asciicode_array(
            CLASS_ARRAY,
            offset,
            value.length,
            value
          );
        }
      }
    }

    CLASS_ARRAY.push(properties.getProperty("CONST").ETX);
    CLASS_ARRAY.push(properties.getProperty("CONST").EOT);

    let MESSAGE_ARRAY: any = [...BRC_ARRAY, ...CLASS_ARRAY];

    var len = MESSAGE_ARRAY.length;
    write_integer_to_asciicode_array(
      MESSAGE_ARRAY,
      brc_parameters.LEN.offset,
      brc_parameters.LEN.length,
      len
    );

    let checksum = [...MESSAGE_ARRAY]
      .reduce((a, b) => a ^ b)
      .toString(16)
      .padStart(2, "0");

    MESSAGE_ARRAY.push(checksum.charCodeAt(0));
    MESSAGE_ARRAY.push(checksum.charCodeAt(1));

    return {
      serial: MESSAGE_ARRAY,
      id: descr.brc_parameters.ID,
    }; // return id for checking communication issues
  }

  export function decode_packet_frame(asciicode_array: number[]) {
    // use the last two characters to determine the received checksum
    let received_checksum =
      parseInt(
        "0x" + String.fromCharCode(asciicode_array[asciicode_array.length - 1])
      ) *
        1 +
      parseInt(
        "0x" + String.fromCharCode(asciicode_array[asciicode_array.length - 2])
      ) *
        16;

    // use the whole packet except the last two characters to determine the calculated checksum
    let calculated_checksum = 0;

    for (let i = 0; i < asciicode_array.length - 2; i++) {
      calculated_checksum ^= asciicode_array[i];
    }
    calculated_checksum %= 256;

    // drop the packet if there was a checksum mismatch, otherwise continue parsing it
    if (received_checksum !== calculated_checksum) {
      console.log(
        "Checksum mismatch, packet dropped! Received: " +
          received_checksum +
          " Calculated: " +
          calculated_checksum
      );
      return undefined;
    }

    // check if SOH character is found
    if (asciicode_array[0] !== parseInt(grid_protocol.GRID_CONST_SOH)) {
      console.log("Frame error: SOH not found!");
      return undefined;
    }

    // check if BRC character is found
    if (asciicode_array[1] !== parseInt(grid_protocol.GRID_CONST_BRC)) {
      console.log("Frame error: BRC not found!");
      return undefined;
    }

    // check if EOB character is found
    if (
      asciicode_array[asciicode_array.length - 3] !==
      parseInt(grid_protocol.GRID_CONST_EOT)
    ) {
      console.log("Frame error: EOT not found!");
      return undefined;
    }

    // decode all of the BRC parameters
    let brc: any = {};

    for (const key in brc_parameters as any) {
      brc[brc_parameters[key].name] = read_integer_from_asciicode_array(
        asciicode_array,
        brc_parameters[key].offset,
        brc_parameters[key].length
      );
    }

    brc.SX -= 127;
    brc.SY -= 127;
    brc.DX -= 127;
    brc.DY -= 127;

    // check if BRC_LEN parameter actually matches the length of the asciicode_array - LENGTHOFCHECKSUM
    if (asciicode_array.length - 2 !== brc.LEN) {
      console.log(
        `Frame error: Invalid BRC_LEN parameter! asciicode_array.length: ${
          asciicode_array.length
        }, brc.LEN: ${brc.LEN}, brc_len should be: ${
          asciicode_array.length - 2
        }`
      );
      return undefined;
    }

    // check if EOB character is found
    if (asciicode_array[22] !== parseInt(grid_protocol.GRID_CONST_EOB)) {
      console.log("Frame error: EOB not found!");
      return undefined;
    }

    let class_asciicode_array = asciicode_array.slice(23, -3);

    let class_blocks: any = [];

    for (let i = 0, start_index = 0; i < class_asciicode_array.length; i++) {
      if (class_asciicode_array[i] === parseInt(grid_protocol.GRID_CONST_ETX)) {
        class_blocks.push(class_asciicode_array.slice(start_index, i + 1));
        start_index = i + 1;
      }
    }

    let return_array: any = [];

    for (let i = 0; i < class_blocks.length; i++) {
      // check first and last charaters, make sure they are STX and ETX
      if (
        class_blocks[i][0] === parseInt(grid_protocol.GRID_CONST_STX) &&
        class_blocks[i][class_blocks[i].length - 1] ===
          parseInt(grid_protocol.GRID_CONST_ETX)
      ) {
        let current: any = {};
        current.raw = class_blocks[i].slice(1, -1);
        current.brc_parameters = brc;

        return_array.push(current);
      } else {
        console.log("Frame error: STX ETX mismatch!");
        return undefined;
      }
    }

    return return_array;
  }

  export function decode_packet_classes(raw_class_array: any[]) {
    if (raw_class_array === undefined) {
      return undefined;
    }

    raw_class_array.forEach((raw_class, i) => {
      let class_code_string: string =
        "0x" +
        String.fromCharCode(raw_class.raw[0]) +
        String.fromCharCode(raw_class.raw[1]) +
        String.fromCharCode(raw_class.raw[2]);
      let class_instr_string = "0x" + String.fromCharCode(raw_class.raw[3]);

      if (class_name_from_code[class_code_string] !== undefined) {
        raw_class.class_name = class_name_from_code[class_code_string];

        raw_class.class_instr = instr_name_from_code[class_instr_string];

        raw_class.class_parameters = {};

        raw_class.timestamp = Date.now();

        for (const key in class_parameters[raw_class.class_name] as any) {
          let current_parameter = class_parameters[raw_class.class_name][key];

          let parameter_offset =
            class_parameters[raw_class.class_name][key].offset - 1;
          let parameter_length =
            class_parameters[raw_class.class_name][key].length;

          let parameter_value;

          if (parameter_length > 0) {
            parameter_value = read_integer_from_asciicode_array(
              raw_class.raw,
              parameter_offset,
              parameter_length
            );
          } else {
            // variable length string
            parameter_value = read_string_from_asciicode_array(
              raw_class.raw,
              parameter_offset,
              parameter_length
            );
          }

          raw_class.class_parameters[current_parameter.name] = {};

          raw_class.class_parameters[current_parameter.name] = parameter_value;
        }
      }
    });
  }

  export function lua_function_to_human_map() {
    const res = new Map<string, string>();
    for (const key in grid_protocol) {
      if (typeof grid_protocol[key] === "object") {
        continue;
      }
      if (key.startsWith("GRID_LUA_FNC") && key.endsWith("_human")) {
        res.set(key.split("_human")[0], grid_protocol[key]);
      }
    }
    return res;
  }

  export function lua_function_forbiddens() {
    const res: string[] = [];
    for (const key in grid_protocol) {
      if (typeof grid_protocol[key] === "object") {
        continue;
      }
      if (key.startsWith("GRID_LUA_FNC") && key.endsWith("_short")) {
        res.push(grid_protocol[key]);
      }
    }
    return res;
  }

  export function get_lua_function_helper(fncKey: string): string | undefined {
    for (const key in grid_protocol) {
      if (typeof grid_protocol[key] === "object") {
        continue;
      }
      if (key.endsWith("_usage") && key.includes(fncKey)) {
        return grid_protocol[key];
      }
    }

    return undefined;
  }

  export function module_hwcfgs() {
    const res: any[] = [];
    for (const key in grid_protocol) {
      if (typeof grid_protocol[key] === "object") {
        continue;
      }

      if (key.startsWith("GRID_MODULE_")) {
        const split = key.split("_");
        res.push({
          type: ModuleType[split[2] as keyof typeof ModuleType],
          revision: split[3],
          hwcfg: grid_protocol[key],
        });
      }
    }

    return res;
  }

  export function is_element_compatible_with(
    element: ElementType,
    target: ElementType
  ): boolean {
    const filtredEvents = [EventType.SETUP, EventType.TIMER];

    const elementEvents = grid
      .get_element_events(element)
      .map((e) => e.desc as EventType)
      .filter((e) => !filtredEvents.includes(e as EventType));

    const configEvents = grid
      .get_element_events(target)
      .map((e) => e.desc as EventType)
      .filter((e) => !filtredEvents.includes(e as EventType));

    const compatibleEvents = elementEvents.reduce(
      (acc: EventType[], value: EventType) => {
        if (configEvents.includes(value)) {
          acc.push(value);
        }
        return acc;
      },
      []
    );

    return compatibleEvents.length === elementEvents.length;
  }
}
