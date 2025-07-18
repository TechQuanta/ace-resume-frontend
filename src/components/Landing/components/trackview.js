const SCRIPT_URL = "";

export const trackView = async (question) => {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "view",
        question,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("View tracking failed:", err);
  }
};
