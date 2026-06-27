const LOG_FILE = "project-log.json";

function authHeader({ user, pass } = {}) {
  if (!user || !pass) return {};
  return { Authorization: `Basic ${btoa(`${user}:${pass}`)}` };
}

function folderUrl(baseUrl, folder) {
  return `${baseUrl.replace(/\/$/, "")}/${folder}/${LOG_FILE}`;
}

export async function getLogWebDAV(baseUrl, credentials, folder) {
  try {
    const res = await fetch(folderUrl(baseUrl, folder), {
      headers: authHeader(credentials),
    });
    if (res.status === 404) return { log: { tasks: [], lastUpdated: null } };
    if (!res.ok) throw new Error(`WebDAV ${res.status}: ${res.statusText}`);
    const log = await res.json();
    return { log };
  } catch (e) {
    if (e.message.startsWith("WebDAV")) throw e;
    return { log: { tasks: [], lastUpdated: null } };
  }
}

export async function putLogWebDAV(baseUrl, credentials, folder, log) {
  const res = await fetch(folderUrl(baseUrl, folder), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(credentials),
    },
    body: JSON.stringify(log, null, 2),
  });
  if (!res.ok) throw new Error(`WebDAV ${res.status}: ${res.statusText}`);
}
