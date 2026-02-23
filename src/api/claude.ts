export async function askStarKid(question: string): Promise<string> {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (data.error) {
      console.error('StarKid API error:', data.error);
      return 'The stars shimmer quietly. Sometimes the deepest answers need a moment to travel across space. Try once more.';
    }
    return data.answer;
  } catch (err) {
    console.error('Failed to reach StarKid:', err);
    return 'The stars shimmer quietly. Sometimes the deepest answers need a moment to travel across space. Try once more.';
  }
}
