(function(){
  window.parseXmlSafe = function(xmlStr){
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, 'application/xml');
      if (doc.getElementsByTagName('parsererror').length) return null;
      return doc;
    } catch(e){ return null; }
  };
  window.renderJsonTree = function(obj, container){
    container.innerHTML = '';
    const build = (key, value) => {
      const li = document.createElement('li');
      if (value !== null && typeof value === 'object'){
        const det = document.createElement('details');
        det.open = false;
        const sum = document.createElement('summary');
        const type = Array.isArray(value) ? 'Array' : 'Object';
        sum.textContent = (key !== undefined ? key + ': ' : '') + type;
        det.appendChild(sum);
        const ul = document.createElement('ul');
        const entries = Array.isArray(value) ? value.map((v,i)=>[i,v]) : Object.entries(value);
        entries.forEach(([k,v]) => ul.appendChild(build(k, v)));
        det.appendChild(ul);
        li.appendChild(det);
      } else {
        li.textContent = (key !== undefined ? key + ': ' : '') + String(value);
      }
      return li;
    };
    const rootUl = document.createElement('ul');
    rootUl.className = 'tree-root';
    if (obj !== null && typeof obj === 'object'){
      const entries = Array.isArray(obj) ? obj.map((v,i)=>[i,v]) : Object.entries(obj);
      entries.forEach(([k,v]) => rootUl.appendChild(build(k, v)));
    } else {
      rootUl.appendChild(build(undefined, obj));
    }
    container.appendChild(rootUl);
  };
  window.renderXmlTree = function(xmlDoc, container){
    container.innerHTML = '';
    const buildNode = (node) => {
      const li = document.createElement('li');
      if (node.nodeType === 1){
        const det = document.createElement('details');
        det.open = false;
        const sum = document.createElement('summary');
        sum.textContent = '<' + node.nodeName + '>';
        det.appendChild(sum);
        const ul = document.createElement('ul');
        if (node.attributes && node.attributes.length){
          Array.from(node.attributes).forEach(attr => {
            const ali = document.createElement('li');
            ali.textContent = '@' + attr.name + ': ' + attr.value;
            ul.appendChild(ali);
          });
        }
        Array.from(node.childNodes).forEach(ch => {
          if (ch.nodeType === 3){
            const text = ch.nodeValue.trim();
            if (text){
              const tli = document.createElement('li');
              tli.textContent = '#text: ' + text;
              ul.appendChild(tli);
            }
          } else {
            ul.appendChild(buildNode(ch));
          }
        });
        det.appendChild(ul);
        li.appendChild(det);
      } else if (node.nodeType === 9){
        const ul = document.createElement('ul');
        ul.appendChild(buildNode(node.documentElement));
        li.appendChild(ul);
      } else {
        li.textContent = String(node.nodeName);
      }
      return li;
    };
    const rootUl = document.createElement('ul');
    rootUl.className = 'tree-root';
    rootUl.appendChild(buildNode(xmlDoc));
    container.appendChild(rootUl);
  };
})();
