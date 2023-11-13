##
## This file is part of the libsigrokdecode project.
##
## Copyright (C) 2013-2016 Uwe Hermann <uwe@hermann-uwe.de>
## Copyright (C) 2016 Chris Dreher <chrisdreher@hotmail.com>
##
## This program is free software; you can redistribute it and/or modify
## it under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 2 of the License, or
## (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License
## along with this program; if not, see <http://www.gnu.org/licenses/>.
##

import sigrokdecode as srd
from .lists import *

import json

constant_value = "Foo"

RX = 0
TX = 1



class Decoder(srd.Decoder):
    api_version = 3
    id = 'grid-protocol'
    name = 'Grid Protocol'
    longname = 'Intech Studio Grid Protocol'
    desc = 'Decoder for the uart based communication between grid modules'
    license = 'gplv2+'
    inputs = ['uart']
    outputs = []
    tags = ['Audio', 'PC']
    options = (
        {'id': 'data_format', 'desc': 'Displayed data format','default': 'hex', 'values': ('hex', 'dec', 'char')},
    )
    annotations = (
        ('text-verbose', 'Text (verbose)'),
        ('text-sysreal-verbose', 'SysReal text (verbose)'),
        ('text-error', 'Error text'),
    )
    annotation_rows = (
        ('byte-level', 'Bytes', (0,)),
        ('section-level', 'Sections', (1,)),
        ('packet-level', 'Packets', (2,)),
    )

    def __init__(self):
        self.reset()

    def reset(self):
        self.ss = None
        self.es = None
        self.ss_block = None
        self.es_block = None

        self.section = {}
        self.section["data"] = []
        self.section["ss"] = -1
        self.section["es"] = -1
        self.section["target"] = 1
        self.section["delimiters"] = list(range(256))

        self.packet = {}
        self.packet["data"] = []
        self.packet["ss"] = -1
        self.packet["es"] = -1
        self.packet["target"] = 2
        self.packet["delimiters"] = [10]


    def start(self):
        self.out_ann = self.register(srd.OUTPUT_ANN)

    def putx(self, data):
        self.put(self.ss_block, self.es_block, self.out_ann, data)

    def part_push(self, part, ss, es, data):

        if len(part["data"]) == 0:
            part["ss"] = ss    

        part["data"].append(data)
        part["es"] = es

        if data in part["delimiters"]:

            result_string = self.options['data_format']+' '+constant_value+' '.join(map(str, part["data"]))
            self.put(part["ss"], part["es"], self.out_ann, [part["target"], [result_string]])
            part["ss"] = -1
            part["es"] = -1
            part["data"] = []

    def single_byte_decode(self, character):

        if character == 0x48:
            self.putx([0, ['SOH: 0x%02x' % character]])
        elif character == 0x65:
            self.putx([0, ['BRC: 0x%02x' % character]])
        elif character == 0x0a:
            self.putx([0, ['NL: 0x%02x' % character]])


    def decode(self, ss, es, data):
        ptype, rxtx, pdata = data

        # rxtx = 0: packet from RX line, 1: packet from TX line

        # For now, ignore all UART packets except the actual data packets.
        if ptype != 'DATA':
            return

        pdata = pdata[0]


       ## return

        self.part_push(self.section, ss, es, pdata)
        self.part_push(self.packet, ss, es, pdata)



        self.single_byte_decode(pdata)

        # if pdata % 2 == 0:
        #     self.putx([0, ['One: 0x%02x' % pdata]])
        # else:
        #     self.putx([2, ['Three: 0x%02x' % pdata]])

        # First param is annotation type

