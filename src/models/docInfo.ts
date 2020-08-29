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

import CharShape from './charShape'
import FontFace from './fontFace'
import BinData from './binData'
import BorderFill from './borderFill'

class DocInfo {
  sectionSize: number = 0

  charShapes: CharShape[] = []

  fontFaces: FontFace[] = []

  binData: BinData[] = []

  borderFills: BorderFill[] = []

  getCharShpe(index: number): CharShape | undefined {
    return this.charShapes[index]
  }
}

export default DocInfo
