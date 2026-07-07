import { useState, useCallback } from "react";
import { getGuideFile, saveGuideFile, generateGuide } from "../api/github.js";

export function useGuide({ token, activeRepo, anthropicKey }) {
  const [guide, setGuide] = useState(null);
  const [guideSha, setGuideSha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const loadGuide = useCallback(async () => {
    if (!token || !activeRepo) return;
    setLoading(true);
    setError(null);
    try {
      const { content, sha } = await getGuideFile(token, activeRepo);
      setGuide(content);
      setGuideSha(sha);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, activeRepo]);

  const regenerate = useCallback(async () => {
    if (!token || !activeRepo || !anthropicKey || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const text = await generateGuide(token, activeRepo, anthropicKey);
      const newSha = await saveGuideFile(token, activeRepo, text, guideSha);
      setGuide(text);
      setGuideSha(newSha);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }, [token, activeRepo, anthropicKey, guideSha, generating]);

  return { guide, loading, generating, error, loadGuide, regenerate };
}
