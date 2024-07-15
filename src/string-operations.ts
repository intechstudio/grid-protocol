import { grid } from "./grid-protocol";
import { formatText } from "@intechstudio/grid-luafmt";
// @ts-ignore
import * as luamin from "luamin";

const minify: any = luamin.minify;

class GridValidator {
  public regex_short: any = {};
  public regex_human: any = {};
  public lookup: any[] = [];
  public function_types: any[] = [];

  constructor(inputSet: any[] = []) {
    let regex_short: any = {};
    let regex_human: any = {};
    let lookup: any[] = [];

    // create type fields for different lua parts
    let newarr = [inputSet[0].type];
    for (let i = 1; i < inputSet.length; i++) {
      if (inputSet[i].type != inputSet[i - 1].type)
        newarr.push(inputSet[i].type);
    }

    // make human readable and short regex groups
    newarr.forEach((type, i) => {
      regex_human[type] = inputSet
        .filter((obj) => obj.type === type)
        .map((v) =>
          type == "arithmetic_operator" ||
          type == "relational_operator"
            ? `${"\\" + v.human}`
            : `${"\\b" + v.human + "\\b"}`
        )
        .join("|");
      regex_short[type] = inputSet
        .filter((obj) => obj.type === type)
        .map((v) =>
          type == "arithmetic_operator" ||
          type == "relational_operator"
            ? `${"\\" + v.short}`
            : `${"\\b" + v.short + "\\b"}`
        )
        .join("|");
      lookup[i] = inputSet
        .filter((obj) => obj.type === type)
        .map((v) => {
          return { short: v.short, human: v.human };
        });
    });

    let function_types: any[] = [];
    for (const key in regex_human) {
      function_types.push(key);
    }

    this.regex_short = regex_short;
    this.regex_human = regex_human;
    this.lookup = [].concat(...lookup);
    this.function_types = function_types;
  }
}

export class GridScript {
  static validator: any = new GridValidator(
    grid.getProperty("LUA")
  );
  static splitShortScript(
    script: string,
    mode: "short" | "human"
  ) {
    let lookupType: string;

    switch (mode) {
      case "short":
        lookupType = "regex_short";
        break;
      case "human":
        lookupType = "regex_human";
        break;
    }

    let pattern: string[] = [];

    for (const key in GridScript.validator[lookupType]) {
      pattern.push(
        `${
          "(?<" +
          key +
          ">" +
          GridScript.validator[lookupType][key] +
          ")"
        }`
      );
    }

    // for "," in functions
    pattern.push(`${"(?<separator>(,))"}`);
    // for parenthesis ")" "("
    pattern.push(
      `${"(?<parenthesis>([\\)\\(\\]\\[\\}\\{]))"}`
    );
    // if its a simple integer
    pattern.push(`${"(?<integer>([+-]?[1-9]\\d*|0))"}`);
    // if its if-then-end
    pattern.push(
      `${"(?<ifblock>(\\bif\\b|\\bthen\\b|\\bend\\b))"}`
    );
    // if its new line or space
    pattern.push(`${"(?<space>([\\s\\n]))"}`);
    // if its special
    pattern.push(
      `${"(?<special>(\\blocal\\b|[=._@:;'\"`~|^<>&#]))"}`
    );
    // if its backslash
    pattern.push(`${"(?<backslash>(\\\\))"}`);
    // if unknown
    pattern.push(`${"(?<other>([a-zA-Z]+))"}`);
    // create full pattern
    const regExPattern = pattern.join("|");

    const regex = new RegExp(regExPattern, "g");

    let m: any;
    let arr: any[] = [];
    while ((m = regex.exec(script)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      for (const key in m.groups) {
        if (m.groups[key] !== undefined) {
          arr.push({ type: key, value: m.groups[key] });
        }
      }
    }
    return arr;
  }

  static humanize(script: string) {
    // We should heaviliy consider handling spaces and returns better!
    const splitArray = GridScript.splitShortScript(
      script,
      "short"
    );
    const humanized = GridScript.splitArrayToString(
      splitArray,
      "human"
    );
    return humanized;
  }

  static shortify(script: string) {
    // We should heaviliy consider handling spaces and returns better!
    const splitArray = GridScript.splitShortScript(
      script,
      "human"
    );
    const shorted = GridScript.splitArrayToString(
      splitArray,
      "short"
    );
    return shorted;
  }

  static typeCheck(type: string, value: string) {
    let bool = false;

    const blacklist = ["if", "else", "elseif", "end"];

    if (
      GridScript.validator.function_types.includes(type) &&
      !blacklist.includes(value)
    ) {
      bool = true;
    }

    return bool;
  }

  static splitArrayToString(
    splitArray: any[],
    direction: string
  ) {
    let returnFormat: string;
    let lookupFormat: string;

    switch (direction) {
      case "human": {
        returnFormat = "human";
        lookupFormat = "short";
        break;
      }
      case "short": {
        returnFormat = "short";
        lookupFormat = "human";
        break;
      }
    }

    let string = "";

    splitArray.forEach((element) => {
      const found = GridScript.validator.lookup.find(
        (lookup_element: any) =>
          lookup_element[lookupFormat] == element.value
      );

      try {
        if (
          GridScript.typeCheck(element.type, element.value)
        ) {
          string += `${found[returnFormat]}`;
        } else {
          string += element.value;
        }
      } catch (error) {
        console.warn(
          `Could not ${returnFormat}ize section!`,
          element
        );

        string += element.value;
      }
    });

    return string;
  }

  static minifyScript(value: string) {
    var code = value;
    const minified = minify(code);
    return minified;
  }

  static compressScript(script: string) {
    const short = GridScript.shortify(script);
    const minified = GridScript.minifyScript(short);
    return minified.trim();
  }

  static expandScript(script: string) {
    const human = GridScript.humanize(script);
    const formatted = formatText(human);
    return formatted.trim();
  }

  static checkSyntax(script: string) {
    try {
      formatText(script);
      return true;
    } catch (e) {
      return false;
    }
  }
}
