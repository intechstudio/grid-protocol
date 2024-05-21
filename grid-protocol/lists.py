# Generated Python code from JSON

character_lookup = {
  "0": "NUL",
  "1": "SOH",
  "2": "STX",
  "3": "ETX",
  "23": "EOB",
  "4": "EOT",
  "10": "LF",
  "6": "ACK",
  "21": "NAK",
  "24": "CAN",
  "17": "NORTH",
  "18": "EAST",
  "19": "SOUTH",
  "20": "WEST",
  "14": "DCT",
  "15": "BRC",
  "7": "BELL"
}
# Generated Python code from JSON

class_database = {
  "MIDI": {
    "class_name": "MIDI",
    "class_code": 0,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "CHANNEL": {
        "offset": 5,
        "length": 2
      },
      "COMMAND": {
        "offset": 7,
        "length": 2
      },
      "PARAM1": {
        "offset": 9,
        "length": 2
      },
      "PARAM2": {
        "offset": 11,
        "length": 2
      }
    }
  },
  "MIDISYSEX": {
    "class_name": "MIDISYSEX",
    "class_code": 1,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LENGTH": {
        "offset": 5,
        "length": 4
      },
      "PAYLOAD": {
        "offset": 9,
        "length": 2
      }
    }
  },
  "HEARTBEAT": {
    "class_name": "HEARTBEAT",
    "class_code": 16,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "TYPE": {
        "offset": 5,
        "length": 2
      },
      "HWCFG": {
        "offset": 7,
        "length": 2
      },
      "VMAJOR": {
        "offset": 9,
        "length": 2
      },
      "VMINOR": {
        "offset": 11,
        "length": 2
      },
      "VPATCH": {
        "offset": 13,
        "length": 2
      },
      "PORTSTATE": {
        "offset": 15,
        "length": 2
      }
    }
  },
  "SERIALNUMBER": {
    "class_name": "SERIALNUMBER",
    "class_code": 17,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "WORD0": {
        "offset": 5,
        "length": 8
      },
      "WORD1": {
        "offset": 13,
        "length": 8
      },
      "WORD2": {
        "offset": 21,
        "length": 8
      },
      "WORD3": {
        "offset": 29,
        "length": 8
      }
    }
  },
  "RESETCAUSE": {
    "class_name": "RESETCAUSE",
    "class_code": 18,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "CAUSE": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "RESET": {
    "class_name": "RESET",
    "class_code": 19,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      }
    }
  },
  "UPTIME": {
    "class_name": "UPTIME",
    "class_code": 20,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "UPTIME": {
        "offset": 5,
        "length": 8
      }
    }
  },
  "DEBUGTEXT": {
    "class_name": "DEBUGTEXT",
    "class_code": 32,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "TEXT": {
        "offset": 5,
        "length": 0
      }
    }
  },
  "DEBUGTASK": {
    "class_name": "DEBUGTASK",
    "class_code": 33,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LENGTH": {
        "offset": 5,
        "length": 4
      },
      "OUTPUT": {
        "offset": 9,
        "length": 0
      }
    }
  },
  "WEBSOCKET": {
    "class_name": "WEBSOCKET",
    "class_code": 34,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "TEXT": {
        "offset": 5,
        "length": 0
      }
    }
  },
  "PACKAGE": {
    "class_name": "PACKAGE",
    "class_code": 35,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "TEXT": {
        "offset": 5,
        "length": 0
      }
    }
  },
  "PAGEACTIVE": {
    "class_name": "PAGEACTIVE",
    "class_code": 48,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "PAGENUMBER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "PAGECOUNT": {
    "class_name": "PAGECOUNT",
    "class_code": 49,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "PAGENUMBER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "LEDPREVIEW": {
    "class_name": "LEDPREVIEW",
    "class_code": 66,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LENGTH": {
        "offset": 5,
        "length": 4
      },
      "NUM": {
        "offset": 9,
        "length": 2
      },
      "RED": {
        "offset": 11,
        "length": 2
      },
      "GRE": {
        "offset": 13,
        "length": 2
      },
      "BLU": {
        "offset": 15,
        "length": 2
      }
    }
  },
  "EVENT": {
    "class_name": "EVENT",
    "class_code": 80,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "PAGENUMBER": {
        "offset": 5,
        "length": 2
      },
      "ELEMENTNUMBER": {
        "offset": 7,
        "length": 2
      },
      "EVENTTYPE": {
        "offset": 9,
        "length": 2
      },
      "EVENTPARAM1": {
        "offset": 11,
        "length": 2
      },
      "EVENTPARAM2": {
        "offset": 13,
        "length": 2
      }
    }
  },
  "EVENTPREVIEW": {
    "class_name": "EVENTPREVIEW",
    "class_code": 81,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LENGTH": {
        "offset": 5,
        "length": 4
      },
      "NUM": {
        "offset": 9,
        "length": 2
      },
      "VALUE": {
        "offset": 11,
        "length": 2
      }
    }
  },
  "ELEMENTNAME": {
    "class_name": "ELEMENTNAME",
    "class_code": 82,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "NUM": {
        "offset": 5,
        "length": 2
      },
      "LENGTH": {
        "offset": 7,
        "length": 2
      },
      "NAME": {
        "offset": 9,
        "length": 0
      }
    }
  },
  "CONFIG": {
    "class_name": "CONFIG",
    "class_code": 96,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      },
      "VERSIONMAJOR": {
        "offset": 5,
        "length": 2
      },
      "VERSIONMINOR": {
        "offset": 7,
        "length": 2
      },
      "VERSIONPATCH": {
        "offset": 9,
        "length": 2
      },
      "PAGENUMBER": {
        "offset": 11,
        "length": 2
      },
      "ELEMENTNUMBER": {
        "offset": 13,
        "length": 2
      },
      "EVENTTYPE": {
        "offset": 15,
        "length": 2
      },
      "ACTIONLENGTH": {
        "offset": 17,
        "length": 4
      },
      "ACTIONSTRING": {
        "offset": 21,
        "length": 0
      }
    }
  },
  "PAGESTORE": {
    "class_name": "PAGESTORE",
    "class_code": 97,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "NVMERASE": {
    "class_name": "NVMERASE",
    "class_code": 98,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "PAGEDISCARD": {
    "class_name": "PAGEDISCARD",
    "class_code": 99,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "PAGECLEAR": {
    "class_name": "PAGECLEAR",
    "class_code": 100,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "NVMDEFRAG": {
    "class_name": "NVMDEFRAG",
    "class_code": 101,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "LASTHEADER": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "IMMEDIATE": {
    "class_name": "IMMEDIATE",
    "class_code": 133,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "ACTIONLENGTH": {
        "offset": 5,
        "length": 4
      },
      "ACTIONSTRING": {
        "offset": 9,
        "length": 0
      }
    }
  },
  "HIDKEYSTATUS": {
    "class_name": "HIDKEYSTATUS",
    "class_code": 144,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "ISENABLED": {
        "offset": 5,
        "length": 2
      }
    }
  },
  "HIDKEYBOARD": {
    "class_name": "HIDKEYBOARD",
    "class_code": 145,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "DEFAULTDELAY": {
        "offset": 5,
        "length": 2
      },
      "LENGTH": {
        "offset": 7,
        "length": 2
      },
      "KEYISMODIFIER": {
        "offset": 9,
        "length": 1
      },
      "KEYSTATE": {
        "offset": 10,
        "length": 1
      },
      "KEYCODE": {
        "offset": 11,
        "length": 2
      },
      "DELAY": {
        "offset": 10,
        "length": 3
      }
    }
  },
  "HIDMOUSEMOVE": {
    "class_name": "HIDMOUSEMOVE",
    "class_code": 146,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "AXIS": {
        "offset": 5,
        "length": 2
      },
      "POSITION": {
        "offset": 7,
        "length": 2
      }
    }
  },
  "HIDMOUSEBUTTON": {
    "class_name": "HIDMOUSEBUTTON",
    "class_code": 147,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "BUTTON": {
        "offset": 5,
        "length": 2
      },
      "STATE": {
        "offset": 7,
        "length": 2
      }
    }
  },
  "HIDGAMEPADMOVE": {
    "class_name": "HIDGAMEPADMOVE",
    "class_code": 148,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "AXIS": {
        "offset": 5,
        "length": 2
      },
      "POSITION": {
        "offset": 7,
        "length": 2
      }
    }
  },
  "HIDGAMEPADBUTTON": {
    "class_name": "HIDGAMEPADBUTTON",
    "class_code": 149,
    "class_params": {
      "INSTRUCTION": {
        "offset": 3,
        "length": 1
      },
      "BUTTON": {
        "offset": 5,
        "length": 2
      },
      "STATE": {
        "offset": 7,
        "length": 2
      }
    }
  }
}