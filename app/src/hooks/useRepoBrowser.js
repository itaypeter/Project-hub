import { useState, useCallback, useEffect } from "react";
import {
  getTree,
  getFileContent,
  explainWithClaude,
} from "../api/github.js";

export function useRepoBrowser({ token, activeRepo, anthropicKey }) {
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);

  const loadTree = useCallback(async () => {
    if (!token || !activeRepo) return;
    const t = await getTree(token, activeRepo);
    setTree(t);
    setSelectedPath(null);
    setFileContent("");
    setExplanation("");
  }, [token, activeRepo]);

  useEffect(() => {
    setTree([]);
    setSelectedPath(null);
    setFileContent("");
    setExplanation("");
  }, [activeRepo]);

  const selectFile = useCallback(
    async (path) => {
      if (!token || !activeRepo) return;
      setSelectedPath(path);
      setFileContent("");
      setExplanation("");
      setExplaining(true);
      try {
        const content = await getFileContent(token, activeRepo, path);
        setFileContent(content);
        if (anthropicKey) {
          const exp = await explainWithClaude(path, content, anthropicKey);
          setExplanation(exp);
        }
      } catch (e) {
        setExplanation("Error: " + e.message);
      } finally {
        setExplaining(false);
      }
    },
    [token, activeRepo, anthropicKey]
  );

  const buildDisplayTree = useCallback(() => {
    const dirs = new Set();
    tree.forEach((item) => {
      const parts = item.path.split("/");
      for (let i = 1; i < parts.length; i++)
        dirs.add(parts.slice(0, i).join("/"));
    });
    return [
      ...Array.from(dirs).map((d) => ({ path: d, type: "tree" })),
      ...tree.filter((i) => i.type === "blob"),
    ].sort((a, b) => {
      const aDir = a.path.split("/").slice(0, -1).join("/");
      const bDir = b.path.split("/").slice(0, -1).join("/");
      if (aDir !== bDir) return a.path.localeCompare(b.path);
      if (a.type !== b.type) return (a.type === "tree" ? -1 : 1);
      return a.path.localeCompare(b.path);
    });
  }, [tree]);

  return {
    tree,
    selectedPath,
    fileContent,
    explanation,
    explaining,
    loadTree,
    selectFile,
    buildDisplayTree,
  };
}
