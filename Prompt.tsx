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

import { GoogleGenAI } from '@google/genai';
import { useAtom } from 'jotai';
import getStroke from 'perfect-freehand';
import { useState } from 'react';
import {
  BoundingBoxMasksAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  CustomPromptsAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  IsLoadingAtom,
  LinesAtom,
  PointsAtom,
  PromptsAtom,
  ShareStream,
  TemperatureAtom,
  VideoRefAtom,
} from './atoms';
import { lineOptions } from './consts';
import { DetectTypes } from './Types';
import { getSvgPathFromStroke, loadImage } from './utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export function Prompt() {
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const [lines] = useAtom(LinesAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [showCustomPrompt] = useState(false);
  const [targetPrompt, setTargetPrompt] = useState('items');
  const [labelPrompt, setLabelPrompt] = useState('');
  const [segmentationLanguage, setSegmentationLanguage] = useState('English');
  const [showRawPrompt, setShowRawPrompt] = useState(false);

  const [prompts, setPrompts] = useAtom(PromptsAtom);
  const [customPrompts, setCustomPrompts] = useAtom(CustomPromptsAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);

  const is2d = detectType === '2D bounding boxes';

  const get2dPrompt = () =>
    `Detect ${targetPrompt}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and ${labelPrompt || 'a text label'
    } in "label".`;

  const getSegmentationPrompt = () => {
    const promptParts = prompts['Segmentation masks'];
    const prefix = promptParts[0];
    const items = promptParts[1]; // User-editable "items"
    let suffix = promptParts[2];

    const originalLabelInstruction =
      ' text label in the key "label". Use descriptive labels.';

    if (
      segmentationLanguage &&
      segmentationLanguage.trim() !== '' &&
      segmentationLanguage.toLowerCase() !== 'english'
    ) {
      if (suffix.endsWith(originalLabelInstruction)) {
        suffix = suffix.substring(
          0,
          suffix.length - originalLabelInstruction.length,
        );
      }
      suffix += ` text label in language ${segmentationLanguage} in the key "label". Use descriptive labels in ${segmentationLanguage}. Ensure labels are in ${segmentationLanguage}.  DO NOT USE ENGLISH FOR LABELS.`;
    }
    return `${prefix} ${items}${suffix}`;
  };

  const getGenericPrompt = (type: DetectTypes) => {
    if (!prompts[type] || prompts[type].length < 3)
      return prompts[type]?.join(' ') || '';
    const [p0, p1, p2] = prompts[type];
    return `${p0} ${p1}${p2}`;
  };

  async function handleSend() {
    setIsLoading(true);
    try {
      let activeDataURL;
      const maxSize = 640;
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d')!;

      if (stream) {
        // screenshare
        const video = videoRef.current!;
        const scale = Math.min(
          maxSize / video.videoWidth,
          maxSize / video.videoHeight,
        );
        copyCanvas.width = video.videoWidth * scale;
        copyCanvas.height = video.videoHeight * scale;
        ctx.drawImage(
          video,
          0,
          0,
          video.videoWidth * scale,
          video.videoHeight * scale,
        );
      } else if (imageSrc) {
        const image = await loadImage(imageSrc);
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        copyCanvas.width = image.width * scale;
        copyCanvas.height = image.height * scale;
        console.log(copyCanvas);
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      }
      activeDataURL = copyCanvas.toDataURL('image/png');

      if (lines.length > 0) {
        for (const line of lines) {
          const p = new Path2D(
            getSvgPathFromStroke(
              getStroke(
                line[0].map(([x, y]) => [
                  x * copyCanvas.width,
                  y * copyCanvas.height,
                  0.5,
                ]),
                lineOptions,
              ),
            ),
          );
          ctx.fillStyle = line[1];
          ctx.fill(p);
        }
        activeDataURL = copyCanvas.toDataURL('image/png');
      }

      const prompt = prompts[detectType];

      setHoverEntered(false);
      const config: {
        temperature: number;
        thinkingConfig?: { thinkingBudget: number };
      } = {
        temperature,
      };
      let model = 'models/gemini-2.5-flash';
      if (detectType === '3D bounding boxes') {
        // 3D works better with 2.0 Flash.
        model = 'models/gemini-2.0-flash';
      } else {
        // Disable thinking for 2.5 Flash, as recommended for spatial
        // understanding tasks.
        config['thinkingConfig'] = { thinkingBudget: 0 };
      }

      let textPromptToSend = '';
      if (is2d) {
        textPromptToSend = get2dPrompt();
      } else if (detectType === 'Segmentation masks') {
        textPromptToSend = getSegmentationPrompt();
      } else {
        textPromptToSend = getGenericPrompt(detectType);
      }
      let response = (
        await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: activeDataURL.replace('data:image/png;base64,', ''),
                    mimeType: 'image/png',
                  },
                },
                { text: textPromptToSend },
              ],
            },
          ],
          config: config as any,
        })
      ).text;

      if (response.includes('```json')) {
        response = response.split('```json')[1].split('```')[0];
      }
      const parsedResponse = JSON.parse(response);
      if (detectType === '2D bounding boxes') {
        const formattedBoxes = parsedResponse.map(
          (box: { box_2d: [number, number, number, number]; label: string }) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            return {
              x: xmin / 1000,
              y: ymin / 1000,
              width: (xmax - xmin) / 1000,
              height: (ymax - ymin) / 1000,
              label: box.label,
            };
          },
        );
        setHoverEntered(false);
        setBoundingBoxes2D(formattedBoxes);
      } else if (detectType === 'Points') {
        const formattedPoints = parsedResponse.map(
          (point: { point: [number, number]; label: string }) => {
            return {
              point: {
                x: point.point[1] / 1000,
                y: point.point[0] / 1000,
              },
              label: point.label,
            };
          },
        );
        setPoints(formattedPoints);
      } else if (detectType === 'Segmentation masks') {
        const formattedBoxes = parsedResponse.map(
          (box: {
            box_2d: [number, number, number, number];
            label: string;
            mask: ImageData;
          }) => {
            const [ymin, xmin, ymax, xmax] = box.box_2d;
            return {
              x: xmin / 1000,
              y: ymin / 1000,
              width: (xmax - xmin) / 1000,
              height: (ymax - ymin) / 1000,
              label: box.label,
              imageData: box.mask,
            };
          },
        );
        setHoverEntered(false);
        // sort largest to smallest
        const sortedBoxes = formattedBoxes.sort(
          (a: any, b: any) => b.width * b.height - a.width * a.height,
        );
        setBoundingBoxMasks(sortedBoxes);
      } else {
        const formattedBoxes = parsedResponse.map(
          (box: {
            box_3d: [
              number,
              number,
              number,
              number,
              number,
              number,
              number,
              number,
              number,
            ];
            label: string;
          }) => {
            const center = box.box_3d.slice(0, 3);
            const size = box.box_3d.slice(3, 6);
            const rpy = box.box_3d
              .slice(6)
              .map((x: number) => (x * Math.PI) / 180);
            return {
              center,
              size,
              rpy,
              label: box.label,
            };
          },
        );
        setBoundingBoxes3D(formattedBoxes);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="text-sm font-bold">Search For:</div>
      <div className="flex flex-col grow">
        {showCustomPrompt ? (
          <textarea
            className="w-full h-40 border-2 border-black rounded-xl p-3 resize-none focus:outline-none"
            value={customPrompts[detectType]}
            onChange={(e) => {
              const value = e.target.value;
              const newPrompts = { ...customPrompts };
              newPrompts[detectType] = value;
              setCustomPrompts(newPrompts);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
        ) : showRawPrompt ? (
          <div className="mb-2 text-gray-500 text-sm">
            {is2d
              ? get2dPrompt()
              : detectType === 'Segmentation masks'
                ? getSegmentationPrompt()
                : getGenericPrompt(detectType)}
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full">
            <textarea
              className="w-full h-40 border-2 border-black rounded-xl p-3 resize-none focus:outline-none text-sm"
              placeholder="What kind of things do you want to detect?"
              value={is2d ? targetPrompt : prompts[detectType][1]}
              onChange={(e) => {
                if (is2d) {
                  setTargetPrompt(e.target.value);
                } else {
                  const value = e.target.value;
                  const newPromptsState = { ...prompts };
                  if (!newPromptsState[detectType])
                    newPromptsState[detectType] = ['', '', ''];
                  newPromptsState[detectType][1] = value;
                  setPrompts(newPromptsState);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            {detectType === 'Segmentation masks' && (
              <textarea
                aria-label="Language for segmentation labels"
                className="w-full h-10 border-2 border-black rounded-xl p-2 resize-none focus:outline-none text-sm mt-2"
                placeholder="Language (e.g., Deutsch)"
                value={segmentationLanguage}
                onChange={(e) => setSegmentationLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
            )}
            {is2d && (
              <textarea
                className="w-full h-10 border-2 border-black rounded-xl p-2 resize-none focus:outline-none text-sm mt-2"
                placeholder="Label (optional)"
                value={labelPrompt}
                onChange={(e) => setLabelPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
            )}
          </div>
        )}
      </div>

      {/* Hidden controls that might be needed later or for debugging */}
      <div className="hidden">
        <label className="flex gap-2 select-none">
          <input
            type="checkbox"
            checked={showRawPrompt}
            onChange={() => setShowRawPrompt(!showRawPrompt)}
            disabled={isLoading}
          />
          <div>show raw prompt</div>
        </label>
        <label className="flex items-center gap-2">
          temperature:
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={isLoading}
          />
          {temperature.toFixed(2)}
        </label>
      </div>

      <button
        className={`w-full py-2 bg-transparent text-black font-bold border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSend}
        disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Prompt'}
      </button>
    </div>
  );
}
