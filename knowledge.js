// The study library uses the same answers and references as the quiz.
export const normalizeSearch = value => String(value).normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g,'е');

export function buildKnowledgeIndex(topics, questions, groups, articles = []) {
  return topics.map(topic => {
    const entries = questions.filter(question => question.topic === topic.id);
    const group = groups.find(group => group.id === topic.group);
    const article = articles.find(article => article.topic === topic.id);
    const searchText = normalizeSearch([
      topic.id, topic.title, topic.original, group?.title,
      ...entries.flatMap(question => [question.text, question.options[question.answer], question.explanation, question.reference[0]]),
      article?.sourceTitle, ...(article?.notes||[]),
      ...(article?.blocks||[]).flatMap(block => [block.text||'',...(block.items||[]),...(block.rows||[]).flat()])
    ].join(' '));
    return {topic, entries, article, searchText};
  });
}

export function findKnowledgeTopics(index, query = '', group = 'all') {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  return index.filter(item => (group === 'all' || item.topic.group === group) && terms.every(term => item.searchText.includes(term)));
}
