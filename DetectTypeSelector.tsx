/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useAtom } from 'jotai';
import { DetectTypeAtom, HoverEnteredAtom } from './atoms';
import { DetectTypes } from './Types';

const DETECTION_TYPES = [
  '2D bounding boxes',
  'Segmentation masks',
  'Points',
  '3D bounding boxes',
] as const;

export function DetectTypeSelector() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-bold mb-2">Detection Type</div>
      <div className="flex flex-col gap-1">
        {DETECTION_TYPES.map((label) => (
          <SelectOption key={label} label={label} />
        ))}
      </div>
    </div>
  );
}

function SelectOption({ label }: { label: string }) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const isActive = detectType === label;

  return (
    <button
      className={`text-left py-1 text-sm ${isActive ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
        }`}
      onClick={() => {
        setHoverEntered(false);
        setDetectType(label as DetectTypes);
      }}>
      {label === '2D bounding boxes' ? 'Boxes' :
        label === 'Segmentation masks' ? 'Segments' :
          label === '3D bounding boxes' ? '3D Boxes' : label}
    </button>
  );
}
