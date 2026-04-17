/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyMember } from "./types";
import { generateId } from "./lib/treeUtils";

const rootId = generateId();

export const INITIAL_DATA: FamilyMember = {
  id: rootId,
  name: "Root Ancestor",
  birthDate: "",
  bio: "The beginning of the lineage.",
  children: []
};
