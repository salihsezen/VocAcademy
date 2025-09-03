const fs = require('fs');
const text = fs.readFileSync('Words.csv','utf8');
function normalizeHeader(s){
  try {return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');} catch {return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'');}}
function parseCSVRows(text, delimiter=','){
  const rows=[]; let row=[]; let cur=''; let inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){
      if(inQuotes && text[i+1]==='"'){cur+='"'; i++;}
      else {inQuotes=!inQuotes;}
    } else if(ch===delimiter && !inQuotes){row.push(cur); cur='';}
    else if((ch==='\n'||ch==='\r') && !inQuotes){if(ch==='\r' && text[i+1]==='\n') i++; row.push(cur); rows.push(row.map(c=>c.trim())); row=[]; cur='';}
    else {cur+=ch;}
  }
  if(cur.length>0 || row.length>0){row.push(cur); rows.push(row.map(c=>c.trim()));}
  return rows.filter(r=>r.some(c=>c!=='')).map(r=>r.map(f=>{
    if(f.startsWith('"') && f.endsWith('"')) return f.slice(1,-1).replace(/""/g,'"');
    return f;
  }));
}
function parseCSV(csvText){
  const headerSample=(csvText||'').split(/\r?\n/)[0]||'';
  const comma=(headerSample.match(/,/g)||[]).length;
  const semi=(headerSample.match(/;/g)||[]).length;
  const delim = semi>comma?';':',';
  const rows=parseCSVRows(csvText,delim);
  const headers=rows[0].map(h=>h.trim());
  const normHeaders=headers.map(normalizeHeader);
  const findHeader=(cands)=>{for(const c of cands){const idx=normHeaders.indexOf(normalizeHeader(c)); if(idx!==-1) return idx;} return -1;};
  const headerMap={
    id: findHeader(['id','\ufeffid','#','index']),
    level: findHeader(['level','seviye','cefr']),
    word: findHeader(['word','kelime']),
    pos: findHeader(['type','pos','part of speech','partofspeech']),
    turkish: findHeader(['turkish','türkçe','turkce','tr','turkish meaning','turkish translation','meaning (tr)','meaningtr','translationtr']),
    en_meaning: findHeader(['english meaning','meaning','definition','en meaning','english']),
    en_example: findHeader(['english example','example','sentence','en example'])
  };
  const words=[];
  for(let i=1;i<rows.length;i++){
    const v=rows[i];
    const get=(idx,def='') => (idx>=0 && idx < v.length ? v[idx] : def) || def;
    const rec={
      id: parseInt(get(headerMap.id, `${i}`)) || i,
      level: get(headerMap.level,'A1-A2').trim(),
      word: get(headerMap.word,'').trim(),
      pos: get(headerMap.pos,'').trim(),
      turkish: get(headerMap.turkish,'').trim(),
      en_meaning: get(headerMap.en_meaning,'').trim(),
      en_example: get(headerMap.en_example,'').trim()
    };
    if(rec.word && rec.turkish) words.push(rec);
  }
  console.log({rows:rows.length, words:words.length});
  console.log(words.map(w=>w.id+':'+w.word+'|'+w.turkish).join('\n'));
}
parseCSV(text);
