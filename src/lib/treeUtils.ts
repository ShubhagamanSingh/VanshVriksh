/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyMember } from "../types";

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const findMemberById = (
  root: FamilyMember,
  id: string
): FamilyMember | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findMemberById(child, id);
    if (found) return found;
  }
  return null;
};

export const findParentOfMember = (
  root: FamilyMember,
  childId: string
): FamilyMember | null => {
  for (const child of root.children) {
    if (child.id === childId) return root;
    const parent = findParentOfMember(child, childId);
    if (parent) return parent;
  }
  return null;
};

export const addMember = (
  root: FamilyMember,
  parentId: string,
  newMember: Omit<FamilyMember, "id" | "children">
): FamilyMember => {
  const parent = findMemberById(root, parentId);
  if (parent) {
    const member: FamilyMember = {
      ...newMember,
      id: generateId(),
      children: [],
      parentId,
    };
    parent.children.push(member);
    return root;
  }
  return root;
};

export const updateMember = (
  root: FamilyMember,
  id: string,
  updates: Partial<FamilyMember>
): FamilyMember => {
  const member = findMemberById(root, id);
  if (member) {
    Object.assign(member, updates);
  }
  return root;
};

export const deleteMember = (root: FamilyMember, id: string): FamilyMember | null => {
  if (root.id === id) return null; // Cannot delete root
  const parent = findParentOfMember(root, id);
  if (parent) {
    parent.children = parent.children.filter((c) => c.id !== id);
  }
  return root;
};

export const searchMembers = (root: FamilyMember, query: string): FamilyMember[] => {
  const results: FamilyMember[] = [];
  const lowered = query.toLowerCase();
  
  const traverse = (node: FamilyMember) => {
    if (node.name.toLowerCase().includes(lowered)) {
      results.push(node);
    }
    node.children.forEach(traverse);
  };
  
  traverse(root);
  return results;
};

export const flattenTree = (root: FamilyMember): any[] => {
  const flat: any[] = [];
  const traverse = (node: FamilyMember, parentName?: string) => {
    flat.push({
      ID: node.id,
      Name: node.name,
      BirthDate: node.birthDate || "",
      DeathDate: node.deathDate || "",
      Bio: node.bio || "",
      ParentID: node.parentId || "",
      ParentName: parentName || "",
    });
    node.children.forEach(child => traverse(child, node.name));
  };
  traverse(root);
  return flat;
};

export const exportToJSON = (root: FamilyMember) => {
  const blob = new Blob([JSON.stringify(root, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `family_tree_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
};

export const exportToCSV = (root: FamilyMember) => {
  const flat = flattenTree(root);
  const headers = Object.keys(flat[0]);
  const csvContent = [
    headers.join(","),
    ...flat.map(row => headers.map(header => `"${(row[header] || "").toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `family_tree_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};
