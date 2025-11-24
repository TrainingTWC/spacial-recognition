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
import {
  BumpSessionAtom,
  ImageSentAtom,
  ImageSrcAtom,
  IsUploadedImageAtom,
} from './atoms';
import { useResetState } from './hooks';

export function SideControls() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const resetState = useResetState();

  return (
    <div className="mt-auto pt-4">
      <label className="flex items-center justify-center w-full py-3 bg-black text-white rounded-full cursor-pointer font-medium hover:opacity-90 transition-opacity">
        <input
          className="hidden"
          type="file"
          accept=".jpg, .jpeg, .png, .webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resetState();
                setImageSrc(e.target?.result as string);
                setIsUploadedImage(true);
                setImageSent(false);
                setBumpSession((prev) => prev + 1);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <span>Upload Image</span>
      </label>
    </div>
  );
}
