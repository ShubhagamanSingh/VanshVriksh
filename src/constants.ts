/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyMember } from "./types";
import { generateId } from "./lib/treeUtils";

const rootId = generateId();
const p1Id = generateId();
const p2Id = generateId();

export const INITIAL_DATA: FamilyMember = {
  id: rootId,
  name: "Dada Ji (Grandfather)",
  birthDate: "1945-05-12",
  bio: "The patriarch of the Vansh.",
  children: [
    {
      id: p1Id,
      name: "Ramesh (Son)",
      birthDate: "1970-08-20",
      parentId: rootId,
      bio: "An engineer and traveler.",
      children: [
        {
          id: generateId(),
          name: "Aman (Grandson)",
          birthDate: "1998-11-05",
          parentId: p1Id,
          bio: "Software developer.",
          children: []
        },
        {
          id: generateId(),
          name: "Neha (Granddaughter)",
          birthDate: "2002-04-15",
          parentId: p1Id,
          bio: "Medical student.",
          children: []
        }
      ]
    },
    {
      id: p2Id,
      name: "Suresh (Son)",
      birthDate: "1975-02-10",
      parentId: rootId,
      bio: "A businessman by heart.",
      children: []
    }
  ]
};
