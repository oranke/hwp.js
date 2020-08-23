/**
 * Copyright 2020-Present Han Lee <hanlee.dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SectionTagID } from '../constants/tagID'
import Section from '../models/section'
import Paragraph from '../models/paragraph'
import HWPChar, { CharType } from '../models/char'
import ByteReader from '../utils/byteReader'
import ShapePointer from '../models/shapePointer'
import HWPRecord from '../models/record'
import parseRecord from './parseRecord'

class SectionParser {
  private record: HWPRecord

  private result: Section

  private currentParagraph: Paragraph = new Paragraph()

  private content: Paragraph[]

  constructor(data: Uint8Array) {
    this.record = parseRecord(data)
    this.result = new Section()
    this.content = this.result.content
  }

  visitPageDef(record: HWPRecord) {
    const reader = new ByteReader(record.payload)
    this.result.width = reader.readUInt32()
    this.result.height = reader.readUInt32()
    this.result.paddingLeft = reader.readUInt32()
    this.result.paddingRight = reader.readUInt32()
    this.result.paddingTop = reader.readUInt32()
    this.result.paddingBottom = reader.readUInt32()
    this.result.headerPadding = reader.readUInt32()
    this.result.footerPadding = reader.readUInt32()

    // TODO: (@hahnlee) 속성정보도 파싱하기
  }

  // TODO: (@hahnlee) mapper 패턴 사용하기
  visitParaText(record: HWPRecord) {
    const reader = new ByteReader(record.payload)

    let readByte = 0

    while (readByte < record.size) {
      const charCode = reader.readUInt16()

      switch (charCode) {
        // Char
        case 0:
        case 10:
        case 13: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Char, charCode),
          )
          readByte += 2
          break
        }

        // Inline
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 19:
        case 20: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Inline, charCode),
          )
          reader.skipByte(14)
          readByte += 16
          break
        }

        // Extened
        case 1:
        case 2:
        case 3:
        case 11:
        case 12:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 21:
        case 22:
        case 23: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Extened, charCode),
          )
          reader.skipByte(14)
          readByte += 16
          break
        }

        default: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Char, String.fromCharCode(charCode)),
          )
          readByte += 2
        }
      }
    }
  }

  visitCharShape(record: HWPRecord) {
    const reader = new ByteReader(record.payload)

    const shapePointer = new ShapePointer(
      reader.readUInt32(),
      reader.readUInt32(),
    )

    this.currentParagraph.shapeBuffer.push(shapePointer)
  }

  visit(record: HWPRecord) {
    switch (record.tagID) {
      case SectionTagID.HWPTAG_PARA_HEADER: {
        this.content.push(this.currentParagraph)
        this.currentParagraph = new Paragraph()
        break
      }

      case SectionTagID.HWPTAG_PAGE_DEF: {
        this.visitPageDef(record)
        break
      }

      case SectionTagID.HWPTAG_PARA_TEXT: {
        this.visitParaText(record)
        break
      }

      case SectionTagID.HWPTAG_PARA_CHAR_SHAPE: {
        this.visitCharShape(record)
        break
      }

      default:
        break
    }
  }

  traverse(record: HWPRecord) {
    const { children } = record
    const { length } = children

    if (record.tagID) {
      this.visit(record)
    }

    for (let i = 0; i < length; i += 1) {
      this.traverse(children[i])
    }
  }

  parse(): Section {
    this.traverse(this.record)
    return this.result
  }
}

export default SectionParser