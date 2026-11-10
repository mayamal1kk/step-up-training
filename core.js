export function shuffle(items, random=Math.random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function createRun(pool, mode='practice', limit=20, random=Math.random) {
  if(!pool.length) return null;
  const count=limit==='all'?pool.length:Math.min(Number(limit),pool.length);
  if(!Number.isInteger(count)||count<1) return null;
  const shuffled=shuffle(pool,random), selected=[], used=new Set(), coveredGroups=new Set(), coveredTopics=new Set();
  function add(q){if(selected.length<count&&!used.has(q.id)){selected.push(q);used.add(q.id);coveredGroups.add(q.group);coveredTopics.add(q.topic);}}
  for(const q of shuffled) if(!coveredGroups.has(q.group)) add(q);
  for(const q of shuffled) if(!coveredTopics.has(q.topic)) add(q);
  for(const q of shuffled) add(q);
  return {mode,entries:shuffle(selected,random).map(q=>({id:q.id,order:shuffle([0,1,2,3],random),choice:null,answered:false})),cursor:0,selected:null,startedAt:Date.now(),finished:false,reported:false};
}
export function isValidRun(run, questions) {
  if(!run||!['practice','exam','mistakes'].includes(run.mode)||!Array.isArray(run.entries)||!run.entries.length||!Number.isInteger(run.cursor)||run.cursor<0||run.cursor>=run.entries.length||(run.selected!==null&&(!Number.isInteger(run.selected)||run.selected<0||run.selected>3))) return false;
  const ids=new Set(questions.map(q=>q.id)), used=new Set();
  return run.entries.every(e=>{if(!ids.has(e.id)||used.has(e.id)||!Array.isArray(e.order)||e.order.length!==4||[...e.order].sort().join()!=='0,1,2,3'||(e.choice!==null&&(!Number.isInteger(e.choice)||e.choice<0||e.choice>3))||(e.answered&&e.choice===null))return false;used.add(e.id);return true;});
}
export function scoreRun(run, lookup) {
  const answered=run.entries.filter(e=>e.answered);
  const correct=answered.filter(e=>e.choice===lookup.get(e.id).answer).length;
  return {correct,total:run.entries.length,answered:answered.length,percent:Math.round(correct/run.entries.length*100)};
}
