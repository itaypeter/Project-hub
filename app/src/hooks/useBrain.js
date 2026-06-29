import { useState, useCallback, useEffect } from "react";
import { getBrainWikiList, getBrainRawList, getBrainFile, pushRawNote } from "../api/github.js";

export function useBrain({ token, brainRepo }) {
  const [wikiFiles, setWikiFiles] = useState([]);
  const [rawCount, setRawCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [pushing, setPushing] = useState(false);

  const loadWiki = useCallback(async () => {
    if (!token || !brainRepo) return;
    setLoadingList(true);
    try {
      const [wiki, raw] = await Promise.all([
        getBrainWikiList(token, brainRepo),
        getBrainRawList(token, brainRepo),
      ]);
      setWikiFiles(wiki);
      setRawCount(raw.length);
    } finally {
      setLoadingList(false);
    }
  }, [token, brainRepo]);

  useEffect(() => {
    setWikiFiles([]);
    setRawCount(0);
    setSelectedFile(null);
    setFileContent("");
  }, [brainRepo]);

  const selectFile = useCallback(async (file) => {
    if (!token || !brainRepo) return;
    setSelectedFile(file);
    setFileContent("");
    setLoadingFile(true);
    try {
      const content = await getBrainFile(token, brainRepo, file.path);
      setFileContent(content);
    } finally {
      setLoadingFile(false);
    }
  }, [token, brainRepo]);

  const pushRaw = useCallback(async (note) => {
    if (!note.trim() || !token || !brainRepo) return false;
    setPushing(true);
    try {
      await pushRawNote(token, brainRepo, note);
      return true;
    } finally {
      setPushing(false);
    }
  }, [token, brainRepo]);

  return {
    wikiFiles,
    rawCount,
    selectedFile,
    fileContent,
    loadingList,
    loadingFile,
    pushing,
    loadWiki,
    selectFile,
    pushRaw,
  };
}
