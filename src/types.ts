/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  bio?: string;
  children: FamilyMember[];
  parentId?: string;
}

export interface SearchResult {
  member: FamilyMember;
  path: string[]; // IDs of parents up to root
}
